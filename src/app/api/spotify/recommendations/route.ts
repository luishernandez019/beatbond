import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getTopTracks,
  getRecommendations,
  getTopArtists,
  getRelatedArtists,
  getArtistTopTracks,
  getNewReleases,
  getFullTracks,
} from "@/lib/spotify";
import { SpotifyTrack } from "@/types/spotify";

/** Enrich a list of tracks with full objects so preview_url is populated. */
async function enrichWithPreviews(
  token: string,
  tracks: SpotifyTrack[]
): Promise<SpotifyTrack[]> {
  const missingIds = tracks
    .filter((t) => !t.preview_url)
    .map((t) => t.id);

  if (missingIds.length === 0) return tracks;

  const full = await getFullTracks(token, missingIds).catch(() => []);
  const fullMap = new Map(full.map((t) => [t.id, t]));

  return tracks.map((t) =>
    t.preview_url ? t : (fullMap.get(t.id) ?? t)
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = session.accessToken;

  // --- Strategy 1: recommendations endpoint (pre-Nov 2024 apps) ---------------
  try {
    const topTracks = await getTopTracks(token, 5);
    if (topTracks.length > 0) {
      try {
        const raw = await getRecommendations(token, topTracks.map((t) => t.id));
        if (raw.length > 0) {
          const tracks = await enrichWithPreviews(token, raw);
          return NextResponse.json({ tracks });
        }
      } catch {
        // recommendations not available — fall through
      }
    }
  } catch {
    // no top tracks — fall through
  }

  // --- Strategy 2: top artists → related artists → their top tracks -----------
  try {
    const topArtists = await getTopArtists(token, 3);
    if (topArtists.length > 0) {
      const relatedArrays = await Promise.all(
        topArtists.map((a) => getRelatedArtists(token, a.id).catch(() => []))
      );
      const relatedArtists = relatedArrays.flat().slice(0, 6);

      const trackArrays = await Promise.all(
        relatedArtists.map((a) => getArtistTopTracks(token, a.id).catch(() => []))
      );

      const unique: SpotifyTrack[] = Array.from(
        new Map(trackArrays.flat().map((t) => [t.id, t])).values()
      ).slice(0, 20);

      if (unique.length > 0) {
        const tracks = await enrichWithPreviews(token, unique);
        return NextResponse.json({ tracks });
      }
    }
  } catch {
    // no artist history — fall through
  }

  // --- Strategy 3: new releases (works for any account) -----------------------
  try {
    const raw = await getNewReleases(token, 20);
    const tracks = await enrichWithPreviews(token, raw);
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("All recommendation strategies failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
