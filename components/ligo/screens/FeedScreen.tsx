/**
 * Feed — the proposed replacement for the Chat tab.
 *
 * Built on the ported primitives so it sits next to Events without a
 * seam: same EvScreen background, same brand row, same faceted pill
 * toggle, same EV tokens. It is not a Twitter clone — Micah's framing
 * was "a town hall type thing... an upkeep of everything going around
 * in your school."
 *
 * STRUCTURE follows the existing screens' grammar deliberately:
 *
 *   EvBrandRow (right icon = compose, community mode only)
 *   EvPillToggle [Following | All]    <- Mekhi's proposal, 2026-08-31
 *   category filter chips (horizontally scrollable)
 *   post list
 *
 * Following/All is the primary axis rather than category chips because
 * it's the sharper answer to the emptiness worry: All never looks dead,
 * Following is the personalized cut. "Following" rather than Mekhi's
 * word "subscribed" because the app already ships a real Follow action
 * on ClubDetail, backed by the club_follows collection — this reuses
 * that concept rather than inventing a parallel one.
 *
 * Everything is static. No network.
 */
"use client";

import React, { useMemo, useState } from "react";
import {
  EvScreen,
  EvBrandRow,
  EvPillToggle,
  EvAvatarCircle,
  HouseEmptyState,
} from "../primitives";
import { EV, EV_CHAT, FONT_HEADLINE, accentFor, withAlpha } from "@/lib/ligo/tokens";
import {
  visiblePosts,
  KIND_META,
  FILTERS,
  type FeedPost,
  type FilterId,
  type Season,
  type Publishing,
} from "@/lib/ligo/mockFeed";
import { realPosts } from "@/lib/ligo/realFeed";

type Scope = "Following" | "All";

