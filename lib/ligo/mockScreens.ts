/**
 * Static sample content for the ported screens.
 *
 * Shaped to match what the real screens fetch from Appwrite, so the
 * ported components receive the same kind of data they do in the app —
 * but nothing here touches a network. No Appwrite, no Supabase.
 *
 * Event art is this project's existing local flyers under public/Posh.
 */

import { accentFor } from "./tokens";

/* ------------------------------------------------------------------ */
/* EventsClubs                                                         */
/* ------------------------------------------------------------------ */

export type MockEvent = {
  id: string;
  title: string;
  /** The app renders `clubName || venue` here. */
  clubName?: string;
  venue?: string;
  /** Pre-formatted; the app derives this from dateTime via formatEventTime(). */
  when: string;
  category: string;
  flyer?: string;
};

/**
 * Row titles follow the app's real ordering: a near-term row first
 * ("Upcoming Events"), then EVENT_CLUB_CATEGORIES in order, then "More
 * Events" for anything uncategorized. Only non-empty rows render.
 */
export const MOCK_EVENTS: MockEvent[] = [
  {
    id: "e1",
    title: "Champagne & Shackles",
    clubName: "Sigma Alpha Epsilon",
    when: "Fri, 10:00 PM",
    category: "Greek",
    flyer: "/Posh/ChampagneShackles.png",
  },
  {
    id: "e2",
    title: "Cabin Fever",
    clubName: "Georgetown Program Board",
    when: "Sat, 9:00 PM",
    category: "Social",
    flyer: "/Posh/CabinFever.png",
  },
  {
    id: "e3",
    title: "Info Night",
    clubName: "Alpha Kappa Psi",
    when: "Tue, 7:00 PM",
    category: "Preprofessional",
    flyer: "/Posh/AlphaKappaPsi.png",
  },
  {
    id: "e4",
    title: "Paddy Murphy Week",
    clubName: "Sigma Alpha Epsilon",
    when: "Tonight, 8:00 PM",
    category: "Greek",
    flyer: "/PaddyMurphyWeek.png",
  },
  {
    id: "e5",
    title: "The Vault",
    clubName: "GUASFCU",
    when: "Thu, 6:30 PM",
    category: "Preprofessional",
  },
  {
    id: "e6",
    title: "Rangila Rehearsal",
    clubName: "South Asian Society",
    when: "Sun, 4:00 PM",
    category: "Culture",
  },
  {
    id: "e7",
    title: "Fall Formal",
    clubName: "Sigma Alpha Epsilon",
    when: "Nov 14, 9:00 PM",
    category: "Greek",
    flyer: "/SAEFallFormal.png",
  },
  {
    id: "e8",
    title: "Open Mic Night",
    clubName: "Georgetown Program Board",
    when: "Wed, 8:00 PM",
    category: "Music",
  },
];

/** Matches EVENT_CLUB_CATEGORIES in eventsUi.tsx, order included. */
export const EVENT_CLUB_CATEGORIES = [
  "Culture",
  "Performing Arts",
  "Greek",
  "Music",
  "Sports",
  "Academic",
  "Preprofessional",
  "Social",
] as const;

export type MockClub = {
  id: string;
  name: string;
  category: string;
};

export const MOCK_CLUBS: MockClub[] = [
  { id: "c1", name: "Georgetown Program Board", category: "Social" },
  { id: "c2", name: "South Asian Society", category: "Culture" },
  { id: "c3", name: "Alpha Kappa Psi", category: "Preprofessional" },
  {
    id: "c4",
    name: "GUASFCU (Georgetown University Alumni & Student Federal Credit Union)",
    category: "Preprofessional",
  },
  { id: "c5", name: "Sigma Alpha Epsilon", category: "Greek" },
  { id: "c6", name: "Georgetown Phantoms", category: "Performing Arts" },
];

/* ------------------------------------------------------------------ */
/* ChatHub                                                             */
/* ------------------------------------------------------------------ */

export type MockThread = {
  key: string;
  threadType: "event" | "club";
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
};

/**
 * What Chat looks like for someone who actually has threads.
 *
 * Worth knowing while reviewing: per the all-hands, this is NOT the
 * common case. ASA has ~100 members on the platform and has never used
 * the tab — the realistic state is the empty one.
 */
export const MOCK_THREADS: MockThread[] = [
  {
    key: "t1",
    threadType: "event",
    title: "Champagne & Shackles",
    lastMessage: "doors at 10, don't be late",
    timestamp: "2:14 PM",
    unread: true,
  },
  {
    key: "t2",
    threadType: "club",
    title: "Georgetown Program Board",
    lastMessage: "Cole: pushed the Cabin Fever flyer, take a look",
    timestamp: "1d",
    unread: true,
  },
  {
    key: "t3",
    threadType: "club",
    title: "Sigma Alpha Epsilon",
    lastMessage: "who's covering the door shift saturday",
    timestamp: "3d",
    unread: false,
  },
  {
    key: "t4",
    threadType: "event",
    title: "The Vault",
    lastMessage: "room changed to Healy 103",
    timestamp: "Aug 27",
    unread: false,
  },
];

