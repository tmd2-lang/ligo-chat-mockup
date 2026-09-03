# Feed sync — what's actually pullable

Answering "what API things can we sync? … what's possible to sync?" from the
2026-09-02 all-hands, with live data rather than an estimate.

Everything below was fetched for real on **2026-09-03**. Reproduce with
`node scripts/sync-test.mjs` — no dependencies, two GET requests, writes one
local JSON file. It does not touch Appwrite or any live service.

---

## Summary

| Source | Status | Endpoint | Needs permission from |
|---|---|---|---|
| The Hoya | **Working** | `thehoya.com/wp-json/wp/v2/posts` | Nobody |
| Georgetown Athletics | **Working** | `guhoyas.com/calendar.ashx/calendar.ics` | Nobody |
| Club Instagram | **Blocked** | `graph.instagram.com/v21.0/me/media` | Meta + each club |

Two of three are live today and require no partner, no signup, and no
onboarding. The third is gated on a Meta app review that hasn't been
submitted.

---

## 1. The Hoya — working

The Hoya runs WordPress, and its REST API is public and unauthenticated. No
scraping, no HTML parsing.

```
GET https://thehoya.com/wp-json/wp/v2/posts?per_page=30&_embed=1
```

**What comes back per article:** title, excerpt, full body, publish and
modified timestamps, canonical link, author, real categories (Sports, News,
Academics, Events, plus topic tags), and a featured image URL.

**Measured on 30 posts:**

- 93% ship with their own featured image
- ~4.3 articles published per day
- 10 of 30 were sports coverage
- 40% of headlines need cleanup — they publish as `WOMEN'S SOCCER | Actual
  Headline`, an all-caps section prefix that duplicates the category we'd
  already show as a chip

**Incremental pulls work.** `?after=2026-09-02T00:00:00` returned only the 16
posts newer than that timestamp. Store the last run time and you only ever
fetch what's new.

---

## 2. Georgetown Athletics — working

guhoyas.com runs Sidearm Sports, the CMS most Division I athletics
departments use. It publishes a standard iCalendar feed.

```
GET https://guhoyas.com/calendar.ashx/calendar.ics
```

**Measured on the live feed:** 179 events across 14 sports.

- 13 played, 166 upcoming
- **13 of 13 played games carry a real score.** The description field reads
  `W 4-1`, not just a win/loss flag
- 31 events include a Ticketmaster link
- Broadcast info (ESPN+, etc.) where it exists
- Opponent, venue, and home/away all parse cleanly
- **Zero events include any artwork**

**Format quirks found by running it:**

- Every summary is prefixed `Georgetown University …`, which has to be
  stripped or it ends up inside the sport name
- Completed games carry `[W]` / `[L]` / `[T]`; one event carried `CANCELLED`.
  Both prefixes must be handled before stripping the school name
- No `ETag` or `Last-Modified`, so conditional GETs aren't possible. The whole
  file is 73KB, so refetching is cheap

**This is the same endpoint at other schools.** GW returned 197 events from
the identical URL. Northwestern and Stanford 404'd, so it's a per-school
check rather than a universal key — but it worked at both schools we
actually care about next.

---

## 3. Club Instagram — blocked, and not on us

The code is already written in the backend: `instagram-connect` runs a real
OAuth flow and stores long-lived tokens in `instagram_connections`, and
`ingest-instagram` is a poller that reads `graph.instagram.com/v21.0/me/media`
and sends captions to Claude to extract event facts.

Three things stop it from running today:

1. **Meta hasn't approved `instagram_business_basic`.**
   `docs/meta_app_review_submission.md` is prep work — its checklist is
   entirely unchecked. Without approved advanced access the permission only
   works on accounts with a role on the app.
2. **`ingest_instagram` has an empty `schedule` string** in `appwrite.json`.
   It's deployed but not on any timer.
3. **The media fetcher has never run.** Its own comment: *"Not yet exercised
   against a real request."*

Even once approved, each club must have a Business or Creator account **and**
click Allow. That's a BD problem, not an engineering one.

**What an Instagram post becomes:** four facts — title, date, time, location.
No caption text, no photo, ever. That's a deliberate legal constraint in the
existing code and it holds even for a club that has consented.

---

## What the combined feed actually looks like

Across all 212 items pulled:

- **13% have an image**
- **13% have real body copy**
- Every one of those is from The Hoya

The Hoya is the only source that brings its own art and prose, and it
out-publishes everything else. Without ranking, it visually owns the feed.
Everything else — every score, every game, every Instagram-sourced event —
lands as bare text and needs a fallback image.

**That's the Midjourney library's real job.** It was built as a fallback for
ugly club flyers; it turns out ~87% of feed content will need it.

### One modeling bug worth knowing before it's built

On the first run, a swim meet six months away sorted above the morning's news.
A published article has a *publish* time; a future game only has an *event*
time. They cannot share a sort key. The fix is to rank upcoming events by
proximity and published items by recency, then merge — not to sort one
combined timestamp.

---

## Scheduling

The pattern already exists. `ingest_campusgroups` runs on
`schedule: "0 */6 * * *"` with a 300s timeout and `execute: []`, meaning
cron-only and never callable from the app. A Hoya/athletics job is that same
shape with a different fetcher.

**Suggested:** one function on `*/30 * * * *`.

- The Hoya: pass `?after=<last run>` so each run only pulls new articles
- Athletics: refetch the full 73KB calendar; it covers both new schedule
  entries and post-game score updates in the same request

48 runs a day, two requests each. If scores need to feel faster on game
nights, tighten to every 10 minutes in the evening window.

**Dedupe** is the only real logic: store the source id on each record — the
Hoya post id, the ICS `UID` — and upsert rather than insert. The
`eventDedupeKey` and upsert helpers from the CampusGroups work already do
this.

---

## Operational and legal notes

- **guhoyas.com sits behind Imperva.** A bare client gets 403; a normal
  user-agent works. Cache, don't hammer, and identify the client honestly.
- **The Hoya is a student newspaper.** Reading a public API with attribution
  and a link back is standard practice, but a short email to their editor is
  cheap and could turn into a real partnership rather than a one-way pull.
- Neither source requires credentials, so there's nothing to leak.
- The existing ingestion spec's discipline — facts only, link back, never
  reproduce someone else's text wholesale — should carry over unchanged.

---

## Open questions

- Does the Meta app review ever get submitted? It gates the entire club half
  of the feed.
- Ranking: how do Hoya articles, scores, upcoming games, and club events get
  interleaved so one source doesn't dominate?
- The "marquee event of the day" idea from the call — that's a ranking
  feature, and it overlaps with the Georgetown Digest notification that
  already exists but reached nobody.
- Which additional sources are worth the same treatment. Speaker series
  (GU Politics, Berkley Center) and the career center's employer calendar are
  the two most likely to be both institutional and already published in a
  structured format.
