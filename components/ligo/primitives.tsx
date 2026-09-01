/**
 * Ligo primitives — web ports of the shipping app's components.
 *
 * Ported 2026-08-31 from the read-only reference clone at
 * ~/Downloads/ligo-backend. Two sources, kept visually distinct here for
 * the same reason tokens.ts keeps two token sets:
 *
 *   Ev*      <- mobile/src/screens/events/eventsUi.tsx
 *              Figma-accurate. What Events / Clubs / Chat actually render.
 *   House*   <- mobile/src/components/ui.tsx
 *              The 2026-07-26 house style used by the rest of the app.
 *
 * Style values are inlined rather than pushed into CSS classes so that a
 * side-by-side diff against the RN StyleSheet stays legible — if someone
 * re-pulls Figma and eventsUi.tsx changes, the corresponding number here
 * is findable. Only hover/active/focus live in ligo.css.
 *
 * Deliberate deviations from the RN source, all of them web affordances
 * RN had no equivalent for:
 *   - Real semantic elements (<button>, <input>, <nav>) instead of
 *     TouchableOpacity/View, so keyboard and screen-reader behaviour
 *     works without hand-rolling it.
 *   - A visible :focus-visible ring (ligo.css).
 *   - PNG icons recoloured with CSS mask rather than RN's tintColor.
 *   - Images take a plain `src`; the app's previewUrl() CDN resizing has
 *     no meaning locally.
 */
"use client";

import React from "react";
import {
  EV,
  EV_CHAT,
  COLORS,
  RADIUS,
  SHADOW,
  FONT_HEADLINE,
  FONT_BODY,
  accentFor,
  withAlpha,
  initialsFor,
} from "@/lib/ligo/tokens";

/* ================================================================== */
/* Shell                                                               */
/* ================================================================== */

/**
 * Standard page background for the Events/Clubs/Chat surfaces.
 * RN: EvScreen (SafeAreaView, EV.bg).
 */
export function EvScreen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="ligo-ported"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        background: EV.bg,
        fontFamily: FONT_BODY,
        color: EV.textStrong,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** RN: EvHeadline — Gelica in the app, the FONT_HEADLINE variable here. */
