/**
 * /screens — the real app's screens, as Micah's team built them.
 *
 * Distinct from /design on purpose. /design is a component catalog I
 * arranged; this is the actual composition of two real screens, ported
 * from the read-only reference clone so the tab bar switches between
 * them the way it does in the app.
 *
 * The point of this page is the before/after for the Chat tab: tap Chat
 * to see the screen that would be replaced, tap Events to see the one
 * that works. Everything is static — no Appwrite, no Supabase, no
 * network.
 */
"use client";

import React, { useState } from "react";
import { IOSDevice } from "@/components/IOSDevice";
import { LigoTabBar, type LigoTab } from "@/components/ligo/TabBar";
import { EventsClubsScreen } from "@/components/ligo/screens/EventsClubsScreen";
import { ChatHubScreen } from "@/components/ligo/screens/ChatHubScreen";
import { FeedScreen } from "@/components/ligo/screens/FeedScreen";
import type { Season, Publishing } from "@/lib/ligo/mockFeed";
import { EvScreen } from "@/components/ligo/primitives";
import { EV, FONT_HEADLINE } from "@/lib/ligo/tokens";
import "@/components/ligo/ligo.css";
import "../design/design.css";
import "./screens.css";

export default function RealScreens() {
  const [tab, setTab] = useState<LigoTab>("chat");
  const [chatPopulated, setChatPopulated] = useState(false);
  /** Which screen occupies the left slot — the actual proposal. */
  const [leftSlot, setLeftSlot] = useState<"feed" | "chat">("feed");
  const [season, setSeason] = useState<Season>("rush");
  /* Follow state lives here so the club sheet's Follow button and the
     feed's Following tab are the same thing, not two mock states. */
  const [following, setFollowing] = useState<Set<string>>(
    () => new Set(["Georgetown Program Board", "Sigma Alpha Epsilon", "The Hoya"])
  );
  /* Cleared after the first follow, so the explainer shows once. */
  const [needsFollowIntro, setNeedsFollowIntro] = useState(true);
  const toggleFollow = (name: string) =>
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  const [publishing, setPublishing] = useState<Publishing>("orgs");

  return (
    <main className="dr-stage">
      <header className="dr-head">
        <div className="dr-head-mark">
          <b>LIGO</b>
          <span className="dr-dot" />
          <span>Real screens</span>
        </div>
        <p className="dr-head-sub">
          The actual composition of two shipping screens, ported from the
          read-only <code>ligo-backend</code> clone. Tap the tabs — this is the
          before/after for the Chat tab. Static and offline.
        </p>
        <p className="sc-crosslink">
          Component catalog and tokens live at <a href="/design">/design</a>.
        </p>
      </header>

      <div className="dr-split">
        <section className="dr-phone" aria-label="Ported screens">
          <IOSDevice width={402} height={874}>
            <div className="sc-phone-inner">
              {tab === "chat" &&
                (leftSlot === "feed" ? (
                  <FeedScreen season={season} publishing={publishing} following={following} />
                ) : (
                  <ChatHubScreen populated={chatPopulated} />
                ))}
              {tab === "events" && <EventsClubsScreen
                  school="Georgetown"
                  following={following}
                  onToggleFollow={toggleFollow}
                  explainFollow={needsFollowIntro}
                  onFollowExplained={() => setNeedsFollowIntro(false)}
                />}
              {tab === "profile" && <ProfileNotPorted />}
              <LigoTabBar
                active={tab}
                onChange={setTab}
                tabs={[
                  { id: "chat", label: leftSlot === "feed" ? "Feed" : "Chat" },
                  { id: "events", label: "Events and Clubs" },
                  { id: "profile", label: "Profile" },
                ]}
              />
            </div>
          </IOSDevice>
        </section>

        <div className="dr-specs">
          <section className="dr-panel sc-controls">
            <h2 className="dr-panel-title">Prototype controls</h2>
            <p className="dr-panel-note">
              Review-only. None of this ships &mdash; it exists to reach states
              you couldn&rsquo;t otherwise see without waiting for a real
              semester to go by.
            </p>
            <div className="dr-panel-body sc-control-stack">
              <Seg
                legend="Left tab slot"
                value={leftSlot}
                onChange={(v) => {
                  setLeftSlot(v as "feed" | "chat");
                  setTab("chat");
                }}
                options={[
                  { id: "feed", label: "Feed (proposed)" },
                  { id: "chat", label: "Chat (today)" },
                ]}
                hint="The before/after. Same slot, same three-tab bar."
              />

              {leftSlot === "feed" ? (
                <>
                  <Seg
                    legend="Season"
                    value={season}
                    onChange={(v) => {
                      setSeason(v as Season);
                      setTab("chat");
                    }}
                    options={[
                      { id: "rush", label: "Rush week" },
                      { id: "quiet", label: "Mid-semester" },
                    ]}
                    hint="Mekhi's worry: it looks empty once info sessions come off it and people are just partying. Mid-semester is that week in late October."
                  />
                  <Seg
                    legend="Who can post"
                    value={publishing}
                    onChange={(v) => {
                      setPublishing(v as Publishing);
                      setTab("chat");
                    }}
                    options={[
                      { id: "orgs", label: "Verified orgs" },
                      { id: "community", label: "Campus community" },
                    ]}
                    hint="Orgs-only removes student posts entirely and hides the composer. Community adds them back and turns on the compose button."
                  />
                  <p className="sc-callout">
                    <b>Mid-semester + Verified orgs is the one that answers the
                    question.</b>{" "}
                    It&rsquo;s the worst case, and it&rsquo;s deliberately not
                    padded with invented club posts &mdash; what holds it up is
                    auto-generated event activity, The Hoya, athletics, and
                    alumni news.
                  </p>
                </>
              ) : (
                <Seg
                  legend="Chat contents"
                  value={chatPopulated ? "on" : "off"}
                  onChange={(v) => {
                    setChatPopulated(v === "on");
                    setTab("chat");
                  }}
                  options={[
                    { id: "off", label: "Empty" },
                    { id: "on", label: "Populated" },
                  ]}
                  hint="Empty is the realistic state — ASA has close to 100 members on the platform and has never touched this tab."
                />
              )}
            </div>
          </section>

          <section className="dr-panel">
            <h2 className="dr-panel-title">Chat — what&rsquo;s being replaced</h2>
            <p className="dr-panel-note">
              <code>ChatHub.tsx</code>, added 2026-08-17. Brand row, an
              All/Events/Clubs toggle, a search field, then a thread list
              unioned from event invites, event RSVPs, and club memberships.
            </p>
            <div className="dr-panel-body">
              <ul className="dr-notes">
                <li>
                  <b>The empty state has no CTA</b> — Micah removed every one on
                  2026-08-19: they &ldquo;should just stay empty states until
                  someone either joins a club or RSVPs to an event.&rdquo; So an
                  unused tab offers the student nothing to do.
                </li>
                <li>
                  <b>Its three filters are All / Events / Clubs</b> — a shape
                  worth remembering, since Mekhi proposed{" "}
                  <b>Subscribed / All</b> for the feed. Same control, different
                  cut.
                </li>
                <li>
                  <b>Chat itself isn&rsquo;t going away</b> — it moves into the
                  club page, where members still get chat, members, and club
                  events. Only the tab slot is in question.
                </li>
              </ul>
            </div>
          </section>

          <section className="dr-panel">
            <h2 className="dr-panel-title">Events + Clubs — what works</h2>
            <p className="dr-panel-note">
              <code>EventsClubs.tsx</code>. Note the order, which is easy to get
              wrong from memory: the pill toggle sits <b>above</b> the search
              bar, and the headline lives inside the scroll area, not the header.
            </p>
            <div className="dr-panel-body">
              <ul className="dr-notes">
                <li>
                  <b>Events and Clubs are one tab</b>, merged 2026-08-17 to match
                  Figma&rsquo;s 3-icon bar. The toggle switches a local view;
                  it doesn&rsquo;t navigate.
                </li>
                <li>
                  <b>Rows are ordered</b>: a near-term row first, then the eight
                  categories in fixed order, then &ldquo;More Events&rdquo; for
                  anything uncategorized. Empty rows don&rsquo;t render.
                </li>
                <li>
                  <b>&ldquo;See all&rdquo; appears at more than one entry</b> —
                  dropped from a 3+ threshold on 2026-08-20 once rows were
                  deduped to one event per club.
                </li>
              </ul>
            </div>
          </section>

          <section className="dr-panel">
            <h2 className="dr-panel-title">What this port does not include</h2>
            <p className="dr-panel-note">
              The layout is faithful. The machinery behind it is absent, and
              some of it shapes how the screens actually feel.
            </p>
            <div className="dr-panel-body">
              <ul className="dr-notes">
                <li>
                  <b>No data layer.</b> The real screens read Appwrite. These
                  read a static array — deliberately, so nothing here can touch
                  a live service.
                </li>
                <li>
                  <b>No dedupe or ingestion.</b> The real feed shows one event
                  per club per row and merges &ldquo;discovered&rdquo; events
                  from the Instagram pipeline.
                </li>
                <li>
                  <b>No loading, error, or cache behavior.</b> Both screens have
                  skeletons and keep cached rows on screen through a background
                  refetch — a deliberate fix for Micah&rsquo;s &ldquo;buggy,
                  slow in between screens.&rdquo;
                </li>
                <li>
                  <b>No filter sheet or popover.</b> The filter buttons render
                  and focus correctly but open nothing.
                </li>
                <li>
                  <b>Profile isn&rsquo;t ported</b> — out of scope for a Chat-tab
                  before/after.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/** Review-control segmented switch. Prototype chrome, never shipped UI. */
function Seg({
  legend,
  value,
  onChange,
  options,
  hint,
}: {
  legend: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  hint?: string;
}) {
  return (
    <fieldset className="sc-fieldset">
      <legend className="sc-legend">{legend}</legend>
      <div className="sc-seg" role="radiogroup" aria-label={legend}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            className={`sc-seg-btn${value === o.id ? " is-on" : ""}`}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && <p className="sc-hint">{hint}</p>}
    </fieldset>
  );
}

function ProfileNotPorted() {
  return (
    <EvScreen style={{ flex: 1, minHeight: 0 }}>
      <div
        className="ligo-screen-scroll"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 32px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONT_HEADLINE,
            fontSize: 20,
            color: EV.textStrong,
          }}
        >
          Profile isn&rsquo;t ported
        </p>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 14,
            lineHeight: "20px",
            color: EV.textSub,
          }}
        >
          This page is the before/after for the Chat tab, so only Chat and
          Events + Clubs were brought over.
        </p>
      </div>
    </EvScreen>
  );
}
