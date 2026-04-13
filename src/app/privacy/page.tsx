
export const metadata = {
  title: "Privacy Policy — BeatBond",
  description: "Privacy Policy for BeatBond, a Spotify-powered music discovery app.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "April 12, 2026";

  return (
    <main className="min-h-screen bg-white text-[#1E1E1E]">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 md:pt-30">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#371F7D] mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-700">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">1. Introduction</h2>
            <p>
              BeatBond ("we", "our", or "us") is a music discovery application that helps users find
              new songs through a swipe-based interface powered by the Spotify platform. This Privacy
              Policy explains what information we collect, how we use it, and your rights regarding
              your data.
            </p>
            <p className="mt-3">
              By using BeatBond you agree to the practices described in this policy. If you do not
              agree, please discontinue use of the application.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">2. Information We Collect</h2>
            <p className="mb-3">
              BeatBond accesses data from your Spotify account exclusively through Spotify's official
              OAuth 2.0 authorization flow. We collect only what is necessary to operate the
              application:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Spotify profile information:</strong> your display name, email address, and
                profile picture, provided by Spotify upon login. This is used solely to personalize
                your session.
              </li>
              <li>
                <strong>Listening history:</strong> your top tracks and top artists (short-term and
                medium-term), used to generate personalized song recommendations.
              </li>
              <li>
                <strong>Spotify access token:</strong> a temporary credential issued by Spotify that
                allows BeatBond to act on your behalf within the scopes you authorized.
              </li>
            </ul>
            <p className="mt-3">
              <strong>We do not collect:</strong> payment information, precise location, device
              identifiers, or any data outside of what Spotify explicitly provides through the
              authorized scopes.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">The data we access is used exclusively for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generating personalized song recommendations based on your listening history.</li>
              <li>
                Saving songs you like to your Spotify Liked Songs library (only when you explicitly
                swipe right / tap the like button).
              </li>
              <li>
                Adding liked songs to a dedicated "BeatBond" playlist in your Spotify account (only
                when you explicitly enable this feature in Settings).
              </li>
              <li>Displaying your profile name and photo within the app interface.</li>
            </ul>
            <p className="mt-3">
              We do not use your data for advertising, profiling, analytics sold to third parties,
              or any purpose beyond delivering the core functionality described above.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">4. Data Storage and Retention</h2>
            <p className="mb-3">
              BeatBond is a <strong>stateless application</strong>. We do not operate a database and
              do not persistently store your personal data or your Spotify data on our servers.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Your Spotify access token is held in a secure, server-side session for the duration
                of your browsing session and is discarded when you sign out or the session expires.
              </li>
              <li>
                Preferences you set within the app (e.g., "Save to playlist" toggle, genre filters)
                are stored exclusively in your browser's <code>localStorage</code> and never
                transmitted to our servers.
              </li>
              <li>
                No listening history, liked tracks, or any other Spotify data is retained by us
                after your session ends.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">5. Third-Party Services — Spotify</h2>
            <p className="mb-3">
              BeatBond is built on top of the{" "}
              <a
                href="https://developer.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#371F7D] hover:opacity-75 transition-opacity underline"
              >
                Spotify Web API
              </a>
              . By signing in with Spotify, you are also subject to Spotify's own privacy practices:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a
                  href="https://www.spotify.com/legal/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#371F7D] hover:opacity-75 transition-opacity underline"
                >
                  Spotify Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://www.spotify.com/legal/end-user-agreement/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#371F7D] hover:opacity-75 transition-opacity underline"
                >
                  Spotify Terms and Conditions of Use
                </a>
              </li>
            </ul>
            <p className="mt-3">
              BeatBond is not affiliated with, endorsed by, or sponsored by Spotify AB. The Spotify
              name and logo are trademarks of Spotify AB.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">6. Spotify API Scopes Requested</h2>
            <p className="mb-3">
              When you authorize BeatBond through Spotify, we request only the minimum scopes
              required to provide the service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><code>user-read-email</code> — to identify your account.</li>
              <li><code>user-top-read</code> — to read your top tracks and artists for recommendations.</li>
              <li><code>user-library-modify</code> — to save songs to your Liked Songs when you like a track.</li>
              <li><code>playlist-modify-private</code> — to create and update the private "BeatBond" playlist (only when this feature is enabled).</li>
              <li><code>playlist-read-private</code> — to check whether a "BeatBond" playlist already exists in your library.</li>
            </ul>
            <p className="mt-3">
              You can revoke these permissions at any time from your{" "}
              <a
                href="https://www.spotify.com/account/apps/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#371F7D] hover:opacity-75 transition-opacity underline"
              >
                Spotify account settings
              </a>
              .
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">7. Your Rights</h2>
            <p className="mb-3">
              Depending on your country of residence you may have the following rights regarding your
              personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to access:</strong> request information about what data we hold about you.</li>
              <li><strong>Right to deletion:</strong> request that we delete any data associated with you. Because we do not store personal data persistently, signing out and revoking BeatBond's access in Spotify effectively deletes all session data immediately.</li>
              <li><strong>Right to withdraw consent:</strong> you may revoke BeatBond's access to your Spotify account at any time via your Spotify account settings without affecting your Spotify account.</li>
              <li><strong>Right to data portability:</strong> your Spotify data (liked songs, playlists) remains in your Spotify account and is accessible through Spotify directly.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at the address below.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">8. Children's Privacy</h2>
            <p>
              BeatBond is not directed at children under the age of 13 (or the applicable minimum
              age in your jurisdiction). We do not knowingly collect personal information from
              minors. If you believe a minor has provided us with personal data, please contact us
              and we will take appropriate steps to delete that information.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">9. Security</h2>
            <p>
              We take reasonable technical measures to protect your data. Spotify access tokens are
              transmitted exclusively over HTTPS and are never exposed to the client-side JavaScript
              of the application. However, no method of transmission over the internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the
              "Last updated" date at the top of this page. Continued use of BeatBond after changes
              are posted constitutes your acceptance of the revised policy. We encourage you to
              review this page periodically.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-3">11. Contact</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or the
              data practices of BeatBond, please contact:
            </p>
            <p className="mt-3">
              <strong>Luis Hernández</strong><br />
              <a
                href="mailto:luishdz.dev@gmail.com"
                className="text-[#371F7D] hover:opacity-75 transition-opacity underline"
              >
                luishdz.dev@gmail.com
              </a>
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-400 flex items-center justify-between">
          <span>© {new Date().getFullYear()} BeatBond</span>
          <span className="text-[#1E1E1E]">
            Made by{" "}
            <a
              href="https://www.luishernandez.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#371F7D] font-medium hover:opacity-75 transition-opacity"
            >
              Luis Hernández
            </a>
          </span>
        </div>

      </div>
    </main>
  );
}
