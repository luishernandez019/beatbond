"use client";
import { useRef, useState, useEffect } from "react";
import { X, Heart, Undo2, HeartOff, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SongCard, SongCardHandle } from "@/components/SongCard";
import { CircularPlayer } from "@/components/CircularPlayer";
import { FloatingNav, NavView } from "@/components/FloatingNav";
import { useRecommendations, Filters } from "@/hooks/useRecommendations";
import { SpotifyTrack } from "@/types/spotify";

const GENRES = [
  "pop", "rock", "hip-hop", "electronic", "jazz", "classical",
  "latin", "r-n-b", "folk", "indie", "soul", "dance",
];

const DEFAULT_FILTERS: Filters = { genres: [], energy: null, mood: null };

function TrackRow({
  track,
  action,
  onAction,
}: {
  track: SpotifyTrack;
  action: "unlike" | "requeue";
  onAction: () => void;
}) {
  const artists = track.artists.map((a) => a.name).join(", ");
  const image = track.album.images[0]?.url;
  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
      {image && (
        <img src={image} alt={track.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{track.name}</p>
        <p className="text-white/50 text-xs truncate">{artists}</p>
      </div>
      <button
        onClick={onAction}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
        title={action === "unlike" ? "Quitar like" : "Recuperar"}
      >
        {action === "unlike"
          ? <HeartOff size={14} color="white" />
          : <RotateCcw size={14} color="white" />
        }
      </button>
    </div>
  );
}

export default function HomePage() {
  const cardRef = useRef<SongCardHandle>(null);
  const [activeView, setActiveView] = useState<NavView>("home");
  const [revertedId, setRevertedId] = useState<string | null>(null);
  const [isReverting, setIsReverting] = useState(false);

  const [saveToPlaylist, setSaveToPlaylist] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("beatbond_save_to_playlist") === "true";
  });

  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === "undefined") return DEFAULT_FILTERS;
    try {
      const stored = localStorage.getItem("beatbond_filters");
      return stored ? JSON.parse(stored) : DEFAULT_FILTERS;
    } catch {
      return DEFAULT_FILTERS;
    }
  });

  useEffect(() => {
    localStorage.setItem("beatbond_filters", JSON.stringify(filters));
  }, [filters]);

  function handleSaveToPlaylistChange(checked: boolean) {
    setSaveToPlaylist(checked);
    localStorage.setItem("beatbond_save_to_playlist", String(checked));
  }

  function toggleGenre(genre: string) {
    setFilters((f) => ({
      ...f,
      genres: f.genres.includes(genre)
        ? f.genres.filter((g) => g !== genre)
        : f.genres.length < 3 ? [...f.genres, genre] : f.genres,
    }));
  }

  const {
    tracks,
    index,
    loading,
    error,
    likedCount,
    likedTracks,
    dislikedTracks,
    likeError,
    playerState,
    currentTrack,
    nextTrack,
    isDone,
    canUndo,
    handleLike,
    handleDislike,
    handleUndo,
    handleUnlike,
    requeueTrack,
    handlePlayerState,
    fetchRecommendations,
  } = useRecommendations(saveToPlaylist, filters);

  function onUndo() {
    const prevTrack = tracks[index - 1];
    setRevertedId(prevTrack?.id ?? null);
    setIsReverting(true);
    handleUndo();
  }

  const showControls = activeView === "home" && !loading && !isDone && !error && !!currentTrack;

  return (
    <section className="relative min-h-screen bg-[#371F7D] flex items-center justify-center px-4">

      {/* Like error toast */}
      {likeError && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg animate-fade-in">
          {likeError}
        </div>
      )}

      {/* FloatingNav — absolute on desktop, vertically centered on the left */}
      <div className="hidden lg:flex absolute left-24 top-1/2 -translate-y-1/2">
        <FloatingNav
          activeView={activeView}
          onNavigate={setActiveView}
          orientation="vertical"
          instanceId="desktop"
        />
      </div>

      {/* Main content — always centered */}
      <div className="flex flex-col items-center gap-8">

        <AnimatePresence mode="wait">

          {/* ── Home / swipe view ── */}
          {activeView === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col items-center gap-8"
            >
              {/* Card stack */}
              <div className="relative w-[320px] h-[390px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-white/50 text-sm">Encontrando canciones para ti…</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-white text-center">
                    <p className="text-4xl">⚠️</p>
                    <p className="text-white/70">{error}</p>
                    <button
                      onClick={fetchRecommendations}
                      className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer"
                    >
                      Intenta de nuevo
                    </button>
                  </div>
                ) : isDone ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-white text-center">
                    <p className="text-5xl">🎵</p>
                    <h2 className="text-2xl font-bold">All caught up!</h2>
                    <p className="text-white/50 text-sm">
                      You liked {likedCount} song{likedCount !== 1 ? "s" : ""}
                    </p>
                    <button
                      onClick={fetchRecommendations}
                      className="bg-[#1DB954] hover:brightness-90 text-white px-6 py-3 rounded-full font-semibold text-sm transition mt-2 cursor-pointer"
                    >
                      Get more songs
                    </button>
                  </div>
                ) : (
                  <>
                    {nextTrack && !isReverting && (
                      <SongCard
                        key={`bg-${nextTrack.id}`}
                        track={nextTrack}
                        onLike={() => {}}
                        onDislike={() => {}}
                        isTop={false}
                      />
                    )}
                    {currentTrack && (
                      <SongCard
                        key={currentTrack.id}
                        ref={cardRef}
                        track={currentTrack}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        isTop={true}
                        isReverted={currentTrack.id === revertedId}
                        onReverted={() => { setRevertedId(null); setIsReverting(false); }}
                        onPlayerState={handlePlayerState}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="h-[84px] flex flex-col items-center gap-2">
                {showControls && (
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => cardRef.current?.flyLeft()}
                      className="w-14 h-14 rounded-full bg-[#522E99] flex items-center justify-center shadow-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
                      title="Discard"
                    >
                      <X size={22} color="white" strokeWidth={2.5} />
                    </button>

                    <CircularPlayer
                      isPlaying={playerState.isPlaying}
                      progress={playerState.progress}
                      loading={playerState.loading}
                      disabled={!playerState.hasPreview && !playerState.loading}
                      onToggle={() => cardRef.current?.togglePlay()}
                    />

                    <button
                      onClick={() => cardRef.current?.flyRight()}
                      className="w-14 h-14 rounded-full bg-[#FF4365] flex items-center justify-center shadow-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
                      title="Like"
                    >
                      <Heart size={22} fill="white" color="white" />
                    </button>
                  </div>
                )}

                {canUndo && (
                  <button
                    onClick={onUndo}
                    className="flex items-center gap-1.5 text-white/60 text-xs font-medium hover:text-white/90 transition cursor-pointer"
                    title="Undo discard"
                  >
                    <Undo2 size={13} strokeWidth={2} />
                    Revertir
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Liked view ── */}
          {activeView === "liked" && (
            <motion.div
              key="liked"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-[320px] flex flex-col gap-3"
            >
              <h2 className="text-white text-xl font-bold tracking-tight">Me gusta</h2>
              {likedTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-3 text-white">
                  <Heart size={36} className="text-white fill-white" />
                  <p className="text-white/50 text-sm">Aún no hay canciones con like</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[440px] overflow-y-auto pr-0.5">
                  {[...likedTracks].reverse().map((track) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      action="unlike"
                      onAction={() => handleUnlike(track)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── History view ── */}
          {activeView === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-[320px] flex flex-col gap-3"
            >
              <h2 className="text-white text-xl font-bold tracking-tight">Descartadas</h2>
              {dislikedTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-3 text-white">
                  <p className="text-4xl">🗑️</p>
                  <p className="text-white/50 text-sm">No hay canciones descartadas</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[440px] overflow-y-auto pr-0.5">
                  {[...dislikedTracks].reverse().map((track) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      action="requeue"
                      onAction={() => {
                        requeueTrack(track);
                        setActiveView("home");
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Settings view ── */}
          {activeView === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-[320px] flex flex-col gap-4"
            >
              {/* General settings */}
              <div className="bg-[#4A2D9E] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                <h2 className="text-white text-xl font-bold tracking-tight">Ajustes</h2>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={saveToPlaylist}
                      onChange={(e) => handleSaveToPlaylistChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-[#BC96FF] bg-transparent peer-checked:bg-[#BC96FF] peer-checked:border-[#BC96FF] transition flex items-center justify-center">
                      {saveToPlaylist && (
                        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                          <path d="M1 3.5L4 6.5L10 1" stroke="#371F7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white text-sm font-medium leading-snug">
                      Guardar en playlist BeatBond
                    </span>
                    <span className="text-white/50 text-xs leading-snug">
                      Las canciones con las que hagas match se añadirán automáticamente a tu playlist "BeatBond" en Spotify (si no existe se creará una).
                    </span>
                  </div>
                </label>
              </div>

              {/* Filters */}
              <div className="bg-[#4A2D9E] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                <h2 className="text-white text-xl font-bold tracking-tight">Filtros</h2>

                {/* Genres */}
                <div className="flex flex-col gap-2">
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    Géneros {filters.genres.length > 0 && `· ${filters.genres.length}/3`}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map((g) => {
                      const selected = filters.genres.includes(g);
                      const disabled = !selected && filters.genres.length >= 3;
                      return (
                        <button
                          key={g}
                          onClick={() => toggleGenre(g)}
                          disabled={disabled}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                            selected
                              ? "bg-[#BC96FF] text-[#371F7D]"
                              : disabled
                              ? "bg-white/5 text-white/25"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Energy slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={filters.energy != null}
                          onChange={(e) =>
                            setFilters((f) => ({ ...f, energy: e.target.checked ? 0.5 : null }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded border-2 border-[#BC96FF] bg-transparent peer-checked:bg-[#BC96FF] peer-checked:border-[#BC96FF] transition flex items-center justify-center">
                          {filters.energy != null && (
                            <svg width="9" height="7" viewBox="0 0 11 8" fill="none">
                              <path d="M1 3.5L4 6.5L10 1" stroke="#371F7D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-white text-sm font-medium">Energía</span>
                    </label>
                    {filters.energy != null && (
                      <span className="text-[#BC96FF] text-xs font-semibold">
                        {Math.round(filters.energy * 100)}%
                      </span>
                    )}
                  </div>
                  {filters.energy != null && (
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(filters.energy * 100)}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, energy: parseInt(e.target.value) / 100 }))
                      }
                      className="w-full accent-[#BC96FF]"
                    />
                  )}
                </div>

                {/* Mood slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={filters.mood != null}
                          onChange={(e) =>
                            setFilters((f) => ({ ...f, mood: e.target.checked ? 0.5 : null }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded border-2 border-[#BC96FF] bg-transparent peer-checked:bg-[#BC96FF] peer-checked:border-[#BC96FF] transition flex items-center justify-center">
                          {filters.mood != null && (
                            <svg width="9" height="7" viewBox="0 0 11 8" fill="none">
                              <path d="M1 3.5L4 6.5L10 1" stroke="#371F7D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-white text-sm font-medium">Positividad</span>
                    </label>
                    {filters.mood != null && (
                      <span className="text-[#BC96FF] text-xs font-semibold">
                        {Math.round(filters.mood * 100)}%
                      </span>
                    )}
                  </div>
                  {filters.mood != null && (
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(filters.mood * 100)}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, mood: parseInt(e.target.value) / 100 }))
                      }
                      className="w-full accent-[#BC96FF]"
                    />
                  )}
                </div>

                <button
                  onClick={() => { fetchRecommendations(); setActiveView("home"); }}
                  className="w-full bg-[#BC96FF] hover:brightness-105 active:scale-95 text-[#371F7D] font-semibold text-sm py-2.5 rounded-full transition cursor-pointer"
                >
                  Buscar nuevas canciones
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* FloatingNav — horizontal on mobile/tablet, fixed at bottom */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <FloatingNav
            activeView={activeView}
            onNavigate={setActiveView}
            orientation="horizontal"
            instanceId="mobile"
          />
        </div>

      </div>
    </section>
  );
}
