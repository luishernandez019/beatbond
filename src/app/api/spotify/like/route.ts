import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { addToLikedSongs } from "@/lib/spotify";

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
