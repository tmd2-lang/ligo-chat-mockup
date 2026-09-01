/**
 * ChatHub — web port of the real Chat tab's composition.
 *
 * Source: mobile/src/screens/events/ChatHub.tsx, added 2026-08-17.
 *
 * Structure, in the real screen's order:
 *
 *   EvBrandRow (no right icon)
 *   EvPillToggle [All | Events | Clubs]   (wrapped, marginTop 8)
 *   EvSearchBar (placeholder "Search conversations")
 *   then one of:
 *     - skeleton rows (first load only)
 *     - EvChatEmptyState (per-filter copy)
 *     - list of EvChatRow, paddingHorizontal 16
 *
 * THIS IS THE SCREEN THE FEED WOULD REPLACE. The `populated` prop exists
 * because the empty state is the realistic one: per the 2026-08-31 all-
 * hands, ASA has ~100 members on the platform and has never used this
 * tab. Default is empty for that reason — flip it to see what the
 * populated version would have looked like.
 *
 * NOT PORTED: the data layer. The real screen unions event_invites,
 * event_rsvps, and organization_members out of Appwrite, then fans out
 * one last-message query per thread, and tracks per-thread read state.
 * Here it's a static array.
 */
"use client";

import React, { useMemo, useState } from "react";
import {
  EvScreen,
  EvBrandRow,
  EvPillToggle,
  EvSearchBar,
  EvChatRow,
  EvChatEmptyState,
} from "../primitives";
import { accentFor } from "@/lib/ligo/tokens";
import { MOCK_THREADS, CHAT_EMPTY_COPY } from "@/lib/ligo/mockScreens";

type ChatFilter = "All" | "Events" | "Clubs";

export function ChatHubScreen({ populated = false }: { populated?: boolean }) {
  const [filter, setFilter] = useState<ChatFilter>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!populated) return [];
    const q = query.trim().toLowerCase();
    return MOCK_THREADS.filter((t) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Events" && t.threadType === "event") ||
        (filter === "Clubs" && t.threadType === "club");
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [populated, filter, query]);

  const copy = CHAT_EMPTY_COPY[filter];

  return (
    <EvScreen style={{ flex: 1, minHeight: 0 }}>
      <div className="ligo-screen-top">
        <EvBrandRow />
        <div style={{ marginTop: 8 }}>
          <EvPillToggle
            options={["All", "Events", "Clubs"] as const}
            value={filter}
            onChange={setFilter}
            label="Filter conversations"
          />
        </div>
        <EvSearchBar
          value={query}
          onChange={setQuery}
          onFilterPress={() => {}}
          placeholder="Search conversations"
          label="Search conversations"
        />
      </div>

      <div className="ligo-screen-scroll" style={{ paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <EvChatEmptyState
            iconSrc="/ligo-nav/nav-chat.png"
            title={copy.title}
            body={copy.body}
          />
        ) : (
          <div style={{ padding: "8px 16px 0" }}>
            {filtered.map((t) => (
              <EvChatRow
                key={t.key}
                avatarLabel={t.title}
                avatarColor={accentFor(t.title)}
                title={t.title}
                subtitle={t.lastMessage}
                timestamp={t.timestamp}
                unread={t.unread}
                onPress={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </EvScreen>
  );
}
