// ============================================================
// Person Stats — Agregación de registros por periodo
// ============================================================

import type { Person } from '../models/Person';

export interface PeriodStat {
  id: number;
  label: string;
  value: number;
  color: string;
}

const COLOR_PERIOD = '#6366f1';
const COLOR_REST = alphaHex('#a78bfa', 0.25);

function alphaHex(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = domingo
  const diff = day === 0 ? 6 : day - 1; // semana inicia en lunes
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export interface PersonStats {
  daily: { periodCount: number; data: PeriodStat[] };
  weekly: { periodCount: number; data: PeriodStat[] };
  monthly: { periodCount: number; data: PeriodStat[] };
}

export function getPersonStats(persons: Person[]): PersonStats {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const total = persons.length;

  let dailyCount = 0;
  let weeklyCount = 0;
  let monthlyCount = 0;

  for (const person of persons) {
    const created = new Date(person.createdAt);
    if (isSameDay(created, now)) dailyCount++;
    if (created >= weekStart) weeklyCount++;
    if (isSameMonth(created, now)) monthlyCount++;
  }

  const buildData = (periodCount: number, periodLabel: string): PeriodStat[] => [
    { id: 0, label: periodLabel, value: periodCount, color: COLOR_PERIOD },
    { id: 1, label: 'Resto', value: Math.max(total - periodCount, 0), color: COLOR_REST },
  ];

  return {
    daily: { periodCount: dailyCount, data: buildData(dailyCount, 'Hoy') },
    weekly: { periodCount: weeklyCount, data: buildData(weeklyCount, 'Esta semana') },
    monthly: { periodCount: monthlyCount, data: buildData(monthlyCount, 'Este mes') },
  };
}
