# BeatBond

BeatBond is a music discovery app that works like Tinder for songs. It connects to your Spotify account, analyzes your listening history, and serves personalized track recommendations one at a time — swipe right to like, swipe left to skip. Songs you like are saved directly to your Spotify Liked Songs library and optionally to a dedicated BeatBond playlist.

**Live:** [beatbond.vercel.app](https://beatbond.vercel.app) <!-- update if URL changes -->

---

## Features

- **Swipe-based discovery** — like or dislike tracks with gesture or button controls
- **Spotify-powered recommendations** — built on your top tracks and artists
- **Auto-save to Liked Songs** — every like goes straight to your Spotify library
- **BeatBond playlist** — optional toggle to also collect liked tracks in a private playlist
- **30-second previews** — listen before you decide
- **Undo** — reverse the last skip if you change your mind
- **Filters** — narrow recommendations by genre, energy level, and mood
- **Track history** — review and re-queue songs you previously skipped
- **Liked songs view** — browse and unlike tracks from within the app
- **Stateless & private** — no database, no persistent storage of your data

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Auth | [NextAuth.js v4](https://next-auth.js.org) — Spotify OAuth |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Animations | [Framer Motion](https://www.framer.com/motion) |
| Icons | [Lucide React](https://lucide.dev) |
| Deployment | [Vercel](https://vercel.com) |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Landing / login page
│   ├── layout.tsx                # Root layout (Navbar, Providers, session)
│   ├── Providers.tsx             # SessionProvider wrapper
│   ├── home/
│   │   └── page.tsx              # Main app — swipe interface
│   ├── privacy/
│   │   └── page.tsx              # Privacy policy
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth handler + authOptions
│       └── spotify/
│           ├── recommendations/  # GET — fetches personalized tracks
│           ├── like/             # PUT / DELETE — liked songs
│           ├── playlist/         # POST — BeatBond playlist management
│           └── preview/          # GET — audio preview proxy
├── components/
│   ├── Navbar.tsx                # Top nav (logo, sign-out)
│   ├── FloatingNav.tsx           # Bottom nav (home / liked / history / settings)
│   ├── SongCard.tsx              # Swipeable track card
│   └── CircularPlayer.tsx        # Preview audio player
├── hooks/
│   └── useRecommendations.ts     # Core state machine (tracks, like, dislike, undo…)
├── lib/
│   ├── spotify.ts                # Spotify Web API wrappers
│   └── fetch.ts                  # fetchWithTimeout utility
├── types/
│   ├── spotify.ts                # SpotifyTrack / SpotifyAlbum / … interfaces
│   ├── next-auth.d.ts            # Session type augmentation (accessToken)
│   └── css.d.ts                  # CSS module type declaration
└── middleware.ts                 # Route protection + auth redirects
```

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Spotify Developer](https://developer.spotify.com/dashboard) account

### 1. Clone the repo

```bash
git clone https://github.com/your-username/beatbond.git
cd beatbond
npm install
```

### 2. Create a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Set a Redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Copy your **Client ID** and **Client Secret**

### 3. Set environment variables

Create a `.env.local` file in the project root:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any_random_string_here   # generate with: openssl rand -base64 32
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Spotify.

---

## Recommendation strategies

The `/api/spotify/recommendations` endpoint tries three strategies in order, falling back to the next if one fails:

1. **Spotify Recommendations API** — seeds from your top tracks; respects genre, energy, and mood filters. *(Only available to apps created before Nov 2024 — if unavailable it falls through automatically.)*
2. **Related artists** — fetches your top artists, finds related ones, and pulls their top tracks for a pool of ~100 candidates.
3. **New releases** — falls back to recently released albums when no listening history is available (useful for brand-new accounts).

Results are always shuffled and deduplicated: no repeated tracks, no more than one song per album per batch.

---

## Spotify scopes requested

| Scope | Purpose |
|---|---|
| `user-read-email` | Identify the user's account |
| `user-top-read` | Read top tracks and artists for recommendations |
| `user-library-modify` | Save / remove liked songs |
| `user-library-read` | Check existing liked songs |
| `playlist-read-private` | Check if a BeatBond playlist already exists |
| `playlist-modify-private` | Create and update the BeatBond playlist |
| `playlist-modify-public` | Fallback for public playlist creation |

---

## Deployment

The easiest path is [Vercel](https://vercel.com):

1. Push your fork to GitHub
2. Import the repo in Vercel
3. Add the same environment variables from `.env.local` to the Vercel project settings
4. In your Spotify app dashboard, add the production redirect URI:
   `https://your-domain.vercel.app/api/auth/callback/spotify`

---

## Contributing

Pull requests are welcome. For larger changes, open an issue first to discuss what you'd like to change.

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes and commit: `git commit -m "feat: describe your change"`
3. Push and open a pull request

Please keep PRs focused — one feature or fix per PR.

---

## License

MIT © [Luis Hernández](https://www.luishernandez.digital)
