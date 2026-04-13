import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getOrCreateBeatBondPlaylist, addTrackToPlaylist } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { trackId } = body as { trackId?: string };

  if (!trackId) {
    return NextResponse.json({ error: "trackId is required" }, { status: 400 });
  }

  try {
    const playlistId = await getOrCreateBeatBondPlaylist(session.accessToken);
    await addTrackToPlaylist(session.accessToken, playlistId, trackId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Playlist error:", err);
    return NextResponse.json({ error: "Failed to add to playlist" }, { status: 500 });
  }
}
