/**
 * /design — local reference for the shipping app's design system.
 *
 * Not a product screen. This is the thing you open to see what Ligo
 * actually looks like right now, ported out of the read-only reference
 * clone at ~/Downloads/ligo-backend so the mockup project can build
 * against it without importing from that repo or touching any live
 * service.
 *
 * Everything here is static. No Appwrite, no Supabase, no network.
 *
 * Deliberately additive: this route and the files under lib/ligo and
 * components/ligo are new. Nothing in the Cole demo, onboarding, or
 * waitlist pages was modified to make it work.
 */
"use client";

import React, { useState } from "react";
import { IOSDevice } from "@/components/IOSDevice";
import { LigoTabBar, type LigoTab } from "@/components/ligo/TabBar";
import {
  EV,
  COLORS,
  ACCENTS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  SHADOW,
  FONT_HEADLINE,
  FONT_BODY,
  TOKEN_CONFLICTS,
  accentFor,
  withAlpha,
} from "@/lib/ligo/tokens";
import {
  EvScreen,
  EvHeadline,
  EvBrandRow,
  EvSearchBar,
  EvPillToggle,
  EvSectionHeader,
  EvPosterCard,
  EvEventRow,
  EvListRow,
  EvAvatarCircle,
  EvTag,
  EvMenuCard,
  EvMenuRow,
  HouseCard,
  HouseButton,
  HousePill,
  HouseAvatar,
  HouseEmptyState,
} from "@/components/ligo/primitives";
import "@/components/ligo/ligo.css";
import "./design.css";

/* ------------------------------------------------------------------ */
/* Sample content — local assets only                                  */
/* ------------------------------------------------------------------ */

const POSTERS = [
  {
    title: "Champagne & Shackles",
    subtitle: "Sigma Alpha Epsilon",
    meta: "Fri · 10:00 PM",
    src: "/Posh/ChampagneShackles.png",
  },
  {
    title: "Cabin Fever",
    subtitle: "Georgetown Program Board",
    meta: "Sat · 9:00 PM",
    src: "/Posh/CabinFever.png",
  },
  {
    title: "Alpha Kappa Psi Info Night",
    subtitle: "Alpha Kappa Psi",
    meta: "Tue · 7:00 PM",
    src: "/Posh/AlphaKappaPsi.png",
  },
];

const ROWS = [
  { metaTop: "Tonight · 8:00 PM", title: "Paddy Murphy Week", metaBottom: "The Standard" },
  { metaTop: "Thu · 6:30 PM", title: "GUASFCU The Vault", metaBottom: "Healy Hall" },
  { metaTop: "Sat · 2:00 PM", title: "Blood Drive", metaBottom: "Leavey Center" },
];

