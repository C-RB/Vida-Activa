// Vida Activa v2 style guide. Saturated blue is only for actions; teal is for information, amber for
// corrections and red only for serious things (pain, finishing). Never use color without icon + text.

export const Palette = {
  // Neutrals
  background: "#F6F8FB",
  surface: "#FFFFFF",
  border: "#DCE3EE",

  // Text
  textPrimary: "#172033",
  textSecondary: "#4A5568",
  onPrimary: "#FFFFFF",

  // Action
  primary: "#1D5FD1",
  primaryPressed: "#164AA6",
  primarySoft: "#E8F0FE",

  // Information (appointments)
  info: "#0F766E",
  infoSoft: "#E6F4F2",

  // Warning (corrections)
  warning: "#B45309",
  warningSoft: "#FDF3E7",

  // Danger (serious actions or pain only)
  danger: "#B42318",
  dangerSoft: "#FDECEA",
} as const;

// Legacy aliases used by existing screens, mapped to the v2 palette so every view (admin included) inherits it.
export const Colors = {
  ...Palette,

  bannerBg: Palette.primary,
  bannerTitle: Palette.onPrimary,
  bannerSubtitle: Palette.onPrimary,

  textMuted: "rgba(74, 85, 104, 0.6)",
  textOnDark: Palette.onPrimary,

  cardBg: Palette.surface,
  cardBgAlt: Palette.background,

  btnPrimary: Palette.primary,
  btnDark: Palette.primaryPressed,
  btnDanger: Palette.danger,
  btnTeal: Palette.primary,
} as const;

// Flat neutral background (v2 has no gradients).
export const GradientColors = [Palette.background, Palette.background] as const;

export const BannerStyle = {
  backgroundColor: Colors.bannerBg,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  paddingTop: 54,
  paddingBottom: 24,
  paddingHorizontal: 20,
  width: "100%" as const,
};

// Inter weights. `bold` keeps its historical name (it is SemiBold).
export const Fonts = {
  regular: "InterRegular",
  medium: "InterMedium",
  bold: "InterSemiBold",
  heavy: "InterBold",
} as const;

// v2 text styles; sizes are meant for older adults.
export const Type = {
  display: { fontFamily: Fonts.heavy, fontSize: 40, lineHeight: 48 },
  title1: { fontFamily: Fonts.heavy, fontSize: 28, lineHeight: 36 },
  title2: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 30 },
  body: { fontFamily: Fonts.regular, fontSize: 18, lineHeight: 27 },
  bodyStrong: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 27 },
  secondary: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },
  button: { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 24 },
  label: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 18 },
} as const;

export const Radius = { input: 14, button: 16, card: 20 } as const;
