import { SpotifyTrack } from "@/types/spotify";

const BASE = "https://api.spotify.com/v1";

async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Spotify ${res.status}: ${res.statusText}`);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

export async function getTopTracks(
  accessToken: string,
  limit = 5
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?limit=${limit}&time_range=medium_term`,
    accessToken
  );
  return data.items;
}

export async function getTopArtists(
  accessToken: string,
  limit = 3
): Promise<{ id: string; name: string }[]> {
  const data = await spotifyFetch<{ items: { id: string; name: string }[] }>(
    `/me/top/artists?limit=${limit}&time_range=medium_term`,
    accessToken
  );
  return data.items;
}

export async function getRecommendations(
  accessToken: string,
  seedTrackIds: string[]
): Promise<SpotifyTrack[]> {
  const seeds = seedTrackIds.slice(0, 5).join(",");
  const data = await spotifyFetch<{ tracks: SpotifyTrack[] }>(
    `/recommendations?seed_tracks=${seeds}&limit=20`,
    accessToken
  );
  return data.tracks;
}

export async function getRelatedArtists(
  accessToken: string,
  artistId: string
): Promise<{ id: string; name: string }[]> {
  const data = await spotifyFetch<{ artists: { id: string; name: string }[] }>(
    `/artists/${artistId}/related-artists`,
    accessToken
  );
  return data.artists;
}

export async function getArtistTopTracks(
  accessToken: string,
  artistId: string
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ tracks: SpotifyTrack[] }>(
    `/artists/${artistId}/top-tracks?market=from_token`,
    accessToken
  );
  return data.tracks;
}

export async function getNewReleases(
  accessToken: string,
  limit = 20
): Promise<SpotifyTrack[]> {
  type SpotifyAlbumItem = SpotifyTrack["album"] & { artists: SpotifyTrack["artists"] };
  const data = await spotifyFetch<{ albums: { items: SpotifyAlbumItem[] } }>(
    `/browse/new-releases?limit=10&country=US`,
    accessToken
  );

  const albums = data.albums.items;

  // Fetch up to 3 tracks per album, attach album info to each track
  const results: SpotifyTrack[] = [];
  for (const album of albums.slice(0, 7)) {
    if (results.length >= limit) break;
    const albumTracks = await spotifyFetch<{ items: SpotifyTrack[] }>(
      `/albums/${album.id}/tracks?limit=3`,
      accessToken
    ).catch(() => ({ items: [] }));

    for (const track of albumTracks.items) {
      results.push({ ...track, album });
    }
  }

  return results.slice(0, limit);
}

/** Fetch full track objects (up to 50 ids). Full objects include preview_url more reliably. */
export async function getFullTracks(
  accessToken: string,
  trackIds: string[]
): Promise<SpotifyTrack[]> {
  if (trackIds.length === 0) return [];
  const ids = trackIds.slice(0, 50).join(",");
  const data = await spotifyFetch<{ tracks: (SpotifyTrack | null)[] }>(
    `/tracks?ids=${ids}`,
    accessToken
  );
  return data.tracks.filter((t): t is SpotifyTrack => t !== null);
}

/**
 * Enrich a list of tracks with their full objects so preview_url is populated.
 * Simplified track objects (from albums/artists endpoints) often have preview_url: null,
 * while the full track endpoint (/tracks?ids=...) returns it reliably.
 */
export async function enrichWithPreviews(
  accessToken: string,
  tracks: SpotifyTrack[]
): Promise<SpotifyTrack[]> {
  const missingIds = tracks.filter((t) => !t.preview_url).map((t) => t.id);
  if (missingIds.length === 0) return tracks;

  const full = await getFullTracks(accessToken, missingIds).catch(() => []);
  const fullMap = new Map(full.map((t) => [t.id, t]));

  return tracks.map((t) => (t.preview_url ? t : (fullMap.get(t.id) ?? t)));
}

export async function addToLikedSongs(
  accessToken: string,
  trackId: string
): Promise<void> {
  await spotifyFetch<undefined>(
    `/me/tracks?ids=${trackId}`,
    accessToken,
    { method: "PUT" }
  );
}

export async function getOrCreateBeatBondPlaylist(
  accessToken: string
): Promise<string> {
  const me = await spotifyFetch<{ id: string }>("/me", accessToken);

  const page = await spotifyFetch<{ items: { id: string; name: string }[] }>(
    "/me/playlists?limit=50",
    accessToken
  );
  const existing = page.items.find((p) => p.name === "BeatBond");
  if (existing) return existing.id;

  const created = await spotifyFetch<{ id: string }>(
    `/users/${me.id}/playlists`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        name: "BeatBond",
        description: "Songs matched on BeatBond.com",
        public: false,
      }),
    }
  );
  return created.id;
}

export async function addTrackToPlaylist(
  accessToken: string,
  playlistId: string,
  trackId: string
): Promise<void> {
  await spotifyFetch<undefined>(
    `/playlists/${playlistId}/tracks`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
    }
  );
}
