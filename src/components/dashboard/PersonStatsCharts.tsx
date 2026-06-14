// ============================================================
// PersonStatsCharts — Gráficas de torta: registros diarios,
// semanales y mensuales
// ============================================================

import React from 'react';
import { Box, Card, CardContent, Grid, Typography, alpha } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import type { Person } from '../../models/Person';
import { getPersonStats } from '../../utils/personStats';

interface PersonStatsChartsProps {
  persons: Person[];
}

interface StatCardProps {
  title: string;
  periodCount: number;
  data: { id: number; label: string; value: number; color: string }[];
}

const StatCard: React.FC<StatCardProps> = ({ title, periodCount, data }) => {
  const hasData = data.some((d) => d.value > 0);

  return (
    <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' }}>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          {periodCount}
        </Typography>
        {hasData ? (
          <PieChart
            series={[
              {
                data,
                innerRadius: 35,
                outerRadius: 70,
                paddingAngle: 2,
                cornerRadius: 4,
              },
            ]}
            width={180}
            height={140}
            hideLegend
          />
        ) : (
          <Box
            sx={{
              width: 180,
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: (theme) => `2px dashed ${alpha(theme.palette.text.secondary, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Sin registros
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const PersonStatsCharts: React.FC<PersonStatsChartsProps> = ({ persons }) => {
  const stats = getPersonStats(persons);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Estadísticas de Registros
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Hoy" periodCount={stats.daily.periodCount} data={stats.daily.data} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Esta Semana" periodCount={stats.weekly.periodCount} data={stats.weekly.data} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Este Mes" periodCount={stats.monthly.periodCount} data={stats.monthly.data} />
        </Grid>
      </Grid>
    </Box>
  );
};