export function FeedScreen({
  season,
  publishing,
  following,
  dataSource = "authored",
}: {
  season: Season;
  publishing: Publishing;
  /** Clubs the user follows — set from the club sheet's Follow button. */
  following: Set<string>;
  /**
   * "authored" = the posts I wrote, which are uniformly well-formed.
   * "real"     = what actually comes out of The Hoya, Voice, athletics,
   *              university calendar, and Instagram Business Discovery
   *              snapshots. Season/publishing toggles do not rewrite it.
   */
  dataSource?: "authored" | "real";
}) {
  const [scope, setScope] = useState<Scope>("All");
  const [filter, setFilter] = useState<FilterId>("all");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [composerOpen, setComposerOpen] = useState(false);
  const [drafts, setDrafts] = useState<FeedPost[]>([]);

  const sourcePosts = useMemo(
    () => (dataSource === "real" ? realPosts() : visiblePosts(season, publishing)),
    [dataSource, season, publishing]
  );

  const posts = useMemo(() => {
    const base = [...drafts, ...sourcePosts];
    return base.filter((p) => {
      if (scope === "Following" && !following.has(p.author)) return false;
      if (filter !== "all" && KIND_META[p.kind].filter !== filter) return false;
      return true;
    });
  }, [sourcePosts, scope, filter, drafts, following]);

  /** Drop filter chips that would match nothing in the current state. */
  const availableFilters = useMemo(() => {
    const live = new Set(
      [...drafts, ...sourcePosts]
        .filter((p) => scope === "All" || following.has(p.author))
        .map((p) => KIND_META[p.kind].filter)
    );
    return FILTERS.filter((f) => f.id === "all" || live.has(f.id));
  }, [sourcePosts, scope, drafts, following]);

  // A filter can go stale when the season or scope changes under it.
  React.useEffect(() => {
    if (!availableFilters.some((f) => f.id === filter)) setFilter("all");
  }, [availableFilters, filter]);

  return (
    <EvScreen style={{ flex: 1, minHeight: 0 }}>
      <div className="ligo-screen-top">
        <EvBrandRow
          rightIcon={publishing === "community" ? <ComposeGlyph /> : undefined}
          onRightPress={
            publishing === "community" ? () => setComposerOpen(true) : undefined
          }
          rightIconLabel="New post"
        />

        <EvPillToggle
          options={["Following", "All"] as const}
          value={scope}
          onChange={setScope}
          label="Feed scope"
        />

        <div
          className="ligo-carousel ligo-feed-filters"
          role="group"
          aria-label="Filter by category"
        >
          {availableFilters.map((f) => {
            const on = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                className="ligo-pressable ligo-feed-chip"
                aria-pressed={on}
                onClick={() => setFilter(f.id)}
                style={{
                  background: on ? EV.textStrong : "#fff",
                  color: on ? "#fff" : EV.textSub,
                  border: `1px solid ${on ? EV.textStrong : EV.border}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ligo-screen-scroll" style={{ paddingBottom: 24 }}>
        {posts.length === 0 ? (
          <HouseEmptyState
            title={
              scope === "Following"
                ? "Nothing from your clubs yet"
                : "Nothing here right now"
            }
            body={
              scope === "Following"
                ? "Switch to All to see everything at Georgetown, or open Events \u2192 Clubs and follow a few."
                : "Try a different category."
            }
          />
        ) : (
          <ul className="ligo-feed-list">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                liked={!!liked[p.id]}
                saved={!!saved[p.id]}
                onLike={() =>
                  setLiked((s) => ({ ...s, [p.id]: !s[p.id] }))
                }
                onSave={() =>
                  setSaved((s) => ({ ...s, [p.id]: !s[p.id] }))
                }
              />
            ))}
          </ul>
        )}
      </div>

      {composerOpen && (
        <Composer
          onClose={() => setComposerOpen(false)}
          onPost={(post) => {
            setDrafts((d) => [post, ...d]);
            setComposerOpen(false);
          }}
        />
      )}
    </EvScreen>
  );
}

/* ------------------------------------------------------------------ */
/* Add to calendar                                                     */
/* ------------------------------------------------------------------ */

/**
 * Builds a real RFC 5545 file and hands it to the browser.
 *
 * Deliberately NOT an RSVP. RSVP implies Ligo owns a guest list, and for
 * a scraped listing it doesn't — the ingestion spec's own rule is that a
 * discovered event must never look like a partner event. "Add to
 * calendar" makes no such claim: it just puts the thing on your phone.
 */
function icsEscape(v = "") {
  return v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function downloadIcs(post: FeedPost) {
  if (!post.startsAt) return;
  const start = new Date(post.startsAt);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ligo//Campus Feed Prototype//EN",
    "BEGIN:VEVENT",
    `UID:${post.id}@ligo.prototype`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    `SUMMARY:${icsEscape(post.title ?? "Georgetown event")}`,
    post.venue ? `LOCATION:${icsEscape(post.venue)}` : null,
    post.link ? `URL:${post.link}` : null,
    `DESCRIPTION:${icsEscape(post.body ?? "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(post.title ?? "event").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------------ */
/* Post                                                                */
/* ------------------------------------------------------------------ */

function PostCard({
  post,
  liked,
  saved,
  onLike,
  onSave,
}: {
  post: FeedPost;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
}) {
  const meta = KIND_META[post.kind];
  const accent = accentFor(post.author);
  const isSystem = post.authorType === "system";

  return (
    <li className={`ligo-feed-card${post.simulated ? " is-simulated" : ""}`}>
      {post.simulated && (
        <p className="ligo-feed-sim">
          Simulated fallback content — invented wording for layout review.
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {post.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="ligo-feed-avatar"
            src={post.avatar}
            alt=""
            width={36}
            height={36}
          />
        ) : (
          <EvAvatarCircle label={post.author} color={accent} size={36} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="ligo-feed-author">{post.author}</span>
            {post.verified && <VerifiedGlyph />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="ligo-feed-kind"
              style={{
                background: withAlpha(accent, 0.16),
                color: EV.textSub,
              }}
            >
              {post.chipLabel ?? meta.label}
            </span>
            <span className="ligo-feed-time">{post.timeAgo}</span>
          </div>
        </div>
      </div>

      {/* System posts read as activity, not authored prose. */}
      {isSystem ? (
        <p className="ligo-feed-activity">
          <span style={{ color: EV.textSub }}>{post.body}</span>
        </p>
      ) : null}

      {post.title && (
        <h3 className="ligo-feed-title" style={{ fontFamily: FONT_HEADLINE }}>
          {post.link ? (
            <a
              className="ligo-feed-titlelink"
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {post.title}
            </a>
          ) : (
            post.title
          )}
        </h3>
      )}

      {!isSystem && <p className="ligo-feed-body">{post.body}</p>}

      {post.image && (
        <div className="ligo-feed-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="ligo-feed-image"
            src={post.image}
            alt={post.imageAlt ?? ""}
          />
          {post.mediaType && post.mediaType !== "IMAGE" && (
            <span className="ligo-feed-media-badge">
              {post.mediaType === "VIDEO" ? "Reel" : "Carousel"}
            </span>
          )}
        </div>
      )}

      <div className="ligo-feed-actions">
        <button
          type="button"
          className="ligo-pressable ligo-feed-action"
          onClick={onLike}
          aria-pressed={liked}
          aria-label={liked ? `Unlike post from ${post.author}` : `Like post from ${post.author}`}
          style={{ color: liked ? EV.orange : EV.textSoft }}
        >
          <HeartGlyph filled={liked} />
          <span>{post.likes + (liked ? 1 : 0)}</span>
        </button>

        <button
          type="button"
          className="ligo-pressable ligo-feed-action"
          onClick={onSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove saved post from ${post.author}` : `Save post from ${post.author}`}
          style={{ color: saved ? EV.textStrong : EV.textSoft }}
        >
          <BookmarkGlyph filled={saved} />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>

        {post.action && <PostAction post={post} />}
      </div>
    </li>
  );
}

/**
 * Three shapes, and the difference is honest:
 *   - a link out to the source        (Read / Details / Get tickets)
 *   - a generated calendar file       (Add to calendar)
 *   - inert                           (RSVP on simulated content)
 */
function PostAction({ post }: { post: FeedPost }) {
  const label = post.action ?? "";

  if (label === "Add to calendar" && post.startsAt) {
    return (
      <button
        type="button"
        className="ligo-pressable ligo-feed-cta"
        onClick={() => downloadIcs(post)}
      >
        {label}
      </button>
    );
  }

  if (post.link) {
    return (
      <a
        className="ligo-pressable ligo-feed-cta"
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
        <span style={{ marginLeft: 5, fontSize: 11 }} aria-hidden="true">↗</span>
      </a>
    );
  }

  // Nothing to open — simulated content, or an authored post with no
  // source. Rendered flat so it doesn't invite a click that does nothing.
  return (
    <span className="ligo-feed-cta is-inert" aria-hidden="true">
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Composer — community mode only                                      */
/* ------------------------------------------------------------------ */

/**
 * Constrained on purpose. Mekhi wanted students to "feel some type of
 * feeling of posting" while explicitly not wanting UGC, so this offers
 * three shapes Micah named on the call rather than a blank status box.
 */
const STUDENT_POST_TYPES = [
  { id: "made", label: "Something I made", hint: "A track, a set of photos, a film" },
  { id: "wrote", label: "Something I wrote", hint: "A piece, a review, an explainer" },
  { id: "did", label: "Something I did", hint: "A performance, a win, a project" },
] as const;

function Composer({
  onClose,
  onPost,
}: {
  onClose: () => void;
  onPost: (p: FeedPost) => void;
}) {
  const [type, setType] = useState<(typeof STUDENT_POST_TYPES)[number]["id"]>("made");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const canPost = title.trim().length > 0 && body.trim().length > 0;

  return (
    <div className="ligo-sheet-scrim" role="presentation" onClick={onClose}>
      <div
        className="ligo-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="New post"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ligo-sheet-grip" aria-hidden="true" />
        <h2 className="ligo-sheet-title" style={{ fontFamily: FONT_HEADLINE }}>
          Share with Georgetown
        </h2>

        <div role="radiogroup" aria-label="Post type" className="ligo-sheet-types">
          {STUDENT_POST_TYPES.map((t) => {
            const on = t.id === type;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                className="ligo-pressable ligo-sheet-type"
                onClick={() => setType(t.id)}
                style={{
                  background: on ? withAlpha(EV.orange, 0.12) : "#fff",
                  borderColor: on ? EV.orange : EV.border,
                }}
              >
                <span style={{ color: on ? EV.orangeText : EV.textStrong, fontWeight: 600 }}>
                  {t.label}
                </span>
                <span style={{ color: EV.textSoft, fontSize: 12 }}>{t.hint}</span>
              </button>
            );
          })}
        </div>

        <label className="ligo-sheet-label" htmlFor="composer-title">
          Title
        </label>
        <input
          id="composer-title"
          className="ligo-sheet-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New single — 'Prospect St.'"
        />

        <label className="ligo-sheet-label" htmlFor="composer-body">
          Details
        </label>
        <textarea
          id="composer-body"
          className="ligo-sheet-input ligo-sheet-textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="A sentence or two about it."
          rows={3}
        />

        <div className="ligo-sheet-actions">
          <button type="button" className="ligo-pressable ligo-sheet-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ligo-pressable ligo-sheet-post"
            disabled={!canPost}
            onClick={() =>
              onPost({
                id: `draft-${Date.now()}`,
                kind: "student",
                author: "Cole Brennan",
                authorType: "student",
                timeAgo: "now",
                title: title.trim(),
                body: body.trim(),
                likes: 0,
                seasons: ["rush", "quiet"],
              })
            }
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Glyphs                                                              */
/* ------------------------------------------------------------------ */

function ComposeGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={EV.textStrong}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function VerifiedGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={EV.orange} aria-label="Verified organization" role="img">
      <path d="M12 1.5l2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1.4 2.9 1.4 2.9-2.8 1.6-.9 3.1-3.2-.3L12 22.5l-2.4-2.1-3.2.3-.9-3.1-2.8-1.6L4.1 13 2.7 10.1l2.8-1.6.9-3.1 3.2.3z" />
      <path d="M10.6 15.2l-2.8-2.8 1.3-1.3 1.5 1.5 3.9-3.9 1.3 1.3z" fill="#fff" />
    </svg>
  );
}

function HeartGlyph({ filled }: { filled: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.7-7.7 1.1-1a5.5 5.5 0 0 0 0-7.9z" />
    </svg>
  );
}

function BookmarkGlyph({ filled }: { filled: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export { EV_CHAT };
