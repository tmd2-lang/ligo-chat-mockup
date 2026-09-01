/**
 * EventsClubs — web port of the real screen's composition.
 *
 * Source: mobile/src/screens/events/EventsClubs.tsx (the merged
 * Events+Clubs middle tab, renamed from EventsFeed.tsx on 2026-08-17).
 *
 * This reproduces the real screen's STRUCTURE AND ORDER, which is easy
 * to get wrong from memory:
 *
 *   EvBrandRow (right icon = ticket -> "Your Events")
 *   EvPillToggle [Events | Clubs]        <- BEFORE the search bar
 *   if Clubs -> ClubDirectoryBody
 *   if Events:
 *     EvSearchBar (placeholder "event, location, category" — overridden
 *                  here in the real file, not the shared default)
 *     ScrollView:
 *       headline "Everything happening\nat {School}"  (2nd line faint)
 *       for each non-empty row:
 *         EvSectionHeader (+ "See all" when >1)
 *         horizontal carousel of EvPosterCard
 *
 * Row order is the app's: a near-term "Upcoming Events" row, then
 * EVENT_CLUB_CATEGORIES in order, then "More Events" for uncategorized.
 * Empty rows don't render.
 *
 * WHAT IS NOT PORTED: everything behind the data. The real screen reads
 * Appwrite, dedupes to one event per club per row, merges "discovered"
 * events from the ingestion pipeline, keeps cached rows on screen
 * through a background refetch, and has skeleton/error/empty branches.
 * Here the data is a static array. The layout is faithful; the machinery
 * is not there at all.
 */
"use client";

import React, { useMemo, useState } from "react";
import { ClubDetailSheet } from "./ClubDetailSheet";
import {
  EvScreen,
  EvBrandRow,
  EvPillToggle,
  EvSearchBar,
  EvSectionHeader,
  EvPosterCard,
  EvListRow,
  EvAvatarCircle,
  HouseEmptyState,
} from "../primitives";
import { EV, FONT_HEADLINE, accentFor } from "@/lib/ligo/tokens";
import {
  MOCK_EVENTS,
  MOCK_CLUBS,
  CLUB_DETAILS,
  EVENT_CLUB_CATEGORIES,
  type MockEvent,
} from "@/lib/ligo/mockScreens";

type ViewMode = "Events" | "Clubs";

