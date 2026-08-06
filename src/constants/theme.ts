// Design tokens for GREX AI.
//
// Design plan (kept here as living documentation, not just decoration):
// - Color: near-black purple-tinted background, one confident accent
//   (#8B5CF6) used sparingly — on the send button, the user bubble,
//   active states, and the brand "orb" mark. Everything else stays
//   quiet so the accent still reads as an accent.
// - Type: a single bilingual family (Cairo) covers Arabic and Latin
//   text with one consistent voice instead of swapping fonts by
//   language, which would make the two languages feel like two
//   different apps. Code blocks use a dedicated monospace family
//   (JetBrains Mono) for a terminal-like, unmistakably-code feel.
// - Signature element: a soft radial-gradient "orb" (see
//   components/common/Logo.tsx) reused as the splash mark, the AI
//   avatar, and the typing indicator — one motif that ties the whole
//   app together instead of a different icon in every corner.

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const fontFamily = {
  regular: 'Cairo_400Regular',
  medium: 'Cairo_500Medium',
  semiBold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
  extraBold: 'Cairo_800ExtraBold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
} as const;

export interface ThemeColors {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;
  border: string;
  borderSubtle: string;
  overlay: string;

  primary: string;
  primaryDeep: string;
  primarySoft: string; // low-opacity tint for backgrounds/badges
  onPrimary: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  userBubble: string;
  userBubbleText: string;
  aiBubble: string;
  aiBubbleText: string;

  success: string;
  warning: string;
  error: string;
  errorSoft: string;

  codeBackground: string;
  codeBorder: string;

  statusBarStyle: 'light' | 'dark';
}

export const darkColors: ThemeColors = {
  background: '#0A0A0F',
  backgroundElevated: '#111116',
  surface: '#151519',
  surfaceElevated: '#1C1C24',
  surfacePressed: '#232330',
  border: '#26262F',
  borderSubtle: '#1C1C22',
  overlay: 'rgba(5, 5, 8, 0.72)',

  primary: '#8B5CF6',
  primaryDeep: '#6D28D9',
  primarySoft: 'rgba(139, 92, 246, 0.16)',
  onPrimary: '#FFFFFF',

  text: '#F3F2F8',
  textSecondary: '#ABABBB',
  textMuted: '#75758A',
  textInverse: '#0A0A0F',

  userBubble: '#8B5CF6',
  userBubbleText: '#FFFFFF',
  aiBubble: '#1C1C24',
  aiBubbleText: '#F3F2F8',

  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  errorSoft: 'rgba(248, 113, 113, 0.14)',

  codeBackground: '#0D0D12',
  codeBorder: '#242430',

  statusBarStyle: 'light',
};

export const lightColors: ThemeColors = {
  background: '#F7F6FB',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F1EFF9',
  surfacePressed: '#E7E3F6',
  border: '#E3E1EC',
  borderSubtle: '#EDEBF4',
  overlay: 'rgba(20, 18, 30, 0.45)',

  primary: '#7C3AED',
  primaryDeep: '#5B21B6',
  primarySoft: 'rgba(124, 58, 237, 0.10)',
  onPrimary: '#FFFFFF',

  text: '#17151F',
  textSecondary: '#514E5E',
  textMuted: '#8A879A',
  textInverse: '#FFFFFF',

  userBubble: '#7C3AED',
  userBubbleText: '#FFFFFF',
  aiBubble: '#F1EFF9',
  aiBubbleText: '#17151F',

  success: '#059669',
  warning: '#B45309',
  error: '#DC2626',
  errorSoft: 'rgba(220, 38, 38, 0.08)',

  codeBackground: '#14121C',
  codeBorder: '#2A2836',

  statusBarStyle: 'dark',
};

export type ResolvedTheme = {
  mode: 'dark' | 'light';
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
};

export function resolveTheme(mode: 'dark' | 'light'): ResolvedTheme {
  return {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    fontFamily,
    fontSize,
  };
}

// One-line "terminal" code-block syntax palette, intentionally
// independent of light/dark app theme — a code block should look
// like a code block wherever it appears, the way it does in every
// serious editor.
export const codeSyntaxColors = {
  background: '#0D0D12',
  plain: '#D6D3E0',
  comment: '#6B7280',
  keyword: '#C084FC',
  string: '#86EFAC',
  number: '#FBBF24',
  function: '#93C5FD',
  operator: '#F0ABFC',
  punctuation: '#9CA3AF',
  tag: '#F87171',
  attribute: '#FBBF24',
};