export function EvHeadline({
  children,
  size = 24,
  align = "left",
  style,
}: {
  children: React.ReactNode;
  size?: number;
  align?: "left" | "center";
  style?: React.CSSProperties;
}) {
  return (
    <h2
      style={{
        margin: 0,
        fontFamily: FONT_HEADLINE,
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.35,
        letterSpacing: "-0.4px",
        color: EV.textStrong,
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

/** RN: EvBrandRow — wordmark left, optional 40x40 icon chip right. */
export function EvBrandRow({
  rightIcon,
  onRightPress,
  rightIconLabel,
}: {
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  rightIconLabel?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 20px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.svg"
          alt=""
          aria-hidden="true"
          style={{ width: 22, height: 22, objectFit: "contain" }}
        />
        <span
          style={{
            fontFamily: FONT_HEADLINE,
            fontSize: 20,
            letterSpacing: "-0.2px",
            color: EV.textStrong,
          }}
        >
          Ligo
        </span>
      </div>
      {!!rightIcon && (
        <button
          type="button"
          className="ligo-pressable"
          onClick={onRightPress}
          disabled={!onRightPress}
          aria-label={rightIconLabel}
          style={iconChipStyle}
        >
          {rightIcon}
        </button>
      )}
    </div>
  );
}

const iconChipStyle: React.CSSProperties = {
  background: EV.chipBg,
  width: 40,
  height: 40,
  borderRadius: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

/** RN: EvSearchBar. */
export function EvSearchBar({
  value,
  onChange,
  onFilterPress,
  placeholder = "event, location, clubs",
  label = "Search",
}: {
  value: string;
  onChange: (v: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  label?: string;
}) {
  const id = React.useId();
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "0 20px",
        marginTop: 20,
        alignItems: "center",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: EV.chipBg,
          borderRadius: 999,
          padding: "10px 16px",
        }}
      >
        <SearchGlyph />
        <label htmlFor={id} style={srOnly}>
          {label}
        </label>
        <input
          id={id}
          className="ligo-search-input"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, fontSize: 14, color: EV.textStrong, minWidth: 0 }}
        />
      </div>
      <button
        type="button"
        className="ligo-pressable"
        onClick={onFilterPress}
        disabled={!onFilterPress}
        aria-label="Filter"
        style={iconChipStyle}
      >
        <FilterGlyph />
      </button>
    </div>
  );
}

/**
 * Search / filter glyphs.
 *
 * The app uses PNG exports (search.png, filter.png) that weren't copied
 * into this project — only the three nav icons and two pill assets were.
 * Drawn inline at the app's sizes (16px and 18px) and in its colors, so
 * they read correctly without pulling more assets across.
 */
function SearchGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={EV.textSoft}
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FilterGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={EV.textSub}
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * RN: EvPillToggle — the Events/Clubs segmented control.
 *
 * The app draws each chip with a real Figma "Polygon 2" asset: a faceted
 * hexagon, not a rounded rect. Both PNGs are copied into public/ligo-nav
 * and stretched behind the label the same way RN stretches them, so this
 * keeps the faceted edge rather than approximating it with border-radius.
 *
 * Rendered as a real radiogroup — the RN version is a row of buttons with
 * no grouping semantics, which is a gap worth not reproducing.
 */
export function EvPillToggle<T extends string>({
  options,
  value,
  onChange,
  center = false,
  label = "View",
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  center?: boolean;
  label?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      style={{
        display: "flex",
        gap: 10,
        marginTop: 16,
        padding: center ? 0 : "0 20px",
        justifyContent: center ? "center" : "flex-start",
      }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            className="ligo-pressable"
            onClick={() => onChange(opt)}
            style={{
              position: "relative",
              height: 40,
              padding: "0 30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              color: active ? EV.orangeText : EV.textSub,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(/ligo-nav/badge-pill-${
                  active ? "orange" : "white"
                }-sm.png)`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            />
            <span style={{ position: "relative" }}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

/** RN: EvSectionHeader. */
export function EvSectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: FONT_HEADLINE,
          fontWeight: 400,
          fontSize: 17,
          letterSpacing: "-0.2px",
          color: EV.textStrong,
        }}
      >
        {title}
      </h3>
      {!!actionLabel && (
        <button
          type="button"
          className="ligo-pressable"
          onClick={onAction}
          disabled={!onAction}
          style={{ fontSize: 14, color: EV.textSoft }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ================================================================== */
/* Content                                                             */
/* ================================================================== */

/** RN: EvPosterCard — the tall carousel card. Figma: 278x341 image box. */
export function EvPosterCard({
  title,
  subtitle,
  meta,
  imageSrc,
  imageAlt,
  accent,
  onPress,
  width = 278,
  height = 341,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  imageSrc?: string;
  imageAlt?: string;
  accent: string;
  onPress?: () => void;
  width?: number;
  height?: number;
}) {
  const Wrapper = onPress ? "button" : "div";
  return (
    <Wrapper
      {...(onPress ? { type: "button" as const, onClick: onPress } : {})}
      className={onPress ? "ligo-pressable" : undefined}
      style={{ width, display: "block", padding: 0 }}
    >
      <div
        style={{
          width,
          height,
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: withAlpha(accent, 0.18),
        }}
      >
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={imageAlt ?? title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <>
            <span style={{ fontSize: 30, fontWeight: 800, color: accent }}>
              {title.slice(0, 2).toUpperCase()}
            </span>
            {/* Scoped to the fallback-initials state only — the app removed
                this scrim wherever a real photo renders. */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "45%",
                background: "rgba(0,0,0,0.18)",
              }}
            />
          </>
        )}
      </div>
      {!!subtitle && (
        <p style={{ ...clamp1, fontSize: 15, color: "#4d4845", margin: "8px 0 0" }}>
          {subtitle}
        </p>
      )}
      <p
        style={{
          ...clamp2,
          fontSize: 17,
          fontWeight: 500,
          color: EV.textStrong,
          margin: "2px 0 0",
        }}
      >
        {title}
      </p>
      {!!meta && (
        <p style={{ ...clamp1, fontSize: 15, color: EV.textSub, margin: "2px 0 0" }}>
          {meta}
        </p>
      )}
    </Wrapper>
  );
}

const clamp1: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const clamp2: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/** RN: EvEventRow — 80px thumb + stacked meta/title/meta. */
export function EvEventRow({
  metaTop,
  title,
  metaBottom,
  imageSrc,
  imageAlt,
  accent,
  onPress,
}: {
  metaTop: string;
  title: string;
  metaBottom?: string;
  imageSrc?: string;
  imageAlt?: string;
  accent: string;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? "button" : "div";
  return (
    <Wrapper
      {...(onPress ? { type: "button" as const, onClick: onPress } : {})}
      className={onPress ? "ligo-pressable" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        width: "100%",
        padding: 0,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
          background: withAlpha(accent, 0.18),
        }}
      >
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={imageAlt ?? title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 24, fontWeight: 800, color: accent }}>
            {title.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ flex: 1, display: "grid", gap: 4, minWidth: 0 }}>
        <span style={{ ...clamp1, fontSize: 15, color: EV.textSub }}>{metaTop}</span>
        <span
          style={{ ...clamp1, fontSize: 15, fontWeight: 500, color: EV.textStrong }}
        >
          {title}
        </span>
        {!!metaBottom && (
          <span style={{ ...clamp1, fontSize: 15, color: EV.textSub }}>
            {metaBottom}
          </span>
        )}
      </div>
    </Wrapper>
  );
}

/** RN: EvListRow — avatar + title/subtitle + optional trailing. */
export function EvListRow({
  avatar,
  title,
  subtitle,
  trailing,
  onPress,
  titleLines = 1,
}: {
  avatar: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  titleLines?: number;
}) {
  const Wrapper = onPress ? "button" : "div";
  return (
    <Wrapper
      {...(onPress ? { type: "button" as const, onClick: onPress } : {})}
      className={onPress ? "ligo-pressable" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        width: "100%",
      }}
    >
      {avatar}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: titleLines === 1 ? "block" : "-webkit-box",
            ...(titleLines === 1
              ? clamp1
              : {
                  WebkitLineClamp: titleLines,
                  WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                }),
            fontSize: 15,
            fontWeight: 500,
            color: EV.textStrong,
          }}
        >
          {title}
        </span>
        {!!subtitle && (
          <span
            style={{
              ...clamp1,
              display: "block",
              fontSize: 15,
              color: EV.textSub,
              marginTop: 1,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {trailing}
    </Wrapper>
  );
}

/** RN: EvAvatarCircle — initials fallback on a tinted brand color. */
export function EvAvatarCircle({
  label,
  color,
  src,
  size = 40,
  square = false,
}: {
  label: string;
  color: string;
  src?: string;
  size?: number;
  square?: boolean;
}) {
  const radius = square ? 8 : size / 2;
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: withAlpha(color, 0.35),
        color,
        fontSize: size * 0.36,
        fontWeight: 700,
      }}
    >
      {label.slice(0, 2).toUpperCase()}
    </span>
  );
}

/** RN: EvTag — `#label` in a hairline white pill. */
export function EvTag({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "#fff",
        border: `1px solid ${EV.border}`,
        borderRadius: 999,
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 500,
        color: EV.textSub,
      }}
    >
      #{label}
    </span>
  );
}

/** RN: EvMenuCard — the white rounded group on club/profile screens. */
export function EvMenuCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 24,
        padding: "4px 12px",
      }}
    >
      {children}
    </div>
  );
}

