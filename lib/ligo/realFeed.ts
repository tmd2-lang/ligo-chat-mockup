/**
 * Real ingested content — the honest version of the feed.
 *
 * Reads the snapshot written by `node scripts/sync-test.mjs`, which pulls
 * The Hoya's WordPress API and Georgetown Athletics' Sidearm calendar for
 * real. Nothing here fetches anything at runtime: the page stays static
 * and offline, it just renders data that came from the actual sources
 * rather than sentences I wrote.
 *
 * WHY THIS EXISTS: every post in mockFeed.ts has a paragraph of decent
 * copy and, on the good ones, real flyer art. Almost nothing that arrives
 * from a real pipe looks like that. An Instagram-sourced event is four
 * facts with no photo (a legal constraint, not a technical one), and
 * Sidearm ships no artwork at all. Only The Hoya brings its own images
 * and prose — and it out-publishes everything else combined.
 *
 * Flip the source toggle on /screens to see the difference. The gap
 * between the two is the design work nobody has done yet.
 */

import snapshot from "./realFeedSnapshot.json";
import type { FeedPost, FeedKind, Season } from "./mockFeed";

type SnapshotPost = {
  id: string;
  sourceLabel?: string;
  source: "hoya" | "voice" | "athletics" | "calendar" | "instagram";
  kind: string;
  author: string;
  authorType: string;
  verified?: boolean;
  publishedAt: string | null;
  title: string;
  section: string | null;
  body: string;
  image: string | null;
  imageAlt: string | null;
  link: string | null;
  action: string | null;
  venue?: string | null;
  categories: string[];
  filter: string;
  _played?: boolean;
  _upcoming?: boolean;
  _synthetic?: boolean;
};

export type SyncSource = {
  url: string | null;
  ok: boolean;
  count: number;
  note?: string;
};

export const SYNC_META = {
  fetchedAt: (snapshot as { fetchedAt: string }).fetchedAt,
  sources: (snapshot as unknown as { sources: Record<string, SyncSource> })
    .sources,
};

/** Snapshot kinds -> the feed's own FeedKind vocabulary. */
const KIND_MAP: Record<string, FeedKind> = {
  paper: "hoya",
  paper_sports: "hoya",
  score: "athletics",
  game: "athletics",
  event_activity: "event_activity",
};

/**
 * The university calendar carries its own categories, so its kind is
 * decided per event rather than per source. Career events belong under
 * Recruiting, lectures get their own label, service under Causes.
 */
function calendarKind(p: SnapshotPost): FeedKind {
  const c = p.categories.map((x) => x.toLowerCase()).join(" ");
  if (/career/.test(c)) return "job";
  if (/lecture/.test(c)) return "lecture";
  if (/social justice|volunteer|community service/.test(c)) return "fundraiser";
  if (/student events|social/.test(c)) return "event_activity";
  return "campus_event";
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(then).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const ALL_SEASONS: Season[] = ["rush", "quiet"];

/**
 * Upcoming games are the bulk of the calendar (166 of 179) and need
 * different handling from everything else.
 *
 * A published article has a publish time. A future game does not — its
 * only date is when it happens. Sorting both on one "newest first"
 * timeline puts a swim meet six months out above this morning's news,
 * which is exactly what happened the first time this ran. The real
 * pipeline will hit the same thing: an event's date and a post's
 * publish time are different quantities and can't share a sort key.
 *
 * So: take the SOONEST few upcoming games, not the furthest, and seat
 * them near the top as "what's coming" rather than letting their future
 * dates win the recency sort outright.
 */
const MAX_UPCOMING_GAMES = 4;

/**
 * The calendar is 343 of 575 items — it would own the feed outright, the
 * same problem the Hoya had before it was added. Capping to the soonest
 * few is a stand-in for real ranking, not a solution to it.
 */
const MAX_CALENDAR_EVENTS = 12;

/** Newest-first for published things; soonest-first for future games. */
function sortKey(p: SnapshotPost, now: number): number {
  const t = p.publishedAt ? Date.parse(p.publishedAt) : 0;
  if (p.kind === "game" || p.kind === "campus_event") {
    // Seat just under "now" so the next game rides near the top without
    // outranking something actually published in the last hour.
    return now - 1 - Math.min(t - now, 1e11) / 1e9;
  }
  return t;
}

export function realPosts(): FeedPost[] {
  const raw = (snapshot as unknown as { posts: SnapshotPost[] }).posts;
  const now = Date.now();

  const upcoming = raw
    .filter((p) => p.kind === "game" && p._upcoming)
    .sort(
      (a, b) => Date.parse(a.publishedAt ?? "") - Date.parse(b.publishedAt ?? "")
    )
    .slice(0, MAX_UPCOMING_GAMES);

  const upcomingIds = new Set(upcoming.map((p) => p.id));

  const calendar = raw
    .filter((p) => p.kind === "campus_event" && p._upcoming)
    .sort(
      (a, b) => Date.parse(a.publishedAt ?? "") - Date.parse(b.publishedAt ?? "")
    )
    .slice(0, MAX_CALENDAR_EVENTS);
  const calendarIds = new Set(calendar.map((p) => p.id));

  const rest = raw.filter(
    (p) => p.kind !== "game" && p.kind !== "campus_event"
  );

  const kept = [...rest, ...calendar, ...upcoming].sort(
    (a, b) => sortKey(b, now) - sortKey(a, now)
  );

  return kept.map((p) => ({
    id: p.id,
    kind:
      p.kind === "campus_event" ? calendarKind(p) : KIND_MAP[p.kind] ?? "announcement",
    author: p.author,
    authorType:
      p.authorType === "publication"
        ? "publication"
        : p.authorType === "system"
        ? "system"
        : p.authorType === "student"
        ? "student"
        : "org",
    // The check now means "official, identifiable publisher" — not
    // "Ligo partner". Discovered clubs from the Instagram pipeline are
    // explicitly NOT verified: the ingestion spec's own constraint is
    // that a scraped, unclaimed org must never look like a partner.
    verified: p.source !== "instagram",
    chipLabel:
      p.source === "hoya" || p.source === "voice" ? p.sourceLabel : undefined,
    timeAgo:
      upcomingIds.has(p.id) || calendarIds.has(p.id)
        ? upcomingLabel(p)
        : timeAgo(p.publishedAt),
    title: p.title,
    body: p.body,
    image: p.image ?? undefined,
    imageAlt: p.imageAlt ?? undefined,
    action: p.action ?? undefined,
    link: p.link ?? undefined,
    // Only future-dated things are worth putting on a calendar.
    startsAt:
      p._upcoming && p.publishedAt ? p.publishedAt : undefined,
    venue: p.venue ?? undefined,
    // Real ingested content has no engagement until someone engages with
    // it. A fabricated like count here would hide the thing worth noticing.
    likes: 0,
    seasons: ALL_SEASONS,
    simulated: !!p._synthetic,
  }));
}

/** Future games read as "Sat" or "Nov 14", never "in -87d". */
function upcomingLabel(p: SnapshotPost): string {
  if (!p.publishedAt) return "";
  const d = new Date(p.publishedAt);
  const days = Math.round((d.getTime() - Date.now()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Counts for the review panel, so the gap is stated and not just felt. */
export function realStats() {
  const posts = (snapshot as unknown as { posts: SnapshotPost[] }).posts;
  const withImage = posts.filter((p) => p.image).length;
  const withProse = posts.filter((p) => (p.body ?? "").length > 60).length;
  return {
    total: posts.length,
    withImage,
    withProse,
    imagePct: Math.round((withImage / posts.length) * 100),
    prosePct: Math.round((withProse / posts.length) * 100),
    bySource: {
      hoya: posts.filter((p) => p.source === "hoya").length,
      voice: posts.filter((p) => p.source === "voice").length,
      athletics: posts.filter((p) => p.source === "athletics").length,
      calendar: posts.filter((p) => p.source === "calendar").length,
      instagram: posts.filter((p) => p.source === "instagram").length,
    },
  };
}
