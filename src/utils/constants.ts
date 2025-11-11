// Color theme constants
export const colors = {
  primary: 'var(--primary-blue)',
  primaryDark: 'var(--primary-blue-dark)',
  primaryLight: 'var(--primary-blue-light)',
  purple: 'var(--primary-purple)',
  teal: 'var(--primary-teal)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
} as const;

// Chart colors
export const chartColors = [
  'var(--chart-blue)',
  'var(--chart-purple)',
  'var(--chart-teal)',
  'var(--chart-orange)',
  'var(--chart-green)',
  'var(--chart-red)',
] as const;

// Education levels
export const educationLevels = [
  'High School',
  'Diploma',
  'Bachelor',
  'Master',
  'PhD',
] as const;

// Age groups
export const ageGroups = [
  '18-20',
  '21-23',
  '24-26',
  '27-29',
] as const;

// Regions
export const regions = [
  'Western Indonesia',
  'Central Indonesia',
  'Eastern Indonesia',
] as const;

// Financial literacy score ranges
export const literacyScoreRanges = {
  excellent: { min: 75, label: 'Excellent', color: 'var(--success)' },
  good: { min: 60, label: 'Good', color: 'var(--primary-blue)' },
  fair: { min: 45, label: 'Fair', color: 'var(--warning)' },
  poor: { min: 0, label: 'Poor', color: 'var(--danger)' },
} as const;

// Financial anxiety levels
export const anxietyLevels = {
  low: { max: 2, label: 'Low Risk', color: 'var(--success)' },
  medium: { max: 3.5, label: 'Medium Risk', color: 'var(--warning)' },
  high: { max: 5, label: 'High Risk', color: 'var(--danger)' },
} as const;

// Chart configuration defaults
export const chartDefaults = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
  gridStroke: 'var(--divider)',
  gridStrokeDasharray: '3 3',
  axisStroke: 'var(--text-secondary)',
  tooltipBackground: 'var(--bg-secondary)',
  tooltipBorder: 'var(--border)',
} as const;