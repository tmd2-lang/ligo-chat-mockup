# Ligo — campus feed mockup

A design prototype for replacing Ligo's Chat tab with a campus-wide feed.

Nobody uses the Chat tab. ASA has close to 100 members on the platform and has
never touched it. This is a working prototype of what could go in that slot
instead: a feed of what's actually happening at Georgetown.

**It is a prototype, not an implementation.** Everything is static — no
Appwrite, no Supabase, no network calls of any kind. Every screen reads from a
local file.

---

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

| Route | What |
|---|---|
| `/` | Landing page |
| `/screens` | **The prototype.** Feed vs Chat, with the review toggles |
| `/design` | Design reference — tokens and components from the live app |

---

## The two questions this exists to answer

Both came out of the 2026-08-31 all-hands and neither is settled.

### 1. Does it go empty after recruiting season?

Right now every club on campus is recruiting at once, so the feed is full. But
applications close in a few weeks, and the worry is that it looks abandoned by
late October.

Flip **Season** between "Rush week" and "Mid-semester" to see it. In org-only
mode:

| | Rush week | Mid-semester |
|---|---|---|
| Total posts | 18 | 13 |
| Info sessions | 6 | 0 |
| Club announcements | 3 | 0 |
| New events (auto-generated) | 2 | 4 |
| The Hoya | 1 | 2 |
| Athletics | 1 | 2 |
| Alumni | 1 | 2 |

Club-authored content goes to **zero**. What holds the feed up is
system-generated event activity plus campus news — the "Clubs" filter chip
disappears entirely, because nothing is left behind it.

So it doesn't die. It stops being a club feed and becomes a campus feed.

The mid-semester content is deliberately **not** padded with invented club
posts. If that state looks thin, that's a real finding.

### 2. Should students be able to post?

Flip **Who can post** between "Verified orgs" and "Campus community."

Org-only removes student posts entirely and hides the compose button. Community
adds them back and turns compose on — but the composer offers three shapes
(something I made / wrote / did) rather than a blank status box, so it stays
closer to "let students share work" than to a general-purpose posting app.

---

## What's in here

Two kinds of code, worth keeping straight:

**Ported from the real app.** `lib/ligo/tokens.ts` and
`components/ligo/primitives.tsx` are web ports of the shipping React Native
app's design system, and `components/ligo/screens/EventsClubsScreen.tsx`,
`ChatHubScreen.tsx`, and `ClubDetailSheet.tsx` reproduce real screens'
composition. Colors, sizes, type, the three-tab bar, and the faceted pill
assets are the app's actual values, not approximations.

**New.** `components/ligo/screens/FeedScreen.tsx` and `lib/ligo/mockFeed.ts`
are the proposal.

### Design notes found while porting

- The app has **two conflicting token sets**. `EV` (from `eventsUi.tsx`) is
  Figma-accurate and governs Events/Clubs/Chat; `COLORS` (from `theme.ts`) is
  the older brand-kit house style. They disagree on background, border, and all
  three text weights. `chatUi.tsx` adds a third near-miss pair. All three are
  ported as-is and the conflicts are listed on `/design`.
- The **headline font is unresolved**. `theme.ts` calls Bricolage Grotesque the
  real brand font; `eventsUi.tsx`, `chatUi.tsx`, and `onboardingUi.tsx` all ship
  Gelica. This mockup uses Bricolage via a single `FONT_HEADLINE` variable, so
  switching is a one-line change.
- The nav is **three tabs, not four** — Chat, Events+Clubs, Profile. Events and
  Clubs merged in August to match Figma. A feed takes the Chat slot; the bar
  stays three wide.
- **Chat isn't deleted, it relocates** into the club page, where members still
  get chat, members, and club events. Only the tab is in question.
- **Following already exists** as a real feature backed by `club_follows`,
  separate from joining a club. The feed's Following tab reuses it rather than
  inventing a parallel concept.

---

## Deliberate limitations

- No data layer. The real screens read Appwrite; these read a static array.
- No dedupe, no Instagram ingestion, no loading/error/cache states.
- Filter buttons on the ported screens render and focus correctly but open
  nothing.
- Profile isn't ported — out of scope for a Chat-tab before/after.
- Search and filter glyphs are drawn inline; only the nav and pill assets were
  copied from the real app.

## Prototype controls

The orange-bordered panel on `/screens` is review chrome and would not ship. It
exists to reach states you can't otherwise see without waiting for a real
semester to pass.