/** RN: EvMenuRow. `divider` draws the hairline the app puts between rows. */
export function EvMenuRow({
  icon,
  label,
  onPress,
  destructive = false,
  divider = false,
}: {
  icon?: React.ReactNode;
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  divider?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        className="ligo-pressable"
        onClick={onPress}
        disabled={!onPress}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 0",
          width: "100%",
        }}
      >
        {icon && (
          <span
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            flex: 1,
            fontSize: 15,
            color: destructive ? COLORS.danger : EV.textStrong,
          }}
        >
          {label}
        </span>
        <span aria-hidden="true" style={{ fontSize: 20, color: EV.textSoft }}>
          ›
        </span>
      </button>
      {divider && (
        <div style={{ height: 1, background: EV.border, transform: "scaleY(0.5)" }} />
      )}
    </>
  );
}

/** RN: EvFloatingButton — the dark pill FAB. */
export function EvFloatingButton({
  icon = "+",
  label,
  onPress,
}: {
  icon?: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <button
      type="button"
      className="ligo-pressable"
      onClick={onPress}
      style={{
        position: "absolute",
        right: 20,
        bottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(23,23,23,0.92)",
        borderRadius: 999,
        padding: "14px 20px",
        boxShadow: SHADOW.floating,
      }}
    >
      <span aria-hidden="true" style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>
        {icon}
      </span>
      <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

/* ================================================================== */
/* House style (ui.tsx)                                                */
/* ================================================================== */

/** RN: ui.tsx Card. */
export function HouseCard({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    background: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    border: `1px solid ${COLORS.border}`,
    boxShadow: SHADOW.card,
    width: "100%",
    textAlign: "left",
    ...style,
  };
  if (!onPress) return <div style={base}>{children}</div>;
  return (
    <button type="button" className="ligo-pressable" onClick={onPress} style={base}>
      {children}
    </button>
  );
}

export type HouseButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/** RN: ui.tsx Button. */
export function HouseButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: HouseButtonVariant;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const variants: Record<HouseButtonVariant, React.CSSProperties> = {
    primary: { background: COLORS.text, color: COLORS.white },
    secondary: {
      background: COLORS.surface,
      border: `1px solid ${COLORS.borderStrong}`,
      color: COLORS.text,
    },
    ghost: {
      background: "transparent",
      color: COLORS.textMuted,
      padding: "8px 0",
      fontSize: 15,
      fontWeight: 600,
    },
    danger: {
      background: withAlpha(COLORS.danger, 0.1),
      border: `1px solid ${withAlpha(COLORS.danger, 0.3)}`,
      color: COLORS.danger,
    },
  };
  return (
    <button
      type="button"
      className="ligo-pressable"
      onClick={onPress}
      disabled={disabled}
      style={{
        borderRadius: RADIUS.pill,
        padding: "15px 24px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 17,
        fontWeight: 700,
        opacity: disabled ? 0.4 : 1,
        ...variants[variant],
        ...style,
      }}
    >
      {label}
    </button>
  );
}

/** RN: ui.tsx Pill — accent-tinted label. */
export function HousePill({ label, accent }: { label: string; accent?: string }) {
  const color = accent ?? COLORS.textMuted;
  return (
    <span
      style={{
        display: "inline-flex",
        alignSelf: "flex-start",
        borderRadius: RADIUS.pill,
        border: `1px solid ${withAlpha(color, 0.35)}`,
        background: withAlpha(color, 0.14),
        padding: "5px 12px",
        fontSize: 12,
        fontWeight: 700,
        color,
      }}
    >
      {label}
    </span>
  );
}

/** RN: ui.tsx Avatar — deterministic accent, initials fallback. */
export function HouseAvatar({
  name,
  src,
  size = 48,
}: {
  name?: string;
  src?: string;
  size?: number;
}) {
  const accent = accentFor(name ?? "ligo");
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: withAlpha(accent, 0.18),
        color: accent,
        fontSize: size * 0.38,
        fontWeight: 800,
      }}
    >
      {initialsFor(name)}
    </span>
  );
}

