/**
 * Ligo design tokens — web port of the shipping React Native app.
 *
 * Ported 2026-08-31 from /Users/tjdozier7/Downloads/ligo-backend (read-only
 * reference clone of micah534/ligo-backend). Nothing here imports from that
 * repo or from any live service; these are copied values, so the mockup and
 * the app can drift independently and on purpose.
 *
 * WHY TWO TOKEN SETS: the app genuinely has two, and they disagree. Rather
 * than average them into something that matches neither, both are ported
 * with their real values and their real scope:
 *
 *   EV  (mobile/src/screens/events/eventsUi.tsx)
 *       The Figma-accurate set. Every value traces to a specific Figma node
 *       pull, and several carry audit corrections (orangeText was fixed from
 *       #7c2d12 to #9a3412 after a re-pull). The Events, Clubs, and Chat
 *       screens all render with this. USE THIS for anything that has to sit
 *       next to those surfaces without a visible seam — including the feed
 *       that replaces the Chat tab.
 *
 *   HOUSE (mobile/src/lib/theme.ts)
 *       The older house style from the 2026-07-26 restyle, sourced from the
 *       Ligo brand kit (Ligo-Brand-Kit-v2). Still what the rest of the app
 *       uses. Kept here because the brand colors are the authoritative ones
 *       and because the spacing/radius/type scales below come from it.
 *
 * The overlap is small but real — bg, border, and text differ between them.
 * See TOKEN_CONFLICTS at the bottom for the exact list.
 */

/* ------------------------------------------------------------------ */
/* EV — Figma-accurate, governs Events / Clubs / Chat                  */
/* ------------------------------------------------------------------ */

export const EV = {
  bg: "#f6f5f4",
  chipBg: "rgba(163,163,163,0.1)",
  chipBgStrong: "rgba(163,163,163,0.16)",
  /** Circular 40x40 header icon-chip. Close to chipBg but deliberately not equal. */
  iconChipBg: "rgba(153,160,174,0.1)",
  border: "#ebebeb",
  textStrong: "#171717",
  textSub: "#5c5c5c",
  textSoft: "#a4a4a4",
  orange: "#f97316",
  orangeTint: "#fed7aa",
  orangeText: "#9a3412",
} as const;

/**
 * A THIRD near-miss set, found in chatUi.tsx.
 *
 * The chat row and its empty state don't use EV.textStrong/EV.textSub —
 * they use these two, which are close enough to look like the same
 * intent and different enough to not be. Ported as their own named
 * values rather than silently normalized to EV, because normalizing
 * would make this port stop matching the screen it claims to reproduce.
 *
 * Probably worth collapsing into EV in the real app. Not this port's
 * call to make.
 */
export const EV_CHAT = {
  /** vs EV.textStrong #171717 */
  title: "#0e121b",
  /** vs EV.textSub #5c5c5c */
  subtitle: "#525866",
} as const;

/* ------------------------------------------------------------------ */
/* HOUSE — brand kit, governs everything else                          */
/* ------------------------------------------------------------------ */

export const COLORS = {
  // Brand
  orange: "#f97316",
  green: "#71c07f",
  yellow: "#f5d783",
  pink: "#ea8ce1",

  // Core
  black: "#0a0907",
  white: "#ffffff",

  // Surfaces — warm, not blue-grey.
  bg: "#FAFAF8",
  surface: "#ffffff",
  surfaceAlt: "#F4F3EF",

  // Text
  text: "#0a0907",
  textMuted: "#6b6b6b",
  textFaint: "#9a9892",
  textOnDark: "#ffffff",

  // Lines
  border: "#e5e5e0",
  borderStrong: "#d6d5cd",

  // Status
  danger: "#c0392b",
  success: "#71c07f",
} as const;

/** The four brand accents, in the order accentFor() cycles them. */
export const ACCENTS = [
  COLORS.orange,
  COLORS.green,
  COLORS.yellow,
  COLORS.pink,
] as const;

/* ------------------------------------------------------------------ */
/* Scales — 4pt grid                                                   */
/* ------------------------------------------------------------------ */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const FONT_SIZE = {
  caption: 12,
  small: 13,
  body: 15,
  bodyLg: 17,
  title: 20,
  h2: 24,
  h1: 30,
  display: 38,
} as const;

export const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  heavy: 800,
} as const;

/**
 * Headline typeface — deliberately a variable, not a hardcode.
 *
 * The app and the brand kit disagree and nobody has reconciled them:
 *   - theme.ts calls Bricolage Grotesque "the real brand font" from the
 *     brand kit, noting it wasn't bundled yet (needs native asset linking).
 *   - eventsUi.tsx / chatUi.tsx / onboardingUi.tsx actually ship
 *     'Gelica-Regular', with nine Gelica weights bundled.
 *
 * This mockup defaults to Bricolage, which the project already loads and
 * which is the brand-kit answer. If that call goes the other way, change
 * this one line and every ported component follows — no sweep required.
 *
 * (Switching to Gelica also means sourcing a licensed copy. The files in
 * the reference repo came from a free-font mirror, which is a licensing
 * question for anything publicly deployed.)
 */
export const FONT_HEADLINE = '"Bricolage Grotesque", Georgia, serif';

/** Body/UI stack. The app uses the platform system font plus bundled Inter. */
export const FONT_BODY =
  '-apple-system, "SF Pro Text", "Inter", "Helvetica Neue", Arial, sans-serif';

/* ------------------------------------------------------------------ */
/* Elevation                                                           */
/* ------------------------------------------------------------------ */

/**
 * Soft, low-contrast lift. The RN values are iOS shadow props
 * (color/opacity/radius/offset); these are the CSS equivalents.
 */
export const SHADOW = {
  /** shadowOpacity 0.06, radius 12, offset y+4 */
  card: "0 4px 12px rgba(10, 9, 7, 0.06)",
  /** shadowOpacity 0.1, radius 20, offset y+8 */
  raised: "0 8px 20px rgba(10, 9, 7, 0.1)",
  /** The floating action button's heavier shadow. */
  floating: "0 4px 8px rgba(0, 0, 0, 0.25)",
} as const;

/* ------------------------------------------------------------------ */
/* Helpers — ported verbatim, they're framework-agnostic               */
/* ------------------------------------------------------------------ */

/**
 * Deterministic accent per key, so a given event/club keeps the same color
 * across renders and sessions. Same hash as the app — the same string maps
 * to the same accent in both.
 */
export function accentFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}

/** `#rrggbb` + alpha -> `rgba(...)`. */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Initials for avatar fallbacks — never render an empty circle. */
export function initialsFor(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/* ------------------------------------------------------------------ */
/* Documented divergence                                               */
/* ------------------------------------------------------------------ */

/**
 * Where EV and HOUSE disagree. Rendered on /design so the conflict is
 * visible rather than buried in a comment. Not used at runtime.
 */
export const TOKEN_CONFLICTS = [
  { role: "Page background", ev: EV.bg, house: COLORS.bg, chat: null },
  { role: "Hairline border", ev: EV.border, house: COLORS.border, chat: null },
  {
    role: "Primary text",
    ev: EV.textStrong,
    house: COLORS.text,
    chat: EV_CHAT.title,
  },
  {
    role: "Secondary text",
    ev: EV.textSub,
    house: COLORS.textMuted,
    chat: EV_CHAT.subtitle,
  },
  { role: "Tertiary text", ev: EV.textSoft, house: COLORS.textFaint, chat: null },
] as const;
