// Shared design tokens — mirrors the color system used in the web dashboard
// (src/App.css) so the operator app and the admin dashboard feel like one product.
//
// Note on fonts: the dashboard uses 'Poppins' via a web font import. React Native
// needs fonts loaded explicitly (e.g. with `expo-font` / `@expo-google-fonts/poppins`)
// before they can be referenced by name. To keep this drop-in without adding a new
// dependency, FONTS below fall back to the system font with matching weights. If you
// later load Poppins, just set FONTS.regular/medium/semibold/bold to the loaded
// family names and every screen picks it up automatically.

export const COLORS = {
  primary: '#556ee6',
  primaryDark: '#4458c9',
  primarySoft: 'rgba(85, 110, 230, 0.12)',

  success: '#34c38f',
  successSoft: 'rgba(52, 195, 143, 0.12)',

  warning: '#f1b44c',
  warningSoft: 'rgba(241, 180, 76, 0.15)',

  danger: '#f46a6a',
  dangerSoft: 'rgba(244, 106, 106, 0.12)',
  dangerDark: '#e14747',

  info: '#50a5f1',
  infoSoft: 'rgba(80, 165, 241, 0.12)',

  bodyBg: '#f6f6f9',
  card: '#ffffff',
  border: '#eef0f4',
  inputBorder: '#dfe2e8',

  textDark: '#343a40',
  textBody: '#495057',
  textMuted: '#878a99',
  white: '#ffffff',
};

export const RADIUS = { sm: 6, md: 8, lg: 10, xl: 12, pill: 999 };

export const SPACING = { xs: 6, sm: 10, md: 16, lg: 22, xl: 28 };

export const FONTS = {
  regular: undefined,
  medium: undefined,
  semibold: undefined,
  bold: undefined,
};

export const SHADOW = {
  shadowColor: '#38414a',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
};