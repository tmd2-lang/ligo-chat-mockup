/**
 * Sync harness — proves what's actually pullable for the campus feed.
 *
 * Answers Micah's question from 2026-09-02 ("what API things can we sync?
 * ... what's possible to sync?") with real data instead of a guess.
 *
 * Four sources, all public, all read-only:
 *
 *   The Hoya         thehoya.com/wp-json/wp/v2/posts            (WordPress)
 *   The Voice        georgetownvoice.com/wp-json/wp/v2/posts    (WordPress)
 *   Athletics        guhoyas.com/calendar.ashx/calendar.ics     (Sidearm)
 *   Univ. calendar   events.georgetown.edu/live/ical/events     (LiveWhale)
 *
 * Instagram is NOT fetched. It can't be — it needs Meta to approve
 * `instagram_business_basic` (see the reference repo's
 * docs/meta_app_review_submission.md, whose checklist is unsubmitted) plus
 * a club that has actually connected. Instead this synthesizes posts in
 * the exact shape Micah's own extractor returns — four facts, no caption,
 * no photo — so the feed shows how thin they'll really look.
 *
 * WHAT THIS DOES NOT DO: touch Appwrite, touch Supabase, write anywhere
 * except one local JSON file. Four GET requests, that's it.
 *
 * Run:  node scripts/sync-test.mjs
 * Out:  lib/ligo/realFeedSnapshot.json  +  a report on stdout
 *
 * The normalizer below is the actual deliverable. Whatever mapping this
 * lands on is the logic that would move to an Appwrite function.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "lib/ligo/realFeedSnapshot.json");

/** guhoyas sits behind Imperva and 403s a bare client. */
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const SOURCES = {
  hoya: {
    label: "The Hoya",
    url: "https://thehoya.com/wp-json/wp/v2/posts?per_page=30&_embed=1",
  },
  voice: {
    label: "The Georgetown Voice",
    url: "https://georgetownvoice.com/wp-json/wp/v2/posts?per_page=20&_embed=1",
  },
  athletics: {
    label: "Georgetown Athletics",
    url: "https://guhoyas.com/calendar.ashx/calendar.ics",
  },
  calendar: {
    label: "Georgetown Events Calendar",
    url: "https://events.georgetown.edu/live/ical/events",
  },
};

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const ENTITIES = {
  "&amp;": "&", "&#038;": "&", "&lt;": "<", "&gt;": ">",
  "&quot;": '"', "&#8217;": "’", "&#8216;": "‘",
  "&#8220;": "“", "&#8221;": "”", "&#8211;": "–",
  "&#8212;": "—", "&nbsp;": " ", "&hellip;": "…", "&#039;": "'",
  "&#160;": " ", "&#8230;": "…",
};

function clean(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#?\w+;/g, (m) => ENTITIES[m] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function get(url, asText = false) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return asText ? res.text() : res.json();
}

/* ------------------------------------------------------------------ */
/* WordPress papers — The Hoya and The Voice                           */
/* ------------------------------------------------------------------ */

/**
 * Both papers ship all-caps section prefixes on some headlines:
 *   "WOMEN'S SOCCER | Hoyas Look to Replace Graduates"
 * Split it — the prefix duplicates the category chip we already render.
 */
function splitTitle(raw) {
  const t = clean(raw);
  const m = t.match(/^([A-Z0-9'’&.\- ]{3,40})\s*\|\s*(.+)$/);
  if (m && m[1] === m[1].toUpperCase()) {
    return { section: m[1].trim(), title: m[2].trim(), hadPrefix: true };
  }
  return { section: null, title: t, hadPrefix: false };
}

async function fetchPaper(key) {
  const { label, url } = SOURCES[key];
  const raw = await get(url);

  return raw.map((p) => {
    const { section, title, hadPrefix } = splitTitle(p.title.rendered);
    const groups = p?._embedded?.["wp:term"] ?? [];
    const cats = (groups[0] ?? []).map((t) => t.name).filter(Boolean);
    const img = p?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
    const isSports = cats.some((c) => /sport/i.test(c));

    return {
      id: `${key}-${p.id}`,
      source: key,
      sourceLabel: label,
      kind: isSports ? "paper_sports" : "paper",
      author: label,
      authorType: "publication",
      verified: true,
      publishedAt: p.date,
      title,
      section,
      body: clean(p.excerpt.rendered).replace(/\s*\[…\]\s*$/, "…"),
      image: img,
      imageAlt: img ? `Photo from ${label}: ${title}` : null,
      link: p.link,
      action: "Read",
      categories: cats,
      filter: "campus",
      _hadTitlePrefix: hadPrefix,
    };
  });
}

/* ------------------------------------------------------------------ */
/* iCalendar                                                           */
/* ------------------------------------------------------------------ */

/**
 * Field-name extraction has to be anchored, not greedy. LiveWhale stuffs
 * raw HTML into DESCRIPTION, and that HTML is full of colons (`https://`,
 * `style="…"`), so a loose `\w+:` scan invents dozens of phantom fields.
 */
function parseIcs(text) {
  const unfolded = text.replace(/\r?\n[ \t]/g, "").replace(/\r\n/g, "\n");
  const blocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  return blocks.map((b) => {
    const get1 = (key) => {
      const m = b.match(new RegExp(`^${key}(?:;[^:\\n]*)?:(.*)$`, "m"));
      return m ? m[1].trim() : "";
    };
    return {
      uid: get1("UID"),
      start: get1("DTSTART"),
      startRaw: (b.match(/^DTSTART[^:\n]*:.*$/m) || [""])[0],
      end: get1("DTEND"),
      summary: get1("SUMMARY"),
      location: get1("LOCATION"),
      url: get1("URL"),
      description: get1("DESCRIPTION"),
      categories: get1("CATEGORIES"),
      image: get1("X-LIVEWHALE-IMAGE"),
      rrule: get1("RRULE"),
      raw: b,
    };
  });
}

/**
 * DTSTART comes in two flavours and they are NOT interchangeable:
 *
 *   Sidearm      DTSTART:20260813T233000            -> already UTC
 *   LiveWhale    DTSTART;TZID=America/New_York:...  -> local wall clock
 *
 * Treating the second as UTC put every university event four hours off —
 * a 4:30pm mixer rendered as 12:30pm. Caught by reading a generated .ics
 * against the source record.
 *
 * US Eastern DST rule hardcoded (2nd Sunday of March 2am -> 1st Sunday of
 * November 2am), same approach as the backend's own icsParser.js, since
 * Georgetown is the only campus this targets.
 */
function easternOffsetHours(y, mo, d) {
  const march = new Date(Date.UTC(y, 2, 1));
  const dstStart = 8 + ((7 - march.getUTCDay()) % 7) + 7; // 2nd Sunday
  const nov = new Date(Date.UTC(y, 10, 1));
  const dstEnd = 1 + ((7 - nov.getUTCDay()) % 7); // 1st Sunday
  const afterStart = mo > 3 || (mo === 3 && d >= dstStart);
  const beforeEnd = mo < 11 || (mo === 11 && d < dstEnd);
  return afterStart && beforeEnd ? 4 : 5;
}

function icsDateToIso(v, rawLine = "") {
  const isLocal = /TZID=/i.test(rawLine) && !/\dZ\s*$/.test(v);
  let m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (m) {
    const [, y, mo, d, h, mi, s] = m.map(Number.isNaN ? String : (x) => x);
    const Y = +y, MO = +mo, D = +d, H = +h, MI = +mi, S = +s;
    const shift = isLocal ? easternOffsetHours(Y, MO, D) : 0;
    return new Date(Date.UTC(Y, MO - 1, D, H + shift, MI, S)).toISOString();
  }
  m = v.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) {
    const [, y, mo, d] = m;
    return new Date(Date.UTC(+y, +mo - 1, +d, 12, 0, 0)).toISOString();
  }
  return null;
}

function unescapeIcs(v = "") {
  return v.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";");
}

/* ------------------------------------------------------------------ */
/* Athletics (Sidearm)                                                 */
/* ------------------------------------------------------------------ */

function parseGame(ev) {
  let s = ev.summary;

  // Real prefixes across the 179 events: none (165), [W] (7), [L] (4),
  // [T] (2), CANCELLED (1). Strip status markers in any order first, or
  // "Georgetown University" survives into the sport name.
  let result = null;
  let status = null;
  for (let i = 0; i < 3; i++) {
    const rm = s.match(/^\[([WLT])\]\s*/);
    if (rm) { result = rm[1]; s = s.slice(rm[0].length); continue; }
    const cm = s.match(/^(CANCELLED|POSTPONED|TBA)\s+/i);
    if (cm) { status = cm[1].toUpperCase(); s = s.slice(cm[0].length); continue; }
    break;
  }
  s = s.replace(/^Georgetown University\s+/, "");

  const vm = s.match(/^(.*?)\s+(vs|at)\s+(.*)$/);
  const sport = vm ? vm[1].trim() : s.trim();
  const home = vm ? vm[2] === "vs" : null;
  const opponent = vm ? vm[3].trim() : null;

  const desc = unescapeIcs(ev.description);
  const sm = desc.match(/\b([WLT])\s+(\d+)\s*-\s*(\d+)\b/);
  const tick = desc.match(/Tickets:\s*(\S+)/);
  const tv = desc.match(/TV:\s*([^\n]+)/);

  return {
    sport, opponent, home, result, status,
    score: sm ? `${sm[2]}-${sm[3]}` : null,
    tickets: tick ? tick[1] : null,
    tv: tv ? tv[1].trim() : null,
    venue: unescapeIcs(ev.location).replace(/\s+/g, " ").trim(),
  };
}

async function fetchAthletics() {
  const events = parseIcs(await get(SOURCES.athletics.url, true));
  const now = Date.now();

  return events.map((ev) => {
    const g = parseGame(ev);
    const iso = icsDateToIso(ev.start, ev.startRaw);
    const played = !!g.result;
    const verb = g.result === "W" ? "beat" : g.result === "L" ? "fell to" : "drew";

    const title = g.status
      ? `${g.sport} ${g.home ? "vs" : "at"} ${g.opponent} — ${g.status}`
      : played
      ? `${g.sport} ${verb} ${g.opponent}${g.score ? ` ${g.score}` : ""}`
      : `${g.sport} ${g.home ? "vs" : "at"} ${g.opponent}`;

    return {
      id: `ath-${ev.uid || Math.random().toString(36).slice(2)}`,
      source: "athletics",
      sourceLabel: SOURCES.athletics.label,
      kind: played ? "score" : "game",
      author: "Georgetown Athletics",
      authorType: "org",
      verified: true,
      publishedAt: iso,
      title,
      section: g.sport,
      body: played
        ? `Final at ${g.venue || "TBA"}.`
        : `${g.home ? "Home" : "Away"} · ${g.venue || "TBA"}${g.tv ? ` · ${g.tv}` : ""}`,
      // Sidearm ships no artwork at all. This is the fallback-image case.
      image: null,
      imageAlt: null,
      link: (ev.url || "").replace(/&amp;/g, "&") || null,
      action: g.status ? null : played ? null : g.tickets ? "Get tickets" : "Add to calendar",
      categories: [g.sport, played ? "Result" : "Upcoming"],
      filter: "campus",
      venue: g.venue || null,
      _played: played,
      _upcoming: iso ? Date.parse(iso) > now : false,
    };
  });
}

/* ------------------------------------------------------------------ */
/* University events calendar (LiveWhale)                              */
/* ------------------------------------------------------------------ */

/** Categories -> the feed's own filter buckets. */
function calendarFilter(cats) {
  const l = cats.map((c) => c.toLowerCase()).join(" ");
  if (/career/.test(l)) return "recruiting";
  if (/social justice|community|religious|volunteer/.test(l)) return "causes";
  if (/student events|social|special events/.test(l)) return "events";
  return "campus";
}

/**
 * Two real data problems in this feed, both found by running it:
 *
 * RECURRENCE — LiveWhale expands RRULE into one row per occurrence. A
 * weekly research meeting became 8 rows; "Track Down a Jack!" became 12.
 * Dropped straight into a feed, one standing meeting buries everything
 * else. Collapse to the next upcoming occurrence per series.
 *
 * CROSS-POSTER DUPLICATES — the Fall Career Fair appears three times
 * under three titles ("2026 Annual Fall Georgetown Career Fair",
 * "Annual Fall Career Fair", "2026 Annual Fall Career Fair") because
 * three departments each posted it. Not recurrence — genuinely different
 * records for one event. Keyed on normalized-title + start time, which
 * catches these three; a stricter matcher would need fuzzier titles.
 */
function normalizeTitleKey(t) {
  return t
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, "")
    .replace(/\b(annual|the|a|an|georgetown|gu)\b/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

async function fetchCalendar() {
  const events = parseIcs(await get(SOURCES.calendar.url, true));
  const now = Date.now();

  // CROSS-SOURCE DUPLICATE: the university calendar also carries
  // athletics, so every game arrived twice — once here and once from
  // Sidearm. Sidearm's version is strictly better (scores, ticket links,
  // clean opponent parsing), so drop the calendar's copies. This is the
  // first real case of two feeds covering the same event, and it won't
  // be the last once more sources land.
  let droppedAthletics = 0;
  const mapped = events.filter((ev) => {
    const isAth = /athletic/i.test(ev.categories || "") ||
      /Georgetown University (Men's|Women's)/.test(ev.summary || "");
    if (isAth) droppedAthletics++;
    return !isAth;
  }).map((ev) => {
    const iso = icsDateToIso(ev.start, ev.startRaw);
    const cats = unescapeIcs(ev.categories)
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const title = clean(unescapeIcs(ev.summary));
    const body = clean(unescapeIcs(ev.description)).slice(0, 220);
    const loc = clean(unescapeIcs(ev.location));
    const img = ev.image || null;

    return {
      id: `cal-${ev.uid || Math.random().toString(36).slice(2)}`,
      source: "calendar",
      sourceLabel: SOURCES.calendar.label,
      kind: "campus_event",
      // The category is NOT the author. First pass used cats[0] and the
      // feed showed posts by "Community" and "Student Events", which are
      // topics, not publishers. LiveWhale exposes no per-event owner, so
      // the honest attribution is the university itself; the category
      // stays as the section chip.
      author: "Georgetown University",
      authorType: "org",
      verified: true,
      publishedAt: iso,
      title,
      section: cats[0] || null,
      body: loc ? `${loc}${body ? ` — ${body}` : ""}` : body,
      image: img,
      imageAlt: img ? `Image for ${title}` : null,
      link: ev.url || null,
      action: "Add to calendar",
      categories: cats,
      filter: calendarFilter(cats),
      venue: loc || null,
      _upcoming: iso ? Date.parse(iso) > now : false,
      _recurring: !!ev.rrule,
      _seriesKey: normalizeTitleKey(title),
      _dedupeKey: `${normalizeTitleKey(title)}|${(ev.start || "").slice(0, 11)}`,
    };
  });

  // Collapse both problems: one row per series, soonest upcoming wins.
  const bySeries = new Map();
  let collapsedRecurring = 0;
  let collapsedDuplicates = 0;

  const upcoming = mapped
    .filter((e) => e._upcoming)
    .sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt));

  for (const e of upcoming) {
    if (bySeries.has(e._seriesKey)) {
      if (e._recurring) collapsedRecurring++;
      else collapsedDuplicates++;
      continue;
    }
    bySeries.set(e._seriesKey, e);
  }

  return {
    posts: [...bySeries.values()],
    stats: {
      raw: mapped.length,
      droppedAthletics,
      upcoming: upcoming.length,
      kept: bySeries.size,
      collapsedRecurring,
      collapsedDuplicates,
      withImage: mapped.filter((e) => e.image).length,
      withLocation: mapped.filter((e) => clean(unescapeIcs(e.body)).length > 0).length,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Instagram (synthesized — cannot be fetched)                         */
/* ------------------------------------------------------------------ */

/**
 * Shaped exactly like instagramCaptionExtractor.js's return value: four
 * facts and nothing else. No caption text, no photo — a legal constraint
 * in the existing code, not a technical one, and it holds even for a club
 * that has consented.
 */
const INSTAGRAM_SHAPE = [
  { org: "Alpha Kappa Psi", title: "Fall Info Night", date: "2026-09-08", time: "7:00 PM", location: "Hariri 140" },
  { org: "South Asian Society", title: "Rangila Auditions", date: "2026-09-06", time: "2:00 PM", location: "McNeir Hall" },
  { org: "GU Best Buddies", title: "Friendship Walk", date: "2026-11-08", time: "10:00 AM", location: "Copley Lawn" },
];

function synthesizeInstagram() {
  return INSTAGRAM_SHAPE.map((f, i) => ({
    id: `ig-${i}`,
    source: "instagram",
    sourceLabel: "Club Instagram (synthesized)",
    kind: "event_activity",
    author: f.org,
    authorType: "system",
    // A club discovered through Instagram has not onboarded to Ligo and
    // must not be presented as if it had — see the ingestion spec's
    // "must not look like a partner" constraint.
    verified: false,
    publishedAt: new Date(Date.now() - (i + 1) * 5400000).toISOString(),
    title: f.title,
    section: null,
    body: `${new Date(f.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · ${f.time} · ${f.location}`,
    image: null,
    imageAlt: null,
    link: null,
    action: "RSVP",
    categories: ["Event"],
    filter: "events",
    _synthetic: true,
  }));
}

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

const pct = (n, d) => (d === 0 ? "0%" : `${Math.round((n / d) * 100)}%`);
const L = (s = "") => console.log(s);

function paperReport(name, posts, url) {
  const imgs = posts.filter((p) => p.image).length;
  const fixed = posts.filter((p) => p._hadTitlePrefix).length;
  const days = {};
  posts.forEach((p) => {
    const d = (p.publishedAt || "").slice(0, 10);
    if (d) days[d] = (days[d] || 0) + 1;
  });
  const per = Object.values(days);
  const avg = per.length ? (per.reduce((a, b) => a + b, 0) / per.length).toFixed(1) : "0";

  L();
  L(`${name.toUpperCase()}  ·  ${url.split("?")[0].replace("https://", "")}`);
  if (!posts.length) return L("  FAILED / empty");
  L(`  posts              ${posts.length}`);
  L(`  with image         ${imgs}/${posts.length}  (${pct(imgs, posts.length)})`);
  L(`  title cleanup      ${fixed}/${posts.length}  ("SECTION | Headline")`);
  L(`  rate               ~${avg}/day across ${per.length} days seen`);
  posts.slice(0, 2).forEach((p) =>
    L(`    · ${p.section ? `[${p.section}] ` : ""}${p.title.slice(0, 56)}`)
  );
}

function report(hoya, voice, ath, cal, calStats, ig) {
  L();
  L("═".repeat(68));
  L("  LIGO FEED — SYNC TEST   (4 live sources + 1 blocked)");
  L("═".repeat(68));

  paperReport("The Hoya", hoya, SOURCES.hoya.url);
  paperReport("The Georgetown Voice", voice, SOURCES.voice.url);

  // Athletics
  const played = ath.filter((g) => g._played);
  const withScore = played.filter((g) => /\d+-\d+/.test(g.title)).length;
  const tickets = ath.filter((g) => g.action === "Get tickets").length;
  L();
  L("ATHLETICS  ·  guhoyas.com/calendar.ashx/calendar.ics  (Sidearm)");
  L(`  events             ${ath.length}`);
  L(`  played / upcoming  ${played.length} / ${ath.length - played.length}`);
  L(`  with real score    ${withScore}/${played.length}`);
  L(`  with ticket link   ${tickets}`);
  L(`  with image         0/${ath.length}   <-- Sidearm ships no artwork`);
  played.slice(0, 2).forEach((g) => L(`    · ${g.title}`));

  // University calendar
  L();
  L("UNIVERSITY CALENDAR  ·  events.georgetown.edu/live/ical/events  (LiveWhale)");
  L(`  raw rows           ${calStats.raw}`);
  L(`  upcoming           ${calStats.upcoming}`);
  L(`  after collapsing   ${calStats.kept}`);
  L(`    - recurrence     -${calStats.collapsedRecurring}  (RRULE expanded into one row per occurrence)`);
  L(`    - duplicates     -${calStats.collapsedDuplicates}  (same event posted by several departments)`);
  L(`    - athletics      -${calStats.droppedAthletics}  (already covered by Sidearm, with scores and tickets)`);
  L(`  with image         ${calStats.withImage}/${calStats.raw}  (${pct(calStats.withImage, calStats.raw)})  <-- brings its own art`);
  const catCount = {};
  cal.forEach((e) => e.categories.forEach((c) => (catCount[c] = (catCount[c] || 0) + 1)));
  const top = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  L(`  top categories     ${top.map(([c, n]) => `${c} (${n})`).join(", ")}`);
  cal.slice(0, 3).forEach((e) => L(`    · ${e.title.slice(0, 58)}`));

  // Instagram
  L();
  L("CLUB INSTAGRAM  ·  NOT FETCHABLE");
  L("  Blocked on Meta approving instagram_business_basic, plus each club");
  L("  connecting via OAuth. Synthesized from the extractor's real output");
  L("  shape — four facts, no caption, no photo.");

  // Combined
  const all = [...hoya, ...voice, ...ath, ...cal, ...ig];
  const withImg = all.filter((p) => p.image).length;
  const withProse = all.filter((p) => (p.body || "").length > 60).length;
  const bySrc = {};
  all.forEach((p) => (bySrc[p.source] = (bySrc[p.source] || 0) + 1));

  L();
  L("─".repeat(68));
  L("  COMBINED");
  L("─".repeat(68));
  L(`  total items        ${all.length}`);
  L(`  mix                ${Object.entries(bySrc).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
  L(`  have an image      ${withImg}/${all.length}  (${pct(withImg, all.length)})`);
  L(`  have real prose    ${withProse}/${all.length}  (${pct(withProse, all.length)})`);
  L();
  L("  Adding the university calendar changes the picture: it brings its own");
  L("  images and descriptions, so the feed is no longer carried by the Hoya");
  L("  alone. Athletics and Instagram remain the two sources with no art at");
  L("  all — those are the ones that need the Midjourney fallback.");
  L("═".repeat(68));
  L();
}

/* ------------------------------------------------------------------ */

async function main() {
  const fail = (name) => (e) => {
    console.error(`  ${name} FAILED: ${e.message}`);
    return null;
  };

  console.log("fetching The Hoya…");
  const hoya = (await fetchPaper("hoya").catch(fail("hoya"))) ?? [];
  console.log("fetching The Georgetown Voice…");
  const voice = (await fetchPaper("voice").catch(fail("voice"))) ?? [];
  console.log("fetching Georgetown Athletics…");
  const ath = (await fetchAthletics().catch(fail("athletics"))) ?? [];
  console.log("fetching Georgetown Events Calendar…");
  const calRes = (await fetchCalendar().catch(fail("calendar"))) ?? {
    posts: [], stats: { raw: 0, upcoming: 0, kept: 0, collapsedRecurring: 0, collapsedDuplicates: 0, withImage: 0 },
  };
  const cal = calRes.posts;
  const ig = synthesizeInstagram();

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    sources: {
      hoya: { url: SOURCES.hoya.url, ok: hoya.length > 0, count: hoya.length },
      voice: { url: SOURCES.voice.url, ok: voice.length > 0, count: voice.length },
      athletics: { url: SOURCES.athletics.url, ok: ath.length > 0, count: ath.length },
      calendar: {
        url: SOURCES.calendar.url,
        ok: cal.length > 0,
        count: cal.length,
        note: `${calRes.stats.raw} raw rows collapsed to ${calRes.stats.kept}`,
      },
      instagram: {
        url: null, ok: false, count: ig.length,
        note: "synthesized — needs Meta approval",
      },
    },
    calendarStats: calRes.stats,
    posts: [...hoya, ...voice, ...ath, ...cal, ...ig].sort(
      (a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0)
    ),
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2));

  report(hoya, voice, ath, cal, calRes.stats, ig);
  console.log(`snapshot -> ${OUT.replace(ROOT + "/", "")}  (${snapshot.posts.length} items)\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
