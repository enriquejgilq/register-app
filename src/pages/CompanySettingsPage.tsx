// ============================================================
// CompanySettingsPage — Ajustes de empresa (solo admins)
// ============================================================

import { Navigate } from 'react-router-dom';
import { CompanySettings } from '../components/company/CompanySettings';
import { useAuthStore } from '../store/authStore';

export default function CompanySettingsPage() {
  const { userProfile } = useAuthStore();

  if (userProfile && userProfile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <CompanySettings />;
}