const CLUBS = [
  { name: "Georgetown Program Board", category: "Social" },
  { name: "South Asian Society", category: "Culture" },
  { name: "Alpha Kappa Psi", category: "Preprofessional" },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DesignReference() {
  const [tab, setTab] = useState<LigoTab>("events");
  const [toggle, setToggle] = useState<"Events" | "Clubs">("Events");
  const [query, setQuery] = useState("");

  return (
    <main className="dr-stage">
      <header className="dr-head">
        <div className="dr-head-mark">
          <b>LIGO</b>
          <span className="dr-dot" />
          <span>Design reference</span>
        </div>
        <p className="dr-head-sub">
          The shipping app&rsquo;s design system, ported locally from the read-only{" "}
          <code>ligo-backend</code> clone. Static and offline &mdash; no Appwrite,
          no Supabase, no network calls.
        </p>
      </header>

      <div className="dr-split">
        {/* ---------------------------------------------------------- */}
        {/* Live phone                                                  */}
        {/* ---------------------------------------------------------- */}
        <section className="dr-phone" aria-label="Components in context">
          <IOSDevice width={402} height={874}>
            <EvScreen style={{ height: "100%" }}>
              {/* Clears IOSDevice's 62px status bar, which is absolutely
                  positioned over the content. The narrow layout hides that
                  bar and overrides this — see design.css. */}
              <div className="dr-scroll" style={{ paddingTop: 66 }}>
                <EvBrandRow
                  rightIcon={<BellGlyph />}
                  onRightPress={() => {}}
                  rightIconLabel="Notifications"
                />

                <EvSearchBar value={query} onChange={setQuery} onFilterPress={() => {}} />

                <EvPillToggle
                  options={["Events", "Clubs"] as const}
                  value={toggle}
                  onChange={setToggle}
                  label="Events or clubs"
                />

                <div style={{ marginTop: 24 }}>
                  <EvSectionHeader title="This week" actionLabel="See all" onAction={() => {}} />
                  <div className="ligo-carousel" style={{ marginTop: 12 }}>
                    {POSTERS.map((p) => (
                      <EvPosterCard
                        key={p.title}
                        title={p.title}
                        subtitle={p.subtitle}
                        meta={p.meta}
                        imageSrc={p.src}
                        imageAlt={`Flyer for ${p.title}`}
                        accent={accentFor(p.title)}
                        width={278}
                        height={341}
                        onPress={() => {}}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 28 }}>
                  <EvSectionHeader title="Happening soon" />
                  <div style={{ display: "grid", gap: 16, padding: "12px 20px 0" }}>
                    {ROWS.map((r) => (
                      <EvEventRow
                        key={r.title}
                        metaTop={r.metaTop}
                        title={r.title}
                        metaBottom={r.metaBottom}
                        accent={accentFor(r.title)}
                        onPress={() => {}}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 28 }}>
                  <EvSectionHeader title="Discover clubs" actionLabel="See all" onAction={() => {}} />
                  <div style={{ padding: "4px 20px 0" }}>
                    {CLUBS.map((c) => (
                      <EvListRow
                        key={c.name}
                        avatar={
                          <EvAvatarCircle label={c.name} color={accentFor(c.name)} square />
                        }
                        title={c.name}
                        subtitle={c.category}
                        titleLines={2}
                        onPress={() => {}}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, padding: "16px 20px 0", flexWrap: "wrap" }}>
                  {["Culture", "Greek", "Music", "Sports"].map((t) => (
                    <EvTag key={t} label={t} />
                  ))}
                </div>

                <div style={{ padding: "24px 20px 32px" }}>
                  <EvMenuCard>
                    <EvMenuRow label="Chat" divider onPress={() => {}} />
                    <EvMenuRow label="Members" divider onPress={() => {}} />
                    <EvMenuRow label="Club events" onPress={() => {}} />
                  </EvMenuCard>
                </div>
              </div>

              <LigoTabBar active={tab} onChange={setTab} />
            </EvScreen>
          </IOSDevice>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Specimen sheet                                              */}
        {/* ---------------------------------------------------------- */}
        <div className="dr-specs">
          <Panel
            title="Bottom navigation"
            note="Three tabs, not four. Events and Clubs merged into one middle tab on 2026-08-17, which freed the left slot for Chat. A feed replacing Chat takes that same left slot — the bar stays three wide."
          >
            <div className="dr-tabdemo">
              <LigoTabBar active={tab} onChange={setTab} />
            </div>
            <dl className="dr-kv">
              <Kv k="Active" v="#171717" swatch="#171717" />
              <Kv k="Inactive" v="#a3a3a3" swatch="#a3a3a3" />
              <Kv k="Bar" v="#ffffff, hairline #e5e5e0 top" swatch="#ffffff" />
              <Kv k="Glyph" v="24×24, 44×44 target" />
            </dl>
          </Panel>

          <Panel
            title="EV tokens"
            note="Figma-accurate. Governs Events, Clubs, and Chat — use these for anything that has to sit next to those screens."
          >
            <div className="dr-swatches">
              {Object.entries(EV).map(([k, v]) => (
                <Swatch key={k} name={k} value={v} />
              ))}
            </div>
          </Panel>

          <Panel
            title="House tokens"
            note="From the 2026-07-26 restyle, sourced from the Ligo brand kit. Still used by the rest of the app."
          >
            <div className="dr-swatches">
              {Object.entries(COLORS).map(([k, v]) => (
                <Swatch key={k} name={k} value={v} />
              ))}
            </div>
          </Panel>

          <Panel
            title="Where the two disagree"
            note="Real divergence in the shipping app, not a porting artifact. Nobody has reconciled these — worth knowing before picking one."
          >
            <div style={{ overflowX: "auto" }}>
              <table className="dr-table">
                <thead>
                  <tr>
                    <th scope="col">Role</th>
                    <th scope="col">EV</th>
                    <th scope="col">House</th>
                    <th scope="col">Chat</th>
                  </tr>
                </thead>
                <tbody>
                  {TOKEN_CONFLICTS.map((c) => (
                    <tr key={c.role}>
                      <th scope="row">{c.role}</th>
                      <td>
                        <span className="dr-chip" style={{ background: c.ev }} />
                        <code>{c.ev}</code>
                      </td>
                      <td>
                        <span className="dr-chip" style={{ background: c.house }} />
                        <code>{c.house}</code>
                      </td>
                      <td>
                        {c.chat ? (
                          <>
                            <span className="dr-chip" style={{ background: c.chat }} />
                            <code>{c.chat}</code>
                          </>
                        ) : (
                          <code style={{ opacity: 0.3 }}>&mdash;</code>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dr-panel-note" style={{ marginTop: 12 }}>
              The Chat column is a third near-miss set, found in{" "}
              <code>chatUi.tsx</code>: the chat row&rsquo;s title and subtitle
              use <code>#0e121b</code> / <code>#525866</code> rather than EV&rsquo;s{" "}
              <code>#171717</code> / <code>#5c5c5c</code>. Preserved in the port
              rather than normalized, since normalizing would stop it matching
              the screen it reproduces.
            </p>
          </Panel>

          <Panel
            title="Accents"
            note="accentFor(key) hashes a string to one of four brand colors, so an event or club keeps the same accent across renders. Same hash as the app — identical input, identical color."
          >
            <div className="dr-swatches">
              {ACCENTS.map((a) => (
                <Swatch key={a} name={a} value={a} />
              ))}
            </div>
            <div className="dr-accent-demo">
              {["Champagne & Shackles", "South Asian Society", "The Hoya", "Blood Drive"].map(
                (k) => (
                  <span
                    key={k}
                    className="dr-accent-pill"
                    style={{
                      background: withAlpha(accentFor(k), 0.18),
                      color: accentFor(k),
                    }}
                  >
                    {k}
                  </span>
                )
              )}
            </div>
          </Panel>

          <Panel
            title="Typography"
            note="Headline font is a variable (FONT_HEADLINE), not a hardcode. The app ships Gelica on Events/Chat/onboarding; theme.ts calls Bricolage Grotesque the real brand font. Unreconciled — this mockup defaults to Bricolage, and flipping it is one line."
          >
            <div className="dr-type">
              {(
                [
                  ["display", 38],
                  ["h1", 30],
                  ["h2", 24],
                  ["title", 20],
                  ["bodyLg", 17],
                  ["body", 15],
                  ["small", 13],
                  ["caption", 12],
                ] as const
              ).map(([name, size]) => (
                <div key={name} className="dr-type-row">
                  <span className="dr-type-label">
                    {name} · {size}px
                  </span>
                  <span
                    style={{
                      fontFamily: name === "display" || name === "h1" || name === "h2" ? FONT_HEADLINE : FONT_BODY,
                      fontSize: size,
                      color: EV.textStrong,
                      lineHeight: 1.2,
                    }}
                  >
                    Everything happening at Georgetown
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Scales" note="4pt grid, shared by both token sets.">
            <div className="dr-scale-group">
              <span className="dr-scale-title">Spacing</span>
              <div className="dr-scale">
                {Object.entries(SPACING).map(([k, v]) => (
                  <div key={k} className="dr-scale-item">
                    <span className="dr-scale-bar" style={{ width: v }} />
                    <code>
                      {k} {v}
                    </code>
                  </div>
                ))}
              </div>
            </div>
            <div className="dr-scale-group">
              <span className="dr-scale-title">Radius</span>
              <div className="dr-radii">
                {Object.entries(RADIUS).map(([k, v]) => (
                  <div key={k} className="dr-radius-item">
                    <span
                      className="dr-radius-box"
                      style={{ borderRadius: Math.min(v, 28) }}
                    />
                    <code>
                      {k} {v}
                    </code>
                  </div>
                ))}
              </div>
            </div>
            <div className="dr-scale-group">
              <span className="dr-scale-title">Elevation</span>
              <div className="dr-elev">
                <span className="dr-elev-box" style={{ boxShadow: SHADOW.card }}>
                  card
                </span>
                <span className="dr-elev-box" style={{ boxShadow: SHADOW.raised }}>
                  raised
                </span>
              </div>
            </div>
          </Panel>

          <Panel
            title="House primitives"
            note="From ui.tsx. The rest of the app composes from these."
          >
            <div className="dr-stack">
              <div className="dr-row">
                <HouseButton label="Primary" onPress={() => {}} />
                <HouseButton label="Secondary" variant="secondary" onPress={() => {}} />
              </div>
              <div className="dr-row">
                <HouseButton label="Ghost" variant="ghost" onPress={() => {}} />
                <HouseButton label="Danger" variant="danger" onPress={() => {}} />
                <HouseButton label="Disabled" disabled />
              </div>
              <div className="dr-row">
                {ACCENTS.map((a) => (
                  <HousePill key={a} label="Members only" accent={a} />
                ))}
              </div>
              <div className="dr-row">
                {["Cole Brennan", "Mekhi", "The Hoya", "Sofia"].map((n) => (
                  <HouseAvatar key={n} name={n} />
                ))}
              </div>
              <HouseCard>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>
                  Card
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 15,
                    color: COLORS.textMuted,
                    lineHeight: "21px",
                  }}
                >
                  White surface, 16px radius, hairline border, soft lift. The
                  shadow is closer to a lift than a drop shadow on purpose.
                </p>
              </HouseCard>
              <HouseCard style={{ padding: 0, boxShadow: "none" }}>
                <HouseEmptyState
                  title="No conversations yet"
                  body="Join an event or a club and your group chat shows up here."
                  action={<HouseButton label="Browse clubs" variant="secondary" />}
                />
              </HouseCard>
            </div>
          </Panel>

          <Panel
            title="Fidelity notes"
            note="Where this port knowingly differs from the React Native source."
          >
            <ul className="dr-notes">
              <li>
                <b>Semantic elements.</b> <code>TouchableOpacity</code> became real{" "}
                <code>&lt;button&gt;</code>, the segmented toggle became a{" "}
                <code>radiogroup</code>, the tab bar a <code>&lt;nav&gt;</code>.
                Keyboard and screen-reader behavior work as a result; the RN
                originals had no equivalent.
              </li>
              <li>
                <b>Focus rings.</b> Added. RN has no <code>:focus-visible</code>,
                so there was nothing to port.
              </li>
              <li>
                <b>Icon tinting.</b> RN&rsquo;s <code>tintColor</code> became a CSS
                mask, so one PNG still serves active and inactive.
              </li>
              <li>
                <b>Pill toggle.</b> Uses the real faceted Figma PNGs, stretched
                the same way the app stretches them &mdash; not a{" "}
                <code>border-radius</code> approximation.
              </li>
              <li>
                <b>Images.</b> Plain <code>src</code>. The app&rsquo;s{" "}
                <code>previewUrl()</code> CDN resizing has no meaning locally.
              </li>
              <li>
                <b>Search and filter glyphs.</b> Text stand-ins. The real
                <code> search.png</code> / <code>filter.png</code> weren&rsquo;t
                copied over &mdash; only the three nav icons and two pill assets
                were.
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Specimen chrome                                                     */
/* ------------------------------------------------------------------ */

/**
 * Stand-in for the app's notification icon. The real one is a PNG in the
 * reference repo's assets; only the three nav icons and two pill assets
 * were copied over, so this is drawn inline rather than faked with an SF
 * Symbols codepoint (which renders as tofu anywhere but iOS).
 */
function BellGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={EV.textSub}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="dr-panel">
      <h2 className="dr-panel-title">{title}</h2>
      {note && <p className="dr-panel-note">{note}</p>}
      <div className="dr-panel-body">{children}</div>
    </section>
  );
}

function Swatch({ name, value }: { name: string; value: string }) {
  const isTransparent = value.startsWith("rgba");
  return (
    <div className="dr-swatch">
      <span
        className="dr-swatch-chip"
        style={{
          background: value,
          backgroundImage: isTransparent
            ? "linear-gradient(45deg,#e9e9e6 25%,transparent 25%,transparent 75%,#e9e9e6 75%),linear-gradient(45deg,#e9e9e6 25%,transparent 25%,transparent 75%,#e9e9e6 75%)"
            : undefined,
          backgroundSize: isTransparent ? "8px 8px" : undefined,
          backgroundPosition: isTransparent ? "0 0, 4px 4px" : undefined,
        }}
      >
        {isTransparent && <span style={{ position: "absolute", inset: 0, background: value }} />}
      </span>
      <code className="dr-swatch-name">{name}</code>
      <code className="dr-swatch-val">{value}</code>
    </div>
  );
}

function Kv({ k, v, swatch }: { k: string; v: string; swatch?: string }) {
  return (
    <div className="dr-kv-row">
      <dt>{k}</dt>
      <dd>
        {swatch && <span className="dr-chip" style={{ background: swatch }} />}
        <code>{v}</code>
      </dd>
    </div>
  );
}
