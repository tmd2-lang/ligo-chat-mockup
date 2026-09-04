/**
 * Campus feed — static sample content.
 *
 * Built to stress-test the two questions Micah left open on 2026-08-31:
 *
 *   1. Does it look empty once info-session season ends?
 *   2. Do students post, or is it organizations only?
 *
 * Those are two independent axes, so four states. The one that actually
 * answers the product question is QUIET + ORGS-ONLY — the worst case. It
 * is deliberately NOT padded with invented club announcements: what fills
 * it is system-generated event activity, The Hoya, athletics, and alumni
 * news, which is the answer TJ proposed on the call ("an event was just
 * posted today... somewhat of an activity feed").
 *
 * If that state looks thin, that is a real finding, not a bug.
 *
 * Nothing here touches a network.
 */

export type FeedKind =
  | "announcement"
  | "info_session"
  | "job"
  | "fundraiser"
  | "blood_drive"
  | "event_activity"
  | "hoya"
  | "athletics"
  | "alumni"
  | "student"
  // Added for real ingested content — the university calendar's own
  // categories don't map onto the club-shaped kinds above.
  | "lecture"
  | "campus_event";

export type Season = "rush" | "quiet";
export type Publishing = "orgs" | "community";

export type FeedPost = {
  id: string;
  kind: FeedKind;
  /** Who posted. `student` authors only appear in community mode. */
  author: string;
  authorType: "org" | "student" | "system" | "publication";
  /** Verified orgs get the check. */
  verified?: boolean;
  timeAgo: string;
  /** Source timestamp retained for mixing independently ingested feeds. */
  publishedAt?: string;
  body: string;
  /** Optional headline above the body, for news-shaped posts. */
  title?: string;
  image?: string;
  imageAlt?: string;
  /** Optional publisher profile image supplied by an ingested source. */
  avatar?: string;
  /** Lets image cards distinguish a Reel from a carousel at a glance. */
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  /** Inline call to action, e.g. an RSVP or a donation link. */
  action?: string;
  /** Canonical source URL. Present on everything ingested; opens out. */
  link?: string;
  /** ISO start time, for events that can be added to a calendar. */
  startsAt?: string;
  /** Venue, used in the generated calendar entry. */
  venue?: string;
  likes: number;
  /**
   * Overrides the chip text from KIND_META. Needed because two papers
   * share one kind — without this every Voice post was chipped
   * "The Hoya".
   */
  chipLabel?: string;
  /** Which season(s) this post appears in. */
  seasons: Season[];
  /**
   * True for content nobody actually published — currently only the
   * Instagram stand-ins, since that API is blocked. Rendered with a
   * visible marker so a simulated post can never be read as a real one.
   */
  simulated?: boolean;
};

/** Display metadata per kind — label, and the filter chip it belongs to. */
export const KIND_META: Record<
  FeedKind,
  { label: string; filter: FilterId }
> = {
  announcement: { label: "Announcement", filter: "clubs" },
  info_session: { label: "Info session", filter: "recruiting" },
  job: { label: "Opportunity", filter: "recruiting" },
  fundraiser: { label: "Fundraiser", filter: "causes" },
  blood_drive: { label: "Blood drive", filter: "causes" },
  event_activity: { label: "New event", filter: "events" },
  hoya: { label: "The Hoya", filter: "campus" },
  athletics: { label: "Athletics", filter: "campus" },
  alumni: { label: "Alumni", filter: "campus" },
  student: { label: "Student", filter: "students" },
  lecture: { label: "Lecture", filter: "campus" },
  campus_event: { label: "Campus event", filter: "campus" },
};

export type FilterId =
  | "all"
  | "events"
  | "clubs"
  | "recruiting"
  | "causes"
  | "campus"
  | "students";

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "events", label: "Events" },
  { id: "clubs", label: "Clubs" },
  { id: "recruiting", label: "Recruiting" },
  { id: "causes", label: "Causes" },
  { id: "campus", label: "Campus" },
  { id: "students", label: "Students" },
];

