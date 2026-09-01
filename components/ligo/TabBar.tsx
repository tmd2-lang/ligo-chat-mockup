/**
 * Ligo bottom tab bar — web port of MainTabBar.tsx / MainTabs.tsx.
 *
 * THE SHAPE IS THREE TABS, NOT FOUR. Restructured in the app on
 * 2026-08-17 to match Figma's bar exactly (node 7685:18750): Events and
 * Clubs merged back into ONE middle tab with an internal pill toggle,
 * which freed the left slot for Chat.
 *
 *     Chat  ·  Events+Clubs  ·  Profile
 *
 * This matters for the feed work: the feed replaces Chat in the LEFT
 * slot. The bar stays three wide — it does not become a fourth tab, and
 * Events and Clubs do not split back apart.
 *
 * Bar chrome, from MainTabBar's StyleSheet: flush and full-width (not a
 * floating pill), white, hairline top border, 10px vertical padding,
 * 44x44 touch target, 24x24 glyph. Active is filled #171717, inactive
 * #a3a3a3 — Figma never draws a background box behind the active icon.
 *
 * Icons are the real Figma PNG exports copied from the reference repo
 * into public/ligo-nav. RN tints them with <Image tintColor>; the web
 * equivalent is a CSS mask, so one asset still serves both states.
 *
 * Known limitation inherited from the source: these export at native
 * Figma layout size (~28x28, not @2x/@3x), so they're soft if scaled up.
 * Fine at 24px.
 */
"use client";

import React from "react";

export type LigoTab = "chat" | "events" | "profile";

const ACTIVE = "#171717";
const INACTIVE = "#a3a3a3";

const ICONS: Record<LigoTab, string> = {
  chat: "/ligo-nav/nav-chat.png",
  events: "/ligo-nav/nav-explore.png",
  profile: "/ligo-nav/nav-profile.png",
};

export type TabDef = {
  id: LigoTab;
  /** Accessible name. Defaults below; override to show Feed in the Chat slot. */
  label: string;
};

export const DEFAULT_TABS: TabDef[] = [
  { id: "chat", label: "Chat" },
  { id: "events", label: "Events and Clubs" },
  { id: "profile", label: "Profile" },
];

export function LigoTabBar({
  active,
  onChange,
  tabs = DEFAULT_TABS,
}: {
  active: LigoTab;
  onChange?: (tab: LigoTab) => void;
  tabs?: TabDef[];
}) {
  return (
    <nav
      aria-label="Main"
      style={{
        display: "flex",
        background: "#ffffff",
        borderTop: "1px solid #e5e5e0",
        padding: "10px 0",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            className="ligo-pressable"
            onClick={() => onChange?.(tab.id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={tab.label}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                aria-hidden="true"
                className="ligo-tab-glyph"
                style={{
                  backgroundColor: isActive ? ACTIVE : INACTIVE,
                  WebkitMaskImage: `url(${ICONS[tab.id]})`,
                  maskImage: `url(${ICONS[tab.id]})`,
                }}
              />
            </span>
          </button>
        );
      })}
    </nav>
  );
}
