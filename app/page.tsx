/**
 * Landing page — just a way in. The prototype itself lives at /screens.
 */
import "./design-index.css";

export default function Index() {
  return (
    <main className="ix-stage">
      <div className="ix-wrap">
        <div className="ix-mark">
          <b>LIGO</b>
          <span className="ix-dot" />
          <span>Campus feed prototype</span>
        </div>

        <h1 className="ix-title">
          What if the Chat tab
          <br />
          <span className="ix-title-faint">were a campus feed?</span>
        </h1>

        <p className="ix-lede">
          Nobody uses the Chat tab. This is a working prototype of what could
          replace it &mdash; a feed of what&rsquo;s actually happening at
          Georgetown, built to stress-test the two questions that are still
          open: does it go empty after recruiting season, and should students be
          able to post.
        </p>

        <div className="ix-links">
          <a className="ix-link ix-link-primary" href="/screens">
            Open the prototype
            <span className="ix-link-sub">
              Feed vs Chat, with the review toggles
            </span>
          </a>
          <a className="ix-link" href="/design">
            Design reference
            <span className="ix-link-sub">
              Tokens and components from the live app
            </span>
          </a>
        </div>

        <p className="ix-foot">
          Static and offline. No Appwrite, no Supabase, no network calls &mdash;
          every screen reads from a local file.
        </p>
      </div>
    </main>
  );
}
