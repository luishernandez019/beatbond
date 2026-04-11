"use client";
import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { SpotifyTrack } from "@/types/spotify";
import { PlayerState } from "@/components/CircularPlayer";

export interface SongCardHandle {
  flyRight: () => Promise<void>;
  flyLeft: () => Promise<void>;
  togglePlay: () => void;
}

interface SongCardProps {
  track: SpotifyTrack;
  onLike: () => void;
  onDislike: () => void;
  isTop: boolean;
  onPlayerState?: (state: PlayerState) => void;
}

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 400;

const SongCard = forwardRef<SongCardHandle, SongCardProps>(function SongCard(
  { track, onLike, onDislike, isTop, onPlayerState },
  ref
) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const likeOpacity = useTransform(x, [30, SWIPE_THRESHOLD + 30], [0, 1]);
  const nopeOpacity = useTransform(x, [-(SWIPE_THRESHOLD + 30), -30], [1, 0]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(track.preview_url);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Keep onPlayerState in a ref so effects don't re-run when parent re-renders
  const onPlayerStateRef = useRef(onPlayerState);
  useEffect(() => { onPlayerStateRef.current = onPlayerState; }, [onPlayerState]);

  // Report state to parent whenever it changes
  useEffect(() => {
    onPlayerStateRef.current?.({
      isPlaying,
      progress,
      hasPreview: !!previewUrl,
      loading: loadingPreview,
    });
  }, [isPlaying, progress, previewUrl, loadingPreview]);

  // RAF loop for 60fps smooth progress while playing
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    function tick() {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  // Resolve preview URL from embed scraper if not included in track
  useEffect(() => {
    if (track.preview_url) {
      setPreviewUrl(track.preview_url);
      return;
    }
    setLoadingPreview(true);
    fetch(`/api/spotify/preview?id=${track.id}`)
      .then((r) => r.json())
      .then((data) => setPreviewUrl(data.previewUrl ?? null))
      .catch(() => setPreviewUrl(null))
      .finally(() => setLoadingPreview(false));
  }, [track.id, track.preview_url]);

  // Init audio element when previewUrl resolves
  useEffect(() => {
    if (!previewUrl) return;
    const audio = new Audio(previewUrl);
    audio.volume = 0.6;

    function handleEnded() {
      setIsPlaying(false);
      setProgress(0);
    }
    audio.addEventListener("ended", handleEnded);
    audioRef.current = audio;

    if (isTop) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  // isTop is intentionally omitted: we only want to re-init when the URL changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

  // Auto-play when card becomes top
  useEffect(() => {
    if (!isTop || !audioRef.current) return;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [isTop]);

  function pauseAudio() {
    cancelAnimationFrame(rafRef.current);
    audioRef.current?.pause();
    setIsPlaying(false);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  useImperativeHandle(ref, () => ({
    flyRight: async () => {
      pauseAudio();
      await controls.start({ x: 600, opacity: 0, transition: { duration: 0.3, ease: "easeOut" } });
      onLike();
    },
    flyLeft: async () => {
      pauseAudio();
      await controls.start({ x: -600, opacity: 0, transition: { duration: 0.3, ease: "easeOut" } });
      onDislike();
    },
    togglePlay,
  }));

  async function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const swipedRight = info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD;
    const swipedLeft  = info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD;

    if (swipedRight) {
      pauseAudio();
      await controls.start({ x: 600, opacity: 0, transition: { duration: 0.3, ease: "easeOut" } });
      onLike();
    } else if (swipedLeft) {
      pauseAudio();
      await controls.start({ x: -600, opacity: 0, transition: { duration: 0.3, ease: "easeOut" } });
      onDislike();
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 25 } });
    }
  }

  const imageUrl = track.album.images[0]?.url;
  const artists   = track.artists.map((a) => a.name).join(", ");
  const minutes   = Math.floor(track.duration_ms / 60000);
  const seconds   = String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0");

  if (!isTop) {
    return (
      <div className="absolute inset-0 rounded-[24px] overflow-hidden scale-95 translate-y-3 shadow-lg">
        {imageUrl && <img src={imageUrl} alt={track.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 rounded-[24px] overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none"
      style={{ x, rotate }}
      animate={controls}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.03 }}
    >
      {imageUrl && (
        <img src={imageUrl} alt={track.name} className="w-full h-full object-cover" draggable={false} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      <motion.div
        className="absolute top-8 left-6 border-[3px] border-[#1DB954] text-[#1DB954] text-3xl font-extrabold rounded-xl px-4 py-1 -rotate-12 tracking-widest"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>

      <motion.div
        className="absolute top-8 right-6 border-[3px] border-red-400 text-red-400 text-3xl font-extrabold rounded-xl px-4 py-1 rotate-12 tracking-widest"
        style={{ opacity: nopeOpacity }}
      >
        NOPE
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h2 className="text-white text-2xl font-bold leading-tight truncate">{track.name}</h2>
        <p className="text-white/80 text-base mt-0.5 truncate">{artists}</p>
        <p className="text-white/50 text-sm mt-0.5 truncate">
          {track.album.name} · {minutes}:{seconds}
        </p>

        <a
          href={track.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-[#1DB954] text-xs font-semibold hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <img src="/icons/spotify.svg" alt="" className="w-3.5 h-3.5" />
          Open in Spotify
        </a>
      </div>
    </motion.div>
  );
});

export { SongCard };
