import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  getTopTracks,
  getRecommendations,
  getTracksByGenres,
  getTopArtists,
  getRelatedArtists,
  getArtistTopTracks,
  getNewReleases,
  enrichWithPreviews,
  checkLikedTracks,
} from "@/lib/spotify";
import { SpotifyTrack } from "@/types/spotify";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = session.accessToken;

  function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function dedupe(tracks: SpotifyTrack[]): SpotifyTrack[] {
    const seen = new Set<string>();
    return tracks.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }

  function limitPerAlbum(tracks: SpotifyTrack[], max = 1): SpotifyTrack[] {
    const count = new Map<string, number>();
    return tracks.filter((t) => {
      const albumId = t.album?.id ?? t.id;
      const n = count.get(albumId) ?? 0;
      if (n >= max) return false;
      count.set(albumId, n + 1);
      return true;
    });
  }

  function clean(tracks: SpotifyTrack[]): SpotifyTrack[] {
    return limitPerAlbum(dedupe(tracks));
  }

  const { searchParams } = new URL(request.url);
  const genresParam  = searchParams.get("genres");
  const energyParam  = searchParams.get("energy");
  const moodParam    = searchParams.get("mood");
  const excludeParam = searchParams.get("exclude");
  const filters = {
    genres: genresParam ? genresParam.split(",").filter(Boolean) : [],
    energy: energyParam ? parseFloat(energyParam) : null,
    mood:   moodParam   ? parseFloat(moodParam)   : null,
  };
  const excludeIds = new Set(excludeParam ? excludeParam.split(",").filter(Boolean) : []);

  async function removeAlreadyLiked(tracks: SpotifyTrack[]): Promise<SpotifyTrack[]> {
    const liked = await checkLikedTracks(token, tracks.map((t) => t.id));
    return tracks.filter((t) => !liked.has(t.id) && !excludeIds.has(t.id));
  }

  // --- Strategy 1: recommendations endpoint (pre-Nov 2024 apps) ---------------
  try {
    const topTracks = await getTopTracks(token, 50);
    if (topTracks.length > 0 || filters.genres.length > 0) {
      try {
        const seeds = shuffle(topTracks).slice(0, 5);
        const raw = await getRecommendations(token, seeds.map((t) => t.id), filters);
        if (raw.length > 0) {
          const tracks = await removeAlreadyLiked(await enrichWithPreviews(token, clean(shuffle(raw))));
          if (tracks.length > 0) return NextResponse.json({ tracks });
        }
      } catch {
        // recommendations not available — fall through
      }
    }
  } catch {
    // no top tracks — fall through
  }

  // --- Strategy 1.5: genre search (works for all app types) -------------------
  if (filters.genres.length > 0) {
    try {
      const raw = await getTracksByGenres(token, filters.genres);
      if (raw.length > 0) {
        const tracks = await removeAlreadyLiked(await enrichWithPreviews(token, clean(shuffle(raw))));
        if (tracks.length > 0) return NextResponse.json({ tracks });
      }
    } catch {
      // fall through
    }
  }

  // --- Strategy 2: top artists → related artists → their top tracks -----------
  try {
    const topArtists = await getTopArtists(token, 20);
    if (topArtists.length > 0) {
      const pickedArtists = shuffle(topArtists).slice(0, 5);
      const relatedArrays = await Promise.all(
        pickedArtists.map((a) => getRelatedArtists(token, a.id).catch(() => []))
      );
      const relatedArtists = shuffle(relatedArrays.flat()).slice(0, 10);

      const trackArrays = await Promise.all(
        relatedArtists.map((a) => getArtistTopTracks(token, a.id).catch(() => []))
      );

      const unique: SpotifyTrack[] = Array.from(
        new Map(shuffle(trackArrays.flat()).map((t) => [t.id, t])).values()
      ).slice(0, 50);

      if (unique.length > 0) {
        const tracks = await removeAlreadyLiked(await enrichWithPreviews(token, clean(unique)));
        if (tracks.length > 0) return NextResponse.json({ tracks });
      }
    }
  } catch {
    // no artist history — fall through
  }

  // --- Strategy 3: new releases (works for any account) -----------------------
  try {
    const offset = Math.floor(Math.random() * 40);
    const raw = await getNewReleases(token, 20, offset);
    const tracks = await removeAlreadyLiked(await enrichWithPreviews(token, clean(shuffle(raw))));
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("All recommendation strategies failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
