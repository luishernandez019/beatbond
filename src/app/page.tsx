"use client";
import { signIn } from "next-auth/react";

function LoginPage() {
  return (
    <section className="relative flex h-screen">
      <div className="w-3/5 space-y-[45px] px-[150px] content-center">
        <h1 className="text-5xl font-semibold leading-[1.5]">
          Match with your <br/>
          next favorite song
        </h1>

        <button
          onClick={() => signIn("spotify", { callbackUrl: "/home"})}
          className="flex bg-[#1DB954] rounded-[15px] px-[30px] py-[16px] gap-x-[15px] font-semibold text-white text-lg cursor-pointer hover:brightness-97"
        >
          <img src="/icons/spotify.svg" alt="Spotify icon"/>
          Sign in with Spotify
        </button>
      </div>

      <div className="w-2/5 h-screen content-center">
        <img src="/images/app_demo.webp" alt="Application demo"/>
      </div>
      <footer className="absolute bottom-6 left-0 right-0 text-center text-sm text-[#1E1E1E]">
        Made by{" "}
        <a
          href="https://www.luishernandez.digital"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#371F7D] font-medium hover:opacity-75 transition-opacity"
        >
          Luis Hernández
        </a>
      </footer>
    </section>
  );
};

export default LoginPage;