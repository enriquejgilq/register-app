// ============================================================
// Company Model — Estructura multiempresa (multitenant)
// ============================================================

export interface Company {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  ownerId: string;
  address?: string;
  phone?: string;
  contactEmail?: string;
  taxId?: string;
}

export type UserRole = 'admin' | 'collaborator';
export type ThemeMode = 'light' | 'dark';

export interface CompanyUser {
  uid: string;
  email: string;
  name: string;
  companyId: string;
  role: UserRole;
  createdAt: string; // ISO date string
  themePreference?: ThemeMode;
}

export interface Invitation {
  email: string; // ID del documento
  companyId: string;
  companyName: string;
  invitedBy: string; // UID del administrador
  role: UserRole;
  status: 'pending' | 'accepted';
  createdAt: string; // ISO date string
}
