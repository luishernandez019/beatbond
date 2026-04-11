"use client";
import { useRef, useState } from "react";
import { X, Heart } from "lucide-react";
import { SongCard, SongCardHandle } from "@/components/SongCard";
import { CircularPlayer } from "@/components/CircularPlayer";
import { FloatingNav, NavView } from "@/components/FloatingNav";
import { useRecommendations } from "@/hooks/useRecommendations";

export default function HomePage() {
  const cardRef = useRef<SongCardHandle>(null);
  const [activeView, setActiveView] = useState<NavView>("home");

  const {
    loading,
    error,
    likedCount,
    likeError,
    playerState,
    currentTrack,
    nextTrack,
    isDone,
    handleLike,
    handleDislike,
    handlePlayerState,
    fetchRecommendations,
  } = useRecommendations();

  const showControls = activeView === "home" && !loading && !isDone && !error && !!currentTrack;

  return (
    <section className="relative min-h-screen bg-[#371F7D] flex items-center justify-center px-4 pt-24 pb-8 md:pt-8">

      {/* Like error toast */}
      {likeError && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg animate-fade-in">
          {likeError}
        </div>
      )}

      {/* FloatingNav — absolute on desktop, vertically centered on the left */}
      <div className="hidden lg:flex absolute left-12 top-1/2 -translate-y-1/2">
        <FloatingNav
          activeView={activeView}
          onNavigate={setActiveView}
          orientation="vertical"
        />
      </div>

      {/* Main content — always centered */}
      <div className="flex flex-col items-center gap-8">

          {/* ── Home view ── */}
          {activeView === "home" && (
            <>
              {/* Card stack */}
              <div className="relative w-[320px] h-[480px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-white/50 text-sm">Finding songs for you…</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-white text-center">
                    <p className="text-4xl">⚠️</p>
                    <p className="text-white/70">{error}</p>
                    <button
                      onClick={fetchRecommendations}
                      className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer"
                    >
                      Retry
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
                    {nextTrack && (
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
                        onPlayerState={handlePlayerState}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="h-[84px] flex items-center gap-6">
                {showControls && (
                  <>
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
                  </>
                )}
              </div>
            </>
          )}

          {/* ── Settings view ── */}
          {activeView === "settings" && (
            <div className="w-[320px] h-[480px] flex flex-col items-center justify-center text-white gap-3">
              <p className="text-4xl">⚙️</p>
              <h2 className="text-xl font-bold">Settings</h2>
              <p className="text-white/50 text-sm">Coming soon</p>
            </div>
          )}

          {/* ── Liked view ── */}
          {activeView === "liked" && (
            <div className="w-[320px] h-[480px] flex flex-col items-center justify-center text-white gap-3">
              <p className="text-4xl">♥</p>
              <h2 className="text-xl font-bold">Liked Songs</h2>
              <p className="text-white/50 text-sm">Coming soon</p>
            </div>
          )}

          {/* FloatingNav — horizontal on mobile/tablet */}
          <div className="lg:hidden">
            <FloatingNav
              activeView={activeView}
              onNavigate={setActiveView}
              orientation="horizontal"
            />
          </div>

        </div>
    </section>
  );
}