export function EventsClubsScreen({
  school = "Georgetown",
  following,
  onToggleFollow,
  explainFollow,
  onFollowExplained,
}: {
  school?: string;
  /** Club names the user follows — shared with the feed's Following tab. */
  following: Set<string>;
  onToggleFollow: (clubName: string) => void;
  /** True until the user has followed anything — drives the one-time explainer. */
  explainFollow?: boolean;
  onFollowExplained?: () => void;
}) {
  const [view, setView] = useState<ViewMode>("Events");
  const [query, setQuery] = useState("");
  const [openClubId, setOpenClubId] = useState<string | null>(null);
  const [joins, setJoins] = useState<Record<string, "none" | "pending" | "member">>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_EVENTS;
    return MOCK_EVENTS.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.clubName ?? "").toLowerCase().includes(q) ||
        (e.venue ?? "").toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [query]);

  /** Near-term row first, then categories in order, then leftovers. */
  const rows = useMemo(() => {
    const nearTermIds = new Set(["e4", "e5"]);
    const nearTerm = filtered.filter((e) => nearTermIds.has(e.id));
    const later = filtered.filter((e) => !nearTermIds.has(e.id));
    const categorized = new Set(
      later
        .filter((e) =>
          (EVENT_CLUB_CATEGORIES as readonly string[]).includes(e.category)
        )
        .map((e) => e.id)
    );
    return (
      [
        { title: "Upcoming Events", data: nearTerm },
        ...EVENT_CLUB_CATEGORIES.map((cat) => ({
          title: cat as string,
          data: later.filter((e) => e.category === cat),
        })),
        {
          title: "More Events",
          data: later.filter((e) => !categorized.has(e.id)),
        },
      ] as { title: string; data: MockEvent[] }[]
    ).filter((r) => r.data.length > 0);
  }, [filtered]);

  return (
    <EvScreen style={{ flex: 1, minHeight: 0 }}>
      <div className="ligo-screen-top">
        <EvBrandRow
          rightIcon={<TicketGlyph />}
          onRightPress={() => {}}
          rightIconLabel="Your Events"
        />
        <EvPillToggle
          options={["Events", "Clubs"] as const}
          value={view}
          onChange={setView}
          label="Events or clubs"
        />
        {view === "Events" && (
          <EvSearchBar
            value={query}
            onChange={setQuery}
            onFilterPress={() => {}}
            placeholder="event, location, category"
          />
        )}
      </div>

      {view === "Clubs" ? (
        <div className="ligo-screen-scroll" style={{ padding: "8px 20px 48px" }}>
          <EvSectionHeader title="Discover" />
          <div style={{ marginTop: 4 }}>
            {MOCK_CLUBS.map((c) => (
              <EvListRow
                key={c.id}
                avatar={
                  <EvAvatarCircle label={c.name} color={accentFor(c.name)} square />
                }
                title={c.name}
                subtitle={c.category}
                titleLines={2}
                onPress={() => setOpenClubId(c.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="ligo-screen-scroll" style={{ paddingBottom: 48 }}>
          {/* Two lines, second one faint — the app's own headline. */}
          <h1
            style={{
              margin: 0,
              padding: "0 20px",
              marginTop: 24,
              fontFamily: FONT_HEADLINE,
              fontWeight: 400,
              fontSize: 24,
              lineHeight: "36px",
              letterSpacing: "-0.4px",
              color: EV.textStrong,
            }}
          >
            Everything happening
            <br />
            <span style={{ color: EV.textSoft }}>at {school}</span>
          </h1>

          {rows.length > 0 ? (
            rows.map((row) => (
              <section key={row.title} style={{ marginTop: 28 }}>
                <EvSectionHeader
                  title={row.title}
                  actionLabel={row.data.length > 1 ? "See all" : undefined}
                  onAction={row.data.length > 1 ? () => {} : undefined}
                />
                <div
                  className="ligo-carousel"
                  style={{ paddingTop: 16, gap: 12 }}
                >
                  {row.data.map((e) => (
                    <EvPosterCard
                      key={e.id}
                      title={e.title}
                      subtitle={e.clubName ?? e.venue}
                      meta={e.when}
                      imageSrc={e.flyer}
                      imageAlt={`Flyer for ${e.title}`}
                      accent={accentFor(e.id)}
                      onPress={() => {}}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div style={{ marginTop: 24 }}>
              <HouseEmptyState
                title="Nothing on yet"
                body="When clubs post events at your school they'll show up here. Running something? Register your org and post the first one."
              />
            </div>
          )}
        </div>
      )}

      {openClubId && CLUB_DETAILS[openClubId] && (
        <ClubDetailSheet
          club={CLUB_DETAILS[openClubId]}
          following={following.has(CLUB_DETAILS[openClubId].name)}
          joined={joins[openClubId] ?? "none"}
          onToggleFollow={() => onToggleFollow(CLUB_DETAILS[openClubId].name)}
          onJoin={() =>
            setJoins((j) => {
              const cur = j[openClubId] ?? "none";
              if (cur === "pending") return { ...j, [openClubId]: "none" };
              return {
                ...j,
                [openClubId]:
                  CLUB_DETAILS[openClubId].visibility === "private"
                    ? "pending"
                    : "member",
              };
            })
          }
          onClose={() => setOpenClubId(null)}
          explainFollow={explainFollow}
          onFollowExplained={onFollowExplained}
        />
      )}
    </EvScreen>
  );
}

/** Stand-in for the app's ticket.png, tinted EV.textStrong. */
function TicketGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={EV.textStrong}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 9V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a3 3 0 0 0 0 6v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a3 3 0 0 0 0-6z" />
      <path d="M13 6v2M13 11v2M13 16v2" />
    </svg>
  );
}
