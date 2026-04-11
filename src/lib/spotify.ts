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

  if (res.status === 204) return undefined as T;
  return res.json();
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