/** EMPTY_COPY from ChatHub.tsx, verbatim. */
export const CHAT_EMPTY_COPY: Record<
  "All" | "Events" | "Clubs",
  { title: string; body: string }
> = {
  All: {
    title: "No conversations yet",
    body: "Join an event or a club and your group chat shows up here.",
  },
  Events: {
    title: "No event chats yet",
    body: "RSVP to an event and you'll land in the group the moment it starts filling up.",
  },
  Clubs: {
    title: "No club chats yet",
    body: "Join a club on campus and its group chat unlocks right here",
  },
};

export { accentFor };

/* ------------------------------------------------------------------ */
/* Club detail sheet                                                   */
/* ------------------------------------------------------------------ */

export type MockClubDetail = {
  id: string;
  name: string;
  category?: string;
  visibility: "public" | "private";
  memberCount?: number;
  location?: string;
  description?: string;
  banner?: string;
  accentColor?: string;
  upcoming: { id: string; title: string; venue?: string; when: string; flyer?: string }[];
};

export const CLUB_DETAILS: Record<string, MockClubDetail> = {
  c1: {
    id: "c1",
    name: "Georgetown Program Board",
    category: "Social",
    visibility: "public",
    memberCount: 84,
    location: "Healy Hall",
    description:
      "GPB programs the campus-wide events everyone actually shows up to — Cabin Fever, Homecoming, the spring concert. We run on a committee model, so there's a way in whether you want to book talent, run production, or just help the night go smoothly.",
    upcoming: [
      { id: "e2", title: "Cabin Fever", venue: "Healy Lawn", when: "Sat, 9:00 PM", flyer: "/Posh/CabinFever.png" },
      { id: "e8", title: "Open Mic Night", venue: "Bulldog Tavern", when: "Wed, 8:00 PM" },
    ],
  },
  c2: {
    id: "c2",
    name: "South Asian Society",
    category: "Culture",
    visibility: "public",
    memberCount: 96,
    description:
      "SAS puts on Rangila, the largest student-run cultural show on campus, plus mixers and food nights through the year. Auditions are open to everyone and most of the cast has never danced before.",
    upcoming: [{ id: "e6", title: "Rangila Rehearsal", venue: "McNeir Hall", when: "Sun, 4:00 PM" }],
  },
  c3: {
    id: "c3",
    name: "Alpha Kappa Psi",
    category: "Preprofessional",
    visibility: "private",
    memberCount: 61,
    description:
      "Professional business fraternity, co-ed, open to every school. Fall recruitment runs through September and the pledge process is one semester.",
    banner: "/Posh/AlphaKappaPsi.png",
    upcoming: [{ id: "e3", title: "Info Night", venue: "Hariri 140", when: "Tue, 7:00 PM", flyer: "/Posh/AlphaKappaPsi.png" }],
  },
  c4: {
    id: "c4",
    name: "GUASFCU (Georgetown University Alumni & Student Federal Credit Union)",
    category: "Preprofessional",
    visibility: "private",
    memberCount: 112,
    location: "Leavey Center",
    description:
      "The largest entirely student-run financial institution in the country. Analyst applications open once a semester and the interview process is genuinely competitive.",
    upcoming: [{ id: "e5", title: "The Vault", venue: "Healy Hall", when: "Thu, 6:30 PM" }],
  },
  c5: {
    id: "c5",
    name: "Sigma Alpha Epsilon",
    category: "Greek",
    visibility: "private",
    memberCount: 73,
    description:
      "SAE runs Paddy Murphy Week every spring and a full social calendar in the fall. Rush is invite-based.",
    banner: "/Posh/ChampagneShackles.png",
    upcoming: [
      { id: "e1", title: "Champagne & Shackles", venue: "The Standard", when: "Fri, 10:00 PM", flyer: "/Posh/ChampagneShackles.png" },
      { id: "e7", title: "Fall Formal", venue: "TBA", when: "Nov 14, 9:00 PM", flyer: "/SAEFallFormal.png" },
    ],
  },
  c6: {
    id: "c6",
    name: "Georgetown Phantoms",
    category: "Performing Arts",
    visibility: "public",
    memberCount: 18,
    description:
      "Co-ed a cappella since 1993. We audition every fall, tour in the spring, and rehearse three nights a week.",
    upcoming: [{ id: "e9", title: "Fall Showcase", venue: "McNeir Hall", when: "Nov 2, 8:00 PM" }],
  },
};
