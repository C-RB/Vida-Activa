// Vida Activa · Guía de estilo v2 (Figma: "Rediseño App Activamente").
//
// Reglas de la guía:
//  - Azul saturado SOLO para acciones (se sigue viendo azul aunque el cristalino
//    amarillee con la edad).
//  - Fondo neutro frío. Turquesa para información, ámbar para corregir y rojo
//    solo para lo grave. Nunca color sin ícono + texto.

export const Palette = {
  // Neutros
  background: "#F6F8FB", // neutro/fondo · fondo de pantallas
  surface: "#FFFFFF", // neutro/superficie · tarjetas
  border: "#DCE3EE", // neutro/borde · bordes y divisores

  // Texto
  textPrimary: "#172033", // texto/principal · títulos y cuerpo
  textSecondary: "#4A5568", // texto/secundario · ayudas y fechas
  onPrimary: "#FFFFFF", // texto/sobre-primario

  // Acción
  primary: "#1D5FD1", // primario/base · acciones principales
  primaryPressed: "#164AA6", // primario/presionado
  primarySoft: "#E8F0FE", // primario/suave · selección, fondo de ícono

  // Información (citas)
  info: "#0F766E", // info/base
  infoSoft: "#E6F4F2", // info/suave

  // Aviso (correcciones)
  warning: "#B45309", // aviso/base
  warningSoft: "#FDF3E7", // aviso/suave

  // Peligro (solo acciones graves o dolor)
  danger: "#B42318", // peligro/base
  dangerSoft: "#FDECEA", // peligro/suave
} as const;

// Alias semánticos que ya usan las pantallas existentes. Apuntan a la paleta v2
// para que todas las vistas (también las que no están en el Figma, como admin)
// hereden el nuevo diseño.
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

// Fondo plano neutro (la guía v2 no usa degradados).
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

// Inter. `bold` conserva el nombre histórico (antes Prompt SemiBold).
export const Fonts = {
  regular: "InterRegular",
  medium: "InterMedium",
  bold: "InterSemiBold",
  heavy: "InterBold",
} as const;

// Estilos de texto de la guía v2 (Inter). Tamaños pensados para adultos mayores.
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
