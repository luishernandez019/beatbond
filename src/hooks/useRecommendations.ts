import { useState, useEffect, useCallback, useRef } from "react";
import { SpotifyTrack } from "@/types/spotify";
import { PlayerState } from "@/components/CircularPlayer";
import { fetchWithTimeout } from "@/lib/fetch";

const SEEN_KEY = "beatbond_seen_tracks";
const SEEN_MAX = 300;

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveSeen(seen: Set<string>) {
  try {
    // Keep the most recent SEEN_MAX to avoid unbounded growth
    const arr = Array.from(seen).slice(-SEEN_MAX);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch { /* ignore */ }
}

export interface Filters {
  genres: string[];
  energy: number | null;
  mood: number | null;
}

interface UseRecommendationsReturn {
  tracks: SpotifyTrack[];
  index: number;
  loading: boolean;
  error: string | null;
  likedCount: number;
  likedTracks: SpotifyTrack[];
  dislikedTracks: SpotifyTrack[];
  likeError: string | null;
  playerState: PlayerState;
  currentTrack: SpotifyTrack | undefined;
  nextTrack: SpotifyTrack | undefined;
  isDone: boolean;
  canUndo: boolean;
  handleLike: () => Promise<void>;
  handleDislike: () => void;
  handleUndo: () => void;
  handleUnlike: (track: SpotifyTrack) => Promise<void>;
  requeueTrack: (track: SpotifyTrack) => void;
  handlePlayerState: (state: PlayerState) => void;
  fetchRecommendations: () => Promise<void>;
}

const DEFAULT_FILTERS: Filters = { genres: [], energy: null, mood: null };

export function useRecommendations(
  saveToPlaylist = false,
  filters: Filters = DEFAULT_FILTERS
): UseRecommendationsReturn {
  // Keep a ref so fetchRecommendations (stable via useCallback) always reads the latest filters
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedCount, setLikedCount] = useState(0);
  const [likedTracks, setLikedTracks] = useState<SpotifyTrack[]>([]);
  const [dislikedTracks, setDislikedTracks] = useState<SpotifyTrack[]>([]);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [lastActionWasDislike, setLastActionWasDislike] = useState(false);
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

  const fetchRecommendations = useCallback(async () => {
    const { genres, energy, mood } = filtersRef.current;
    setLoading(true);
    setError(null);
    setIndex(0);
    setLastActionWasDislike(false);
    try {
      const seen = loadSeen();
      const params = new URLSearchParams();
      if (genres.length > 0) params.set("genres", genres.join(","));
      if (energy != null) params.set("energy", energy.toString());
      if (mood != null) params.set("mood", mood.toString());
      if (seen.size > 0) params.set("exclude", Array.from(seen).join(","));
      const url = `/api/spotify/recommendations${params.toString() ? `?${params}` : ""}`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const incoming: SpotifyTrack[] = data.tracks ?? [];
      // Mark all returned tracks as seen
      const updated = loadSeen();
      incoming.forEach((t) => updated.add(t.id));
      saveSeen(updated);
      setTracks(incoming);
    } catch {
      setError("Could not load recommendations. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLike() {
    const track = tracks[index];
    setIndex((i) => i + 1);
    setLikedCount((c) => c + 1);
    setLikedTracks((prev) => [...prev, track]);
    setLastActionWasDislike(false);

    // Like — rollback on failure
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
      setLikedTracks((prev) => prev.filter((t) => t.id !== track.id));
      setLikeError("Couldn't save to Liked Songs. Try again.");
      return;
    }

    // Playlist — independent, no rollback
    if (saveToPlaylist) {
      try {
        const res = await fetchWithTimeout("/api/spotify/playlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId: track.id }),
        });
        if (!res.ok) throw new Error();
      } catch {
        setLikeError("Saved to Liked Songs, but couldn't add to BeatBond playlist.");
      }
    }
  }

  async function handleUnlike(track: SpotifyTrack) {
    const snapshot = likedTracks;
    setLikedTracks((prev) => prev.filter((t) => t.id !== track.id));
    setLikedCount((c) => c - 1);
    try {
      const res = await fetchWithTimeout(
        `/api/spotify/like?trackId=${track.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
    } catch {
      setLikedTracks(snapshot);
      setLikedCount((c) => c + 1);
      setLikeError("Couldn't remove from Liked Songs. Try again.");
    }
  }

  function handleDislike() {
    const track = tracks[index];
    setDislikedTracks((prev) => [...prev, track]);
    setIndex((i) => i + 1);
    setLastActionWasDislike(true);
  }

  function handleUndo() {
    if (!lastActionWasDislike) return;
    const undoneTrack = tracks[index - 1];
    if (undoneTrack) setDislikedTracks((prev) => prev.filter((t) => t.id !== undoneTrack.id));
    setIndex((i) => i - 1);
    setLastActionWasDislike(false);
  }

  function requeueTrack(track: SpotifyTrack) {
    setDislikedTracks((prev) => prev.filter((t) => t.id !== track.id));
    setTracks((prev) => {
      const insertAt = index >= prev.length ? prev.length : index + 1;
      return [...prev.slice(0, insertAt), track, ...prev.slice(insertAt)];
    });
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
    likedTracks,
    dislikedTracks,
    likeError,
    playerState,
    currentTrack: tracks[index],
    nextTrack: tracks[index + 1],
    isDone: !loading && index >= tracks.length,
    canUndo: lastActionWasDislike && index > 0,
    handleLike,
    handleDislike,
    handleUndo,
    handleUnlike,
    requeueTrack,
    handlePlayerState,
    fetchRecommendations,
  };
}
