/**
 * Theme configuration for the application
 * This provides consistent color schemes and styling options
 */

// Define theme colors with consistent naming
export type ColorScheme = 'indigo' | 'teal' | 'purple' | 'blue' | 'amber';

// Main theme colors used throughout the application
export interface ThemeColors {
  primary: string;    // Primary brand color
  secondary: string;  // Secondary accent color
  neutral: string;    // Neutral/background color
  success: string;    // Success/positive actions
  warning: string;    // Warning/caution actions
  danger: string;     // Danger/negative actions
  info: string;       // Information/help actions
}

// Core theme palette for the standard color schemes
export const themeColors: Record<ColorScheme, ThemeColors> = {
  blue: {
    primary: 'blue',
    secondary: 'sky',
    neutral: 'gray',
    success: 'emerald',
    warning: 'amber',
    danger: 'rose',
    info: 'cyan',
  },
  indigo: {
    primary: 'indigo',
    secondary: 'violet',
    neutral: 'slate',
    success: 'emerald',
    warning: 'amber',
    danger: 'rose',
    info: 'blue',
  },
  teal: {
    primary: 'teal',
    secondary: 'emerald',
    neutral: 'gray',
    success: 'green',
    warning: 'amber',
    danger: 'red',
    info: 'sky',
  },
  purple: {
    primary: 'purple',
    secondary: 'fuchsia',
    neutral: 'zinc',
    success: 'emerald',
    warning: 'amber',
    danger: 'rose',
    info: 'indigo',
  },
  amber: {
    primary: 'amber', 
    secondary: 'orange',
    neutral: 'stone',
    success: 'emerald',
    warning: 'yellow',
    danger: 'red',
    info: 'sky',
  }
};

// Default theme for the application
export const defaultTheme: ColorScheme = 'teal';

// Get CSS classes for different components based on theme
export const getThemeClasses = (colorScheme: ColorScheme = defaultTheme) => {
  const colors = themeColors[colorScheme];
  
  return {
    // Page and card backgrounds
    pageBg: `bg-${colors.neutral}-50`,
    cardBg: `bg-${colors.primary}-50/50`,
    cardBorder: `border-${colors.primary}-200`,
    
    // Text colors
    textPrimary: `text-${colors.primary}-700`,
    textSecondary: `text-${colors.secondary}-600`,
    textMuted: `text-${colors.neutral}-500`,
    
    // Button styles
    buttonPrimary: `bg-${colors.primary}-500 hover:bg-${colors.primary}-600 text-white`,
    buttonSecondary: `bg-${colors.secondary}-100 text-${colors.secondary}-700 hover:bg-${colors.secondary}-200`,
    buttonOutline: `border-${colors.primary}-300 text-${colors.primary}-700 hover:bg-${colors.primary}-50`,
    
    // Badge styles
    badgePrimary: `bg-${colors.primary}-100 text-${colors.primary}-800`,
    badgeSecondary: `bg-${colors.secondary}-100 text-${colors.secondary}-800`,
    
    // Focus states
    focusRing: `focus:ring-${colors.primary}-500`,
    
    // Gradients
    gradient: `from-${colors.primary}-50 to-${colors.secondary}-50`,
    accentGradient: `from-${colors.primary}-500 to-${colors.secondary}-500`,
  };
};

// Therapy-specific color schemes
export const textTherapyTheme: ColorScheme = 'teal';
export const voiceTherapyTheme: ColorScheme = 'indigo';
export const modulesTheme: ColorScheme = 'purple';
export const statsTheme: ColorScheme = 'blue';

// Get the therapy-specific theme for a page
export function getPageTheme(page: 'text' | 'voice' | 'modules' | 'stats' | 'home'): ColorScheme {
  switch (page) {
    case 'text': return textTherapyTheme;
    case 'voice': return voiceTherapyTheme;
    case 'modules': return modulesTheme;
    case 'stats': return statsTheme;
    case 'home': 
    default: return defaultTheme;
  }
}