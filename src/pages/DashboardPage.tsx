// ============================================================
// DashboardPage — Página de inicio
// ============================================================

import { useNavigate } from 'react-router-dom';
import { DashboardHome } from '../components/dashboard/DashboardHome';

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleNavigate = (module: 'persons' | 'company-settings') => {
    navigate(module === 'persons' ? '/persons' : '/settings');
  };

  return <DashboardHome onNavigate={handleNavigate} />;
}
