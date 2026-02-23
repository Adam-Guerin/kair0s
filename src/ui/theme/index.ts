/**
 * Kair0s Unified Theme System
 * 
 * Single source of truth for visual identity, colors, typography,
 * spacing, and interaction patterns across all components.
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Primary brand color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Semantic colors
  semantic: {
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
    },
  },
  
  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text colors
  text: {
    primary: '#0a0a0a',
    secondary: '#525252',
    tertiary: '#737373',
    inverse: '#ffffff',
    muted: '#a3a3a3',
  },
  
  // Border colors
  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
    focus: colors.primary[500],
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  // Base spacing unit
  unit: '0.25rem', // 4px
  
  // Spacing scale
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  
  // Common spacing utilities
  xs: '0.5rem',    // 8px
  sm: '1rem',      // 16px
  md: '1.5rem',    // 24px
  lg: '2rem',      // 32px
  xl: '3rem',      // 48px
  '2xl': '4rem',   // 64px
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Common animations
  transitions: {
    default: `all ${animations.duration.normal} ${animations.easing.easeInOut}`,
    colors: `color ${animations.duration.normal} ${animations.easing.easeInOut}`,
    opacity: `opacity ${animations.duration.normal} ${animations.easing.easeInOut}`,
    transform: `transform ${animations.duration.normal} ${animations.easing.easeInOut}`,
    scale: `transform ${animations.duration.normal} ${animations.easing.easeOut}`,
  },
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// COMPONENT STATES
// ============================================================================

export const states = {
  // Loading states
  loading: {
    opacity: '0.7',
    cursor: 'wait',
    transition: animations.transitions.opacity,
  },
  
  // Disabled states
  disabled: {
    opacity: '0.5',
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  
  // Focus states
  focus: {
    outline: `2px solid ${colors.border.focus}`,
    outlineOffset: '2px',
    transition: animations.transitions.colors,
  },
  
  // Hover states
  hover: {
    transition: animations.transitions.colors,
    cursor: 'pointer',
  },
  
  // Active states
  active: {
    transform: 'scale(0.98)',
    transition: animations.transitions.transform,
  },
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

export const layout = {
  // Container
  container: {
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    padding: spacing.md,
  },
  
  // Grid
  grid: {
    columns: 12,
    gap: spacing.md,
  },
  
  // Flex
  flex: {
    gap: spacing.md,
  },
};

// ============================================================================
// DARK THEME
// ============================================================================

export const darkTheme = {
  ...colors,
  primary: {
    ...colors.primary,
    500: '#0ea5e9', // Keep primary brand color
  },
  background: {
    primary: '#0a0a0a',
    secondary: '#171717',
    tertiary: '#262626',
    overlay: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#e5e5e5',
    tertiary: '#a3a3a3',
    inverse: '#0a0a0a',
    muted: '#737373',
  },
  border: {
    light: '#262626',
    medium: '#404040',
    dark: '#525252',
    focus: colors.primary[400],
  },
};

// ============================================================================
// THEME COMBINATIONS
// ============================================================================

export const themes = {
  light: {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animations,
    states,
    layout,
  },
  dark: {
    colors: darkTheme,
    typography,
    spacing,
    borderRadius,
    shadows,
    animations,
    states,
    layout,
  },
};

// ============================================================================
// CSS CUSTOM PROPERTIES
// ============================================================================

export const cssVariables = {
  // Colors
  '--color-primary-50': colors.primary[50],
  '--color-primary-500': colors.primary[500],
  '--color-primary-600': colors.primary[600],
  '--color-success-500': colors.semantic.success[500],
  '--color-warning-500': colors.semantic.warning[500],
  '--color-error-500': colors.semantic.error[500],
  '--color-background-primary': colors.background.primary,
  '--color-background-secondary': colors.background.secondary,
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-border-light': colors.border.light,
  '--color-border-focus': colors.border.focus,
  
  // Typography
  '--font-family-sans': typography.fontFamily.sans.join(', '),
  '--font-family-mono': typography.fontFamily.mono.join(', '),
  '--font-size-base': typography.fontSize.base,
  '--font-weight-normal': typography.fontWeight.normal,
  '--font-weight-medium': typography.fontWeight.medium,
  '--line-height-normal': typography.lineHeight.normal,
  
  // Spacing
  '--spacing-unit': spacing.unit,
  '--spacing-xs': spacing.xs,
  '--spacing-sm': spacing.sm,
  '--spacing-md': spacing.md,
  '--spacing-lg': spacing.lg,
  '--spacing-xl': spacing.xl,
  
  // Border radius
  '--border-radius-sm': borderRadius.sm,
  '--border-radius-base': borderRadius.base,
  '--border-radius-md': borderRadius.md,
  '--border-radius-lg': borderRadius.lg,
  
  // Shadows
  '--shadow-sm': shadows.sm,
  '--shadow-base': shadows.base,
  '--shadow-md': shadows.md,
  '--shadow-lg': shadows.lg,
  
  // Animations
  '--duration-fast': animations.duration.fast,
  '--duration-normal': animations.duration.normal,
  '--duration-slow': animations.duration.slow,
  '--easing-in-out': animations.easing.easeInOut,
};

// ============================================================================
// UTILITY CLASSES
// ============================================================================

export const utilityClasses = {
  // Text utilities
  text: {
    xs: `text-xs ${typography.fontSize.xs}`,
    sm: `text-sm ${typography.fontSize.sm}`,
    base: `text-base ${typography.fontSize.base}`,
    lg: `text-lg ${typography.fontSize.lg}`,
    xl: `text-xl ${typography.fontSize.xl}`,
    thin: `font-thin ${typography.fontWeight.thin}`,
    light: `font-light ${typography.fontWeight.light}`,
    normal: `font-normal ${typography.fontWeight.normal}`,
    medium: `font-medium ${typography.fontWeight.medium}`,
    semibold: `font-semibold ${typography.fontWeight.semibold}`,
    bold: `font-bold ${typography.fontWeight.bold}`,
  },
  
  // Spacing utilities
  spacing: {
    p0: `p-0`,
    p1: `p-1`,
    p2: `p-2`,
    p3: `p-3`,
    p4: `p-4`,
    m0: `m-0`,
    m1: `m-1`,
    m2: `m-2`,
    m3: `m-3`,
    m4: `m-4`,
  },
  
  // Color utilities
  colors: {
    primary: `text-primary-500`,
    secondary: `text-secondary`,
    success: `text-success-500`,
    warning: `text-warning-500`,
    error: `text-error-500`,
    info: `text-info-500`,
  },
  
  // State utilities
  states: {
    loading: `opacity-70 cursor-wait`,
    disabled: `opacity-50 cursor-not-allowed pointer-events-none`,
    focus: `focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`,
    hover: `transition-colors duration-200 ease-in-out cursor-pointer`,
  },
};