/** RN: ui.tsx EmptyState — says what's missing and what to do. */
export function HouseEmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>
        {title}
      </p>
      {!!body && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 15,
            lineHeight: "21px",
            color: COLORS.textMuted,
          }}
        >
          {body}
        </p>
      )}
      {!!action && <div style={{ marginTop: 24, alignSelf: "stretch" }}>{action}</div>}
    </div>
  );
}

/* ================================================================== */
/* Chat (chatUi.tsx)                                                   */
/* ================================================================== */

/**
 * RN: chatUi.tsx EvChatRow — one conversation in the Chat tab.
 *
 * Note the colors: title/subtitle use EV_CHAT, not EV.textStrong /
 * EV.textSub. That's the real app's inconsistency, preserved on purpose
 * — see EV_CHAT's comment in tokens.ts.
 */
export function EvChatRow({
  avatarSrc,
  avatarLabel,
  avatarColor,
  title,
  subtitle,
  timestamp,
  unread = false,
  onPress,
}: {
  avatarSrc?: string;
  avatarLabel: string;
  avatarColor: string;
  title: string;
  subtitle: string;
  timestamp: string;
  unread?: boolean;
  onPress?: () => void;
}) {
  return (
    <button
      type="button"
      className="ligo-pressable"
      onClick={onPress}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        width: "100%",
      }}
    >
      <EvAvatarCircle label={avatarLabel} color={avatarColor} src={avatarSrc} size={48} />
      <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <span
          style={{
            ...clamp1,
            display: "block",
            fontFamily: FONT_HEADLINE,
            fontSize: 17,
            color: EV_CHAT.title,
          }}
        >
          {title}
        </span>
        <span
          style={{
            ...clamp1,
            display: "block",
            fontSize: 15,
            color: EV_CHAT.subtitle,
            marginTop: 2,
          }}
        >
          {subtitle}
        </span>
      </span>
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, color: EV_CHAT.title }}>{timestamp}</span>
        {unread && (
          <span
            aria-label="Unread"
            role="img"
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: EV.orange,
              display: "block",
            }}
          />
        )}
      </span>
    </button>
  );
}

/**
 * RN: chatUi.tsx EvEmptyState — the icon-in-a-circle empty state.
 *
 * Distinct from ui.tsx's EmptyState (ported as HouseEmptyState): this
 * one has the 64px icon circle and uses the headline font. Micah removed
 * every CTA from these on 2026-08-19 — "they should just stay empty
 * states until someone either joins a club or RSVPs to an event" — so
 * the ctaLabel path is deliberately not ported.
 */
export function EvChatEmptyState({
  iconSrc,
  title,
  body,
}: {
  iconSrc: string;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 60,
        paddingLeft: 32,
        paddingRight: 32,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          background: EV.chipBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="ligo-tab-glyph"
          style={{
            width: 28,
            height: 28,
            backgroundColor: EV.textSoft,
            WebkitMaskImage: `url(${iconSrc})`,
            maskImage: `url(${iconSrc})`,
          }}
        />
      </span>
      <p
        style={{
          margin: "16px 0 0",
          fontFamily: FONT_HEADLINE,
          fontWeight: 400,
          fontSize: 20,
          color: EV.textStrong,
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 14,
          lineHeight: "20px",
          color: EV_CHAT.subtitle,
          textAlign: "center",
        }}
      >
        {body}
      </p>
    </div>
  );
}