export const FEED_POSTS: FeedPost[] = [
  /* ---------------------------------------------------------------- */
  /* Recruiting — the stuff that vanishes when applications close.     */
  /* ---------------------------------------------------------------- */
  {
    id: "p1",
    kind: "info_session",
    author: "Alpha Kappa Psi",
    authorType: "org",
    verified: true,
    timeAgo: "2h",
    body: "Info night is Tuesday at 7 in Hariri 140. Come hear about the fall pledge process — no business background needed, and we'll have people from every school there.",
    image: "/Posh/AlphaKappaPsi.png",
    imageAlt: "Alpha Kappa Psi info night flyer",
    action: "RSVP",
    likes: 34,
    seasons: ["rush"],
  },
  {
    id: "p2",
    kind: "info_session",
    author: "GUASFCU",
    authorType: "org",
    verified: true,
    timeAgo: "5h",
    body: "Applications for the fall analyst class close Sunday at midnight. Two info sessions left — Thursday 6:30 in Healy, Friday 5:00 on Zoom.",
    action: "Apply",
    likes: 61,
    seasons: ["rush"],
  },
  {
    id: "p3",
    kind: "job",
    author: "Georgetown Entrepreneurship",
    authorType: "org",
    verified: true,
    timeAgo: "1d",
    body: "Paid campus role: we're hiring two student associates for the Leonsis Family Entrepreneurship Hub. ~8 hrs/week, event support and content. Sophomores and juniors preferred.",
    action: "See listing",
    likes: 47,
    seasons: ["rush"],
  },
  {
    id: "p4",
    kind: "info_session",
    author: "The Corp",
    authorType: "org",
    verified: true,
    timeAgo: "1d",
    body: "Hiring for all storefronts this semester. Open house Wednesday 4–6 at Vital Vittles, no sign-up needed.",
    likes: 88,
    seasons: ["rush"],
  },

  /* ---------------------------------------------------------------- */
  /* Club announcements                                                */
  /* ---------------------------------------------------------------- */
  {
    id: "p5",
    kind: "announcement",
    author: "South Asian Society",
    authorType: "org",
    verified: true,
    timeAgo: "3h",
    body: "Rangila auditions are this weekend. All skill levels — genuinely, we mean it. Sign-up sheet is in the bio and rehearsals start the week after.",
    action: "Sign up",
    likes: 112,
    seasons: ["rush"],
  },
  {
    id: "p6",
    kind: "announcement",
    author: "Georgetown Program Board",
    authorType: "org",
    verified: true,
    timeAgo: "2d",
    body: "Meet your 2026 board. Swipe for the full exec team — and yes, we're still taking programming committee applications.",
    likes: 29,
    seasons: ["rush"],
  },

  /* ---------------------------------------------------------------- */
  /* Causes — Mekhi's original example was a blood drive               */
  /* ---------------------------------------------------------------- */
  {
    id: "p7",
    kind: "blood_drive",
    author: "GU Red Cross Club",
    authorType: "org",
    verified: true,
    timeAgo: "6h",
    body: "Blood drive Saturday 10–4 in the Leavey Program Room. Slots are going fast and walk-ins fill up by noon — grab a time online.",
    action: "Reserve a slot",
    likes: 156,
    seasons: ["rush", "quiet"],
  },
  {
    id: "p8",
    kind: "fundraiser",
    author: "Alpha Kappa Psi",
    authorType: "org",
    verified: true,
    timeAgo: "4d",
    body: "We're raising for the DC Central Kitchen through the end of the month. $2,400 of $5,000 so far. Every dollar is a meal.",
    action: "Donate",
    likes: 73,
    seasons: ["rush"],
  },
  {
    id: "p9",
    kind: "fundraiser",
    author: "GU Best Buddies",
    authorType: "org",
    verified: true,
    timeAgo: "2d",
    body: "Friendship Walk is November 8th on Copley Lawn. Team sign-ups are open — last year Georgetown raised $18k and we'd like to beat it.",
    action: "Start a team",
    likes: 64,
    seasons: ["quiet"],
  },

  /* ---------------------------------------------------------------- */
  /* System-generated event activity.                                  */
  /* This is the load-bearing content in quiet season. It needs no     */
  /* club to write anything — it's produced by the Events system and   */
  /* the Instagram ingestion pipeline.                                 */
  /* ---------------------------------------------------------------- */
  {
    id: "p10",
    kind: "event_activity",
    author: "Sigma Alpha Epsilon",
    authorType: "system",
    verified: true,
    timeAgo: "1h",
    title: "Champagne & Shackles",
    body: "just posted a new event · Friday, 10:00 PM",
    image: "/Posh/ChampagneShackles.png",
    imageAlt: "Champagne and Shackles event flyer",
    action: "RSVP",
    likes: 41,
    seasons: ["rush", "quiet"],
  },
  {
    id: "p11",
    kind: "event_activity",
    author: "Georgetown Program Board",
    authorType: "system",
    verified: true,
    timeAgo: "8h",
    title: "Cabin Fever",
    body: "just posted a new event · Saturday, 9:00 PM",
    image: "/Posh/CabinFever.png",
    imageAlt: "Cabin Fever event flyer",
    action: "RSVP",
    likes: 97,
    seasons: ["rush", "quiet"],
  },
  {
    id: "p12",
    kind: "event_activity",
    author: "Georgetown Phantoms",
    authorType: "system",
    verified: true,
    timeAgo: "1d",
    title: "Fall Showcase",
    body: "just posted a new event · Nov 2, 8:00 PM",
    action: "RSVP",
    likes: 52,
    seasons: ["quiet"],
  },
  {
    id: "p13",
    kind: "event_activity",
    author: "GU Outdoor Ed",
    authorType: "system",
    verified: true,
    timeAgo: "2d",
    title: "Sunrise Hike — Great Falls",
    body: "just posted a new event · Sunday, 5:30 AM",
    action: "RSVP",
    likes: 38,
    seasons: ["quiet"],
  },

  /* ---------------------------------------------------------------- */
  /* Campus — The Hoya, athletics, alumni.                             */
  /* Micah: "the soccer team has a game, or the Hoya just posted an    */
  /* article... some Georgetown alum working on a project."            */
  /* ---------------------------------------------------------------- */
  {
    id: "p14",
    kind: "hoya",
    author: "The Hoya",
    authorType: "publication",
    verified: true,
    timeAgo: "4h",
    title: "GUSA passes resolution on dining hall hours",
    body: "The senate voted 22–3 Sunday to formally request extended Leo's hours through finals, citing a survey of nearly 900 students.",
    action: "Read",
    likes: 203,
    seasons: ["rush", "quiet"],
  },
  {
    id: "p15",
    kind: "hoya",
    author: "The Hoya",
    authorType: "publication",
    verified: true,
    timeAgo: "1d",
    title: "The quiet economics of the Georgetown house party",
    body: "A look at who actually pays for the kegs, the couches, and the noise complaints on Burleith's most-cited blocks.",
    action: "Read",
    likes: 341,
    seasons: ["quiet"],
  },
  {
    id: "p16",
    kind: "athletics",
    author: "Georgetown Athletics",
    authorType: "org",
    verified: true,
    timeAgo: "3h",
    title: "Men's soccer takes the Big East opener",
    body: "2–1 over Villanova at Shaw Field on a stoppage-time header. Next home game is Saturday at 7.",
    action: "Get tickets",
    likes: 288,
    seasons: ["rush", "quiet"],
  },
  {
    id: "p17",
    kind: "athletics",
    author: "Georgetown Athletics",
    authorType: "org",
    verified: true,
    timeAgo: "2d",
    title: "Hoyas open at home vs. Providence",
    body: "Tip-off is 6:30 at Capital One Arena. Student tickets released Wednesday at noon and they went in under an hour last year.",
    action: "Get tickets",
    likes: 412,
    seasons: ["quiet"],
  },
  {
    id: "p18",
    kind: "alumni",
    author: "Georgetown Alumni",
    authorType: "org",
    verified: true,
    timeAgo: "1d",
    title: "'09 grad's climate startup raises $40M",
    body: "Maya Restrepo (SFS '09) closed a Series B for Tallgrass, which turns farm waste into construction material. She's speaking on campus in November.",
    likes: 176,
    seasons: ["rush", "quiet"],
  },
  {
    id: "p19",
    kind: "alumni",
    author: "Georgetown Alumni",
    authorType: "org",
    verified: true,
    timeAgo: "5d",
    title: "Three Hoyas named Rhodes finalists",
    body: "All three are seniors in the College. Interviews are the second week of November.",
    likes: 219,
    seasons: ["quiet"],
  },

  /* ---------------------------------------------------------------- */
  /* Student posts — COMMUNITY MODE ONLY.                              */
  /* Micah: a Substack-type piece, or "they just performed somewhere." */
  /* Mekhi wanted the feeling of posting without it becoming UGC, so   */
  /* these are constrained shapes, not free-form status updates.       */
  /* ---------------------------------------------------------------- */
  {
    id: "p20",
    kind: "student",
    author: "Nasir Webb",
    authorType: "student",
    timeAgo: "5h",
    title: "New single — 'Prospect St.'",
    body: "Recorded most of this in a Village A common room at 3am. It's on everything now. Playing it live at the Phantoms showcase.",
    action: "Listen",
    likes: 128,
    seasons: ["rush", "quiet"],
  },
  {
    id: "p21",
    kind: "student",
    author: "Priya Raman",
    authorType: "student",
    timeAgo: "1d",
    title: "I read every GUSA platform so you don't have to",
    body: "Wrote up all eleven of them. Three have actual budget numbers. The rest are vibes. Long post, sorry.",
    action: "Read",
    likes: 267,
    seasons: ["rush", "quiet"],
  },
  {
    id: "p22",
    kind: "student",
    author: "Tomás Oyelaran",
    authorType: "student",
    timeAgo: "3d",
    title: "Shot the Rangila dress rehearsal",
    body: "Forty photos from Thursday night. Free to use, just credit me. DM if you want the full-res set.",
    likes: 94,
    seasons: ["quiet"],
  },
  {
    id: "p23",
    kind: "info_session",
    author: "Georgetown University Lecture Fund",
    authorType: "org",
    verified: true,
    timeAgo: "7h",
    body: "Applications close Friday. We bring speakers to campus and you help pick them — no experience needed, just opinions.",
    action: "Apply",
    likes: 52,
    seasons: ["rush"],
  },
  {
    id: "p24",
    kind: "info_session",
    author: "Georgetown Phantoms",
    authorType: "org",
    verified: true,
    timeAgo: "9h",
    body: "Auditions Sunday in McNeir. Prepare 45 seconds of anything — we've taken people who'd never sung outside a shower.",
    action: "Sign up",
    likes: 76,
    seasons: ["rush"],
  },
  {
    id: "p25",
    kind: "info_session",
    author: "GU Mock Trial",
    authorType: "org",
    verified: true,
    timeAgo: "1d",
    body: "Tryouts are next week and we're rebuilding two full teams. Zero law background expected.",
    action: "Sign up",
    likes: 31,
    seasons: ["rush"],
  },
  {
    id: "p26",
    kind: "announcement",
    author: "Georgetown Club Sports",
    authorType: "org",
    verified: true,
    timeAgo: "1d",
    body: "Club sports fair is Thursday on Copley Lawn, 11–3. Forty teams, most still taking walk-ons.",
    likes: 143,
    seasons: ["rush"],
  },
  {
    id: "p27",
    kind: "job",
    author: "Georgetown Dining",
    authorType: "org",
    verified: true,
    timeAgo: "2d",
    body: "Student shifts open at Leo's, Epicurean, and the Hilltop Cafe. Work-study and non-work-study both fine.",
    action: "See listing",
    likes: 39,
    seasons: ["rush"],
  },
  {
    id: "p28",
    kind: "job",
    author: "Georgetown Career Center",
    authorType: "org",
    verified: true,
    timeAgo: "6h",
    body: "Spring internship deadlines start hitting in three weeks. Drop-in resume reviews every Tuesday and Thursday, no appointment.",
    action: "See listing",
    likes: 58,
    seasons: ["quiet"],
  },
];

/**
 * Posts visible in a given state.
 *
 * In orgs-only mode student posts are removed entirely — that's the
 * whole point of the toggle, not a cosmetic hide.
 */
export function visiblePosts(season: Season, publishing: Publishing) {
  return FEED_POSTS.filter((p) => {
    if (!p.seasons.includes(season)) return false;
    if (publishing === "orgs" && p.authorType === "student") return false;
    return true;
  });
}

/** Orgs a student has subscribed to — drives the Subscribed / All tabs. */
export const SUBSCRIBED_AUTHORS = new Set([
  "Georgetown Program Board",
  "Sigma Alpha Epsilon",
  "South Asian Society",
  "The Hoya",
]);
