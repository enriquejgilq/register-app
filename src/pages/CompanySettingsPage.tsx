// ============================================================
// CompanySettingsPage — Preferencias del usuario y ajustes de empresa
// ============================================================

import { Container } from '@mui/material';
import { CompanySettings } from '../components/company/CompanySettings';
import { UserPreferences } from '../components/company/UserPreferences';

export default function CompanySettingsPage() {
  return (
    <Container maxWidth="xl" disableGutters sx={{ width: '100%' }}>
      <UserPreferences />
      <CompanySettings />
    </Container>
  );
}
