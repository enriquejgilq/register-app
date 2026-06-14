// ============================================================
// CompanySettingsPage — Preferencias del usuario y ajustes de empresa
// ============================================================

import { Box } from '@mui/material';
import { CompanySettings } from '../components/company/CompanySettings';
import { UserPreferences } from '../components/company/UserPreferences';

export default function CompanySettingsPage() {
  return (
    <Box>
      <UserPreferences />
      <CompanySettings />
    </Box>
  );
}
