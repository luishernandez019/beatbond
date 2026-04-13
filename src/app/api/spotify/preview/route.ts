import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trackId = request.nextUrl.searchParams.get("id");
  if (!trackId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://open.spotify.com/embed/track/${trackId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      }
    );

    if (!res.ok) return NextResponse.json({ previewUrl: null });

    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!match?.[1]) return NextResponse.json({ previewUrl: null });

    const data = JSON.parse(match[1]);
    const previewUrl: string | null =
      data?.props?.pageProps?.state?.data?.entity?.audioPreview?.url ?? null;

    return NextResponse.json({ previewUrl });
  } catch {
    return NextResponse.json({ previewUrl: null });
  }
}
