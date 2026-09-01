/**
 * ClubDetail — web port of the real club sheet.
 *
 * Source: mobile/src/screens/events/ClubDetail.tsx. It's a bottom sheet
 * over a scrim, not a full screen — tapping a club row anywhere in the
 * app slides this up.
 *
 * The two actions are INDEPENDENT, which is the important bit:
 *
 *   Follow  — lightweight, anyone, no approval. Backed by the real
 *             `club_follows` collection. Micah, 2026-08-16: following a
 *             club should tell you you'll get notified "when they post
 *             an event or they post something." That second half is the
 *             feed. This is what drives the feed's Following tab.
 *
 *   Join    — real membership in `organization_members`. A public club
 *             joins instantly; a private one sends a request an officer
 *             has to approve, so the button reads "Request to Join".
 *
 * They are two simultaneously-visible buttons, not a state machine where
 * one replaces the other — confirmed in the real designer export.
 *
 * Static. No network.
 */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { EvPosterCard } from "../primitives";
import { EV, FONT_HEADLINE, accentFor, withAlpha } from "@/lib/ligo/tokens";
import type { MockClubDetail } from "@/lib/ligo/mockScreens";

export function ClubDetailSheet({
  club,
  following,
  joined,
  onToggleFollow,
  onJoin,
  onClose,
  explainFollow = false,
  onFollowExplained,
}: {
  club: MockClubDetail;
  following: boolean;
  joined: "none" | "pending" | "member";
  onToggleFollow: () => void;
  onJoin: () => void;
  onClose: () => void;
  /** Retained so the caller can still track first-follow if it wants to. */
  explainFollow?: boolean;
  onFollowExplained?: () => void;
}) {
  const [showFollowed, setShowFollowed] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const accent = club.accentColor ?? accentFor(club.name);

  function handleFollow() {
    const turningOn = !following;
    onToggleFollow();
    // Every follow, matching the real app. Unfollowing still shows
    // nothing — there's nothing to confirm.
    if (turningOn) {
      setShowFollowed(true);
      onFollowExplained?.();
    }
  }

  return (
    <div className="ligo-sheet-scrim" role="presentation" onClick={onClose}>
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`${club.name} details`}
        className={`ligo-club-sheet${mounted ? " is-in" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ligo-sheet-grip" aria-hidden="true" />

        <div className="ligo-club-header">
          <button
            type="button"
            className="ligo-pressable ligo-club-iconbtn"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseGlyph />
          </button>
          <span className="ligo-club-headertitle">Club Details</span>
          <button
            type="button"
            className="ligo-pressable ligo-club-iconbtn"
            aria-label="Share"
          >
            <ShareGlyph />
          </button>
        </div>

        <div className="ligo-club-body">
          {club.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="ligo-club-photo" src={club.banner} alt={`${club.name} banner`} />
          ) : (
            <div
              className="ligo-club-photo ligo-club-photo-fallback"
              style={{ background: withAlpha(accent, 0.18), color: accent }}
              aria-hidden="true"
            >
              {club.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          {club.category && <p className="ligo-club-category">{club.category}</p>}

          <h2 className="ligo-club-name" style={{ fontFamily: FONT_HEADLINE }}>
            {club.name}
          </h2>

          <p className="ligo-club-visibility">
            {club.visibility === "private" ? "Private" : "Public"}
            {typeof club.memberCount === "number"
              ? ` · ${club.memberCount} Member${club.memberCount === 1 ? "" : "s"}`
              : ""}
          </p>

          {club.location && <p className="ligo-club-location">{club.location}</p>}

          {club.description && (
            <section className="ligo-club-section">
              <p className="ligo-club-plainlabel">About this club</p>
              <p className="ligo-club-description">{club.description}</p>
            </section>
          )}

          {club.upcoming.length > 0 && (
            <section className="ligo-club-section">
              <p className="ligo-club-label" style={{ fontFamily: FONT_HEADLINE }}>
                Upcoming Events
              </p>
              <div className="ligo-carousel ligo-club-events">
                {club.upcoming.map((e) => (
                  <EvPosterCard
                    key={e.id}
                    title={e.title}
                    subtitle={e.venue}
                    meta={e.when}
                    imageSrc={e.flyer}
                    imageAlt={`Flyer for ${e.title}`}
                    accent={accentFor(e.id)}
                    width={240}
                    height={280}
                    onPress={() => {}}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Two independent actions, always both visible. */}
          <div className="ligo-club-actions">
            <button
              type="button"
              className="ligo-pressable ligo-club-follow"
              aria-pressed={following}
              onClick={handleFollow}
              style={{
                background: following ? EV.chipBgStrong : "rgba(153,160,174,0.1)",
              }}
            >
              {following ? "✓ Following" : "Follow"}
            </button>

            {joined === "pending" ? (
              <button
                type="button"
                className="ligo-pressable ligo-club-join is-pending"
                onClick={onJoin}
              >
                Request sent — Cancel
              </button>
            ) : joined === "member" ? (
              <button type="button" className="ligo-pressable ligo-club-join is-pending" disabled>
                Member
              </button>
            ) : (
              <button type="button" className="ligo-pressable ligo-club-join" onClick={onJoin}>
                {club.visibility === "private" ? "Request to Join" : "Join Club"}
              </button>
            )}
          </div>

        </div>

        {showFollowed && (
          <FollowedModal
            clubName={club.name}
            onClose={() => setShowFollowed(false)}
          />
        )}
      </div>
    </div>
  );
}

/**
 * RN: EvSuccessModal, as used by ClubDetail's follow flow.
 *
 * Micah asked for this on 2026-08-16: following a club should tell you
 * you'll be notified "when they post an event or they post something."
 * The app's copy only mentions events — updated here to mention the feed,
 * since that's what following now actually gets you.
 *
 * Shows on every follow, same as the app — for a demo you want it to
 * fire whenever someone taps, not once and never again.
 */
function FollowedModal({
  clubName,
  onClose,
}: {
  clubName: string;
  onClose: () => void;
}) {
  return (
    <div className="ligo-success-overlay" role="presentation" onClick={onClose}>
      <div
        className="ligo-success-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Now following ${clubName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="ligo-success-badge" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff"
            strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3 className="ligo-success-title" style={{ fontFamily: FONT_HEADLINE }}>
          Following {clubName}
        </h3>
        <p className="ligo-success-body">
          Their events and announcements will show up in your feed, and
          you&rsquo;ll get notified when they post something new.
        </p>
        <button type="button" className="ligo-pressable ligo-success-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}

function CloseGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={EV.textStrong}
      strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ShareGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={EV.textStrong}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 16V3M8 7l4-4 4 4" />
      <path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}
