export { colors } from './colors';
export { USE_NATIVE_DRIVER, createShadow } from './platform';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

import { createShadow } from './platform';

export const shadows = {
  sm: createShadow('#000', 0, 2, 0.15, 4, 2),
  md: createShadow('#000', 0, 4, 0.2, 8, 4),
  lg: createShadow('#000', 0, 8, 0.25, 16, 8),
} as const;
