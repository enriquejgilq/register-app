// ============================================================
// PersonStatsCards — Tarjetas de estadísticas rápidas de personas
// ============================================================

import { Box, Typography, alpha } from '@mui/material';
import type { Person } from '../../models/Person';
import type { PersonCategoryFilter } from '../../hooks/usePersons';

interface PersonStatsCardsProps {
  totalPersons: number;
  filteredPersons: Person[];
  categoryFilter: PersonCategoryFilter;
  onFilterChange: (filter: PersonCategoryFilter) => void;
}

export function PersonStatsCards({
  totalPersons,
  filteredPersons,
  categoryFilter,
  onFilterChange,
}: PersonStatsCardsProps) {
  const stats: Array<{
    label: string;
    value: number;
    color: string;
    icon: string;
    filterKey: PersonCategoryFilter;
  }> = [
    {
      label: 'Total Personas',
      value: totalPersons,
      color: '#6366f1',
      icon: '👥',
      filterKey: 'all',
    },
    {
      label: 'Con Foto',
      value: filteredPersons.filter((p) => p.fotoBase64).length,
      color: '#34d399',
      icon: '🪪',
      filterKey: 'conFoto',
    },
    {
      label: 'Con Correo',
      value: filteredPersons.filter((p) => p.correo).length,
      color: '#60a5fa',
      icon: '📧',
      filterKey: 'conCorreo',
    },
    {
      label: 'Con RIF',
      value: filteredPersons.filter((p) => p.rif).length,
      color: '#fbbf24',
      icon: '📋',
      filterKey: 'conRif',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 3,
      }}
    >
      {stats.map((stat) => {
        const isActive = categoryFilter === stat.filterKey;
        return (
          <Box
            key={stat.label}
            onClick={() => onFilterChange(isActive ? 'all' : stat.filterKey)}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 3,
              cursor: 'pointer',
              background: (theme) =>
                isActive
                  ? alpha(stat.color, 0.12)
                  : alpha(theme.palette.background.paper, 0.6),
              border: `1px solid ${alpha(stat.color, isActive ? 0.8 : 0.2)}`,
              boxShadow: isActive ? `0 0 0 1px ${alpha(stat.color, 0.4)}` : 'none',
              backdropFilter: 'blur(10px)',
              transition: 'border-color 0.2s ease, background 0.2s ease',
              '&:hover': {
                borderColor: alpha(stat.color, 0.5),
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                {stat.icon}
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: stat.color, lineHeight: 1, fontSize: { xs: '1.6rem', md: '2rem' } }}
              >
                {stat.value}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {stat.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
