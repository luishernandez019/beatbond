import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { addToLikedSongs, removeFromLikedSongs } from "@/lib/spotify";

export async function PUT(request: NextRequest) {
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
    await addToLikedSongs(session.accessToken, trackId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Like error:", err);
    return NextResponse.json({ error: "Failed to like track" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");

  if (!trackId) {
    return NextResponse.json({ error: "trackId is required" }, { status: 400 });
  }

  try {
    await removeFromLikedSongs(session.accessToken, trackId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unlike error:", err);
    return NextResponse.json({ error: "Failed to unlike track" }, { status: 500 });
  }
}
