import { useState, useEffect, useCallback } from "react";
import { SpotifyTrack } from "@/types/spotify";
import { PlayerState } from "@/components/CircularPlayer";
import { fetchWithTimeout } from "@/lib/fetch";

interface UseRecommendationsReturn {
  tracks: SpotifyTrack[];
  index: number;
  loading: boolean;
  error: string | null;
  likedCount: number;
  likeError: string | null;
  playerState: PlayerState;
  currentTrack: SpotifyTrack | undefined;
  nextTrack: SpotifyTrack | undefined;
  isDone: boolean;
  handleLike: () => Promise<void>;
  handleDislike: () => void;
  handlePlayerState: (state: PlayerState) => void;
  fetchRecommendations: () => Promise<void>;
}

export function useRecommendations(): UseRecommendationsReturn {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedCount, setLikedCount] = useState(0);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    progress: 0,
    hasPreview: false,
    loading: false,
  });

  useEffect(() => {
    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss like error after 3 s
  useEffect(() => {
    if (!likeError) return;
    const timer = setTimeout(() => setLikeError(null), 3000);
    return () => clearTimeout(timer);
  }, [likeError]);

  async function fetchRecommendations() {
    setLoading(true);
    setError(null);
    setIndex(0);
    try {
      const res = await fetchWithTimeout("/api/spotify/recommendations");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTracks(data.tracks ?? []);
    } catch {
      setError("Could not load recommendations. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLike() {
    const track = tracks[index];
    setIndex((i) => i + 1);
    setLikedCount((c) => c + 1);

    try {
      const res = await fetchWithTimeout("/api/spotify/like", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track.id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setIndex((i) => i - 1);
      setLikedCount((c) => c - 1);
      setLikeError("Couldn't save to Liked Songs. Try again.");
    }
  }

  function handleDislike() {
    setIndex((i) => i + 1);
  }

  const handlePlayerState = useCallback((state: PlayerState) => {
    setPlayerState(state);
  }, []);

  return {
    tracks,
    index,
    loading,
    error,
    likedCount,
    likeError,
    playerState,
    currentTrack: tracks[index],
    nextTrack: tracks[index + 1],
    isDone: !loading && index >= tracks.length,
    handleLike,
    handleDislike,
    handlePlayerState,
    fetchRecommendations,
  };
}
