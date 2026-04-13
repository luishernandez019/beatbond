"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-[#1E1E1E] flex flex-col overflow-x-hidden">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#371F7D] opacity-[0.06] blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-[#1DB954] opacity-[0.07] blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-[#5B35CC] opacity-[0.05] blur-[100px]" />
      </div>

      {/* ── Hero ── */}
      <main className="relative flex flex-col items-center justify-center flex-1 text-center px-6 pt-32 pb-20 md:pt-40 md:pb-28">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight max-w-3xl text-[#1E1E1E]">
          Encuentra tu{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #371F7D 0%, #1DB954 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            próxima canción favorita
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#1E1E1E]/50 max-w-xl leading-relaxed">
          Descubre canciones recomendadas para ti. Dale like, pásala — BeatBond aprende lo que amas y lo que no.
        </p>

        <button
          onClick={() => signIn("spotify", { callbackUrl: "/home" })}
          className="mt-10 inline-flex items-center gap-3 bg-[#1DB954] hover:brightness-105 active:scale-95 transition-all rounded-2xl px-8 py-4 text-lg font-semibold text-white cursor-pointer"
        >
          <img src="/icons/spotify.svg" alt="Spotify" className="w-6 h-6" />
          Iniciar sesión con Spotify
        </button>

        <p className="mt-4 text-xs text-[#1E1E1E]/50">
          Al continuar aceptas nuestra{" "}
          <a href="/privacy" className="underline hover:text-[#371F7D] transition-colors">
            Política de Privacidad
          </a>
        </p>
      </main>

      {/* ── Footer ── */}
      <footer className="relative border-t border-[#1E1E1E]/8 py-6 text-center text-sm text-[#1E1E1E]">
        Hecho por{" "}
        <a
          href="https://www.luishernandez.digital"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#371F7D] font-semibold hover:opacity-75 transition-opacity"
        >
          Luis Hernández
        </a>
      </footer>
    </div>
  );
}
