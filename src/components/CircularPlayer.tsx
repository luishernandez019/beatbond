"use client";
import { Play, Pause } from "lucide-react";

const RING_SIZE = 84;
const RING_STROKE = 3.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export interface PlayerState {
  isPlaying: boolean;
  progress: number;
  hasPreview: boolean;
  loading: boolean;
}

export interface CircularPlayerProps {
  isPlaying?: boolean;
  progress?: number;
  onToggle?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function CircularPlayer({
  isPlaying = false,
  progress = 0,
  onToggle,
  loading = false,
  disabled = false,
}: CircularPlayerProps) {
  const offset = RING_CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div className="relative flex-shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg width={RING_SIZE} height={RING_SIZE} className="absolute inset-0 -rotate-90">
        <circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={RING_STROKE}
        />
        {!loading && (
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
            fill="none" stroke="#D7FF81" strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        )}
      </svg>

      <button
        onClick={onToggle}
        disabled={loading || disabled}
        className="absolute inset-[6px] rounded-full bg-[#D7FF81] flex items-center justify-center hover:brightness-95 active:scale-95 transition disabled:opacity-50 cursor-pointer disabled:cursor-default"
        title={isPlaying ? "Pause" : "Play preview"}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-[#1E1E1E]/30 border-t-[#1E1E1E] rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause size={20} fill="#1E1E1E" color="#1E1E1E" />
        ) : (
          <Play size={20} fill="#1E1E1E" color="#1E1E1E" className="translate-x-0.5" />
        )}
      </button>
    </div>
  );
}
