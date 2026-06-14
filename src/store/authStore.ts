// ============================================================
// Auth Store — Zustand para gestionar autenticación y multiempresa
// ============================================================

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Company, CompanyUser, UserRole, Invitation, ThemeMode } from '../models/Company';

// Importación diferida para evitar dependencia circular
const clearPersonStore = () => {
  // Limpiar el store de personas al cerrar sesión (evita fuga de datos entre usuarios)
  try {
    const { usePersonStore } = require('../store/personStore');
    usePersonStore.getState().setError(null);
    usePersonStore.setState({ persons: [] });
  } catch {
    // No hacer nada si el store no está disponible
  }
};

interface AuthState {
  user: FirebaseUser | null;
  userProfile: CompanyUser | null;
  company: Company | null;
  collaborators: CompanyUser[];
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

interface AuthActions {
  initializeAuth: () => () => void; // Retorna la función de desuscripción
  login: (email: string, pass: string) => Promise<void>;
  registerUser: (email: string, pass: string, name: string, companyName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkInvitation: (email: string) => Promise<Invitation | null>;
  inviteCollaborator: (email: string, role: UserRole) => Promise<void>;
  fetchCollaborators: () => Promise<void>;
  updateCompanyName: (name: string) => Promise<void>;
  updateCompanyInfo: (data: Partial<Pick<Company, 'address' | 'phone' | 'contactEmail' | 'taxId'>>) => Promise<void>;
  updateThemePreference: (mode: ThemeMode) => Promise<void>;
  setError: (err: string | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  userProfile: null,
  company: null,
  collaborators: [],
  isLoading: false,
  isInitializing: true,
  error: null,

  setError: (error) => set({ error }),

  // Inicializar observador de Firebase Auth
  initializeAuth: () => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        set({ user: firebaseUser, isLoading: true });
        try {
          // Obtener el perfil del usuario de Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const profile = userDoc.data() as CompanyUser;
            set({ userProfile: profile });

            // Obtener datos de la empresa
            const companyDoc = await getDoc(doc(db, 'companies', profile.companyId));
            if (companyDoc.exists()) {
              set({ company: companyDoc.data() as Company });
            } else {
              set({ company: null });
            }
          } else {
            // Usuario autenticado en Auth pero sin documento de perfil en Firestore (caso raro o interrupción)
            set({ userProfile: null, company: null });
          }
        } catch (err) {
          console.error('Error al inicializar el usuario:', err);
          set({ error: 'Error al sincronizar datos del perfil.' });
        } finally {
          set({ isLoading: false, isInitializing: false });
        }
      } else {
        // No autenticado
        set({
          user: null,
          userProfile: null,
          company: null,
          collaborators: [],
          isLoading: false,
          isInitializing: false,
        });
      }
    });
  },

  // Iniciar Sesión
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const firebaseError = err as { code?: string };
      let friendlyMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      if (
        firebaseError.code === 'auth/user-not-found' ||
        firebaseError.code === 'auth/wrong-password' ||
        firebaseError.code === 'auth/invalid-credential'
      ) {
        friendlyMessage = 'Correo o contraseña incorrectos.';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        friendlyMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
      }
      set({ error: friendlyMessage });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Registrar un Usuario (y opcionalmente crear Empresa)
  registerUser: async (email, password, name, companyName) => {
    set({ isLoading: true, error: null });
    try {
      const emailLower = email.toLowerCase().trim();

      // 1. Validar si existe invitación pendiente
      const inviteRef = doc(db, 'invitations', emailLower);
      const inviteSnap = await getDoc(inviteRef);
      const invitation = inviteSnap.exists() ? (inviteSnap.data() as Invitation) : null;
      const hasPendingInvite = invitation && invitation.status === 'pending';

      if (!hasPendingInvite && !companyName) {
        throw new Error('Debes proporcionar el nombre de la empresa a crear.');
      }

      // 2. Crear usuario en Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      let targetCompanyId = '';

      if (hasPendingInvite && invitation) {
        // Unirse a empresa invitada
        targetCompanyId = invitation.companyId;

        // Crear perfil del colaborador
        const newUserProfile: CompanyUser = {
          uid: firebaseUser.uid,
          email: emailLower,
          name: name.trim(),
          companyId: targetCompanyId,
          role: invitation.role,
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUserProfile);

        // Actualizar el estado de la invitación
        await updateDoc(inviteRef, {
          status: 'accepted',
        });
      } else {
        // Crear una nueva empresa (el usuario será Administrador)
        const companyColRef = collection(db, 'companies');
        const newCompanyDoc = doc(companyColRef);
        targetCompanyId = newCompanyDoc.id;

        const newCompany: Company = {
          id: targetCompanyId,
          name: companyName!.trim(),
          createdAt: new Date().toISOString(),
          ownerId: firebaseUser.uid,
        };

        await setDoc(newCompanyDoc, newCompany);

        // Crear perfil del usuario administrador
        const newUserProfile: CompanyUser = {
          uid: firebaseUser.uid,
          email: emailLower,
          name: name.trim(),
          companyId: targetCompanyId,
          role: 'admin',
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUserProfile);
      }

      // El observador onAuthStateChanged cargará el estado actualizado
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      let friendlyMessage = firebaseError.message || 'Error al registrar el usuario.';
      if (firebaseError.code === 'auth/email-already-in-use') {
        friendlyMessage = 'El correo electrónico ya está registrado.';
      } else if (firebaseError.code === 'auth/weak-password') {
        friendlyMessage = 'La contraseña debe tener al menos 6 caracteres.';
      }
      set({ error: friendlyMessage });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Cerrar Sesión
  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Recuperar Contraseña
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const firebaseError = err as { code?: string };
      let friendlyMessage = 'Error al enviar el correo de recuperación.';
      if (firebaseError.code === 'auth/user-not-found') {
        friendlyMessage = 'No existe un usuario con este correo electrónico.';
      }
      set({ error: friendlyMessage });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Consultar si hay una invitación pendiente para un correo
  checkInvitation: async (email) => {
    try {
      const emailLower = email.toLowerCase().trim();
      const inviteDoc = await getDoc(doc(db, 'invitations', emailLower));
      if (inviteDoc.exists()) {
        const data = inviteDoc.data() as Invitation;
        if (data.status === 'pending') {
          return data;
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  // Invitar a un Colaborador (solo Admins)
  inviteCollaborator: async (email, role) => {
    const { company, userProfile } = get();
    if (!company || !userProfile || userProfile.role !== 'admin') {
      throw new Error('No tienes permisos para realizar invitaciones.');
    }

    set({ isLoading: true, error: null });
    try {
      const emailLower = email.toLowerCase().trim();
      
      const invitation: Invitation = {
        email: emailLower,
        companyId: company.id,
        companyName: company.name,
        invitedBy: userProfile.uid,
        role: role,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'invitations', emailLower), invitation);
    } catch (err) {
      console.error('Error al crear invitación:', err);
      set({ error: 'Error al enviar la invitación. Inténtalo de nuevo.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Cargar lista de colaboradores de la empresa
  fetchCollaborators: async () => {
    const { company } = get();
    if (!company) return;

    set({ isLoading: true });
    try {
      const q = query(collection(db, 'users'), where('companyId', '==', company.id));
      const querySnapshot = await getDocs(q);
      const list: CompanyUser[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CompanyUser);
      });
      set({ collaborators: list });
    } catch (err) {
      console.error('Error al cargar colaboradores:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Modificar Nombre de la Empresa (solo Admins)
  updateCompanyName: async (name) => {
    const { company, userProfile } = get();
    if (!company || !userProfile || userProfile.role !== 'admin') {
      throw new Error('No tienes permisos para modificar el nombre de la empresa.');
    }

    set({ isLoading: true, error: null });
    try {
      const trimmedName = name.trim();
      await updateDoc(doc(db, 'companies', company.id), { name: trimmedName });
      set({ company: { ...company, name: trimmedName } });
    } catch (err) {
      console.error('Error al actualizar nombre de empresa:', err);
      set({ error: 'No se pudo actualizar el nombre de la empresa.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Modificar Datos de Contacto de la Empresa (solo Admins)
  updateCompanyInfo: async (data) => {
    const { company, userProfile } = get();
    if (!company || !userProfile || userProfile.role !== 'admin') {
      throw new Error('No tienes permisos para modificar los datos de la empresa.');
    }

    set({ isLoading: true, error: null });
    try {
      const updates = {
        address: data.address?.trim() ?? '',
        phone: data.phone?.trim() ?? '',
        contactEmail: data.contactEmail?.trim() ?? '',
        taxId: data.taxId?.trim() ?? '',
      };
      await updateDoc(doc(db, 'companies', company.id), updates);
      set({ company: { ...company, ...updates } });
    } catch (err) {
      console.error('Error al actualizar datos de la empresa:', err);
      set({ error: 'No se pudieron actualizar los datos de la empresa.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Guardar preferencia de tema del usuario
  updateThemePreference: async (mode) => {
    const { userProfile } = get();
    if (!userProfile) return;

    set({ userProfile: { ...userProfile, themePreference: mode } });
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), { themePreference: mode });
    } catch (err) {
      console.error('Error al guardar la preferencia de tema:', err);
    }
  },
}));
