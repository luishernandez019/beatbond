"use client";
import { signIn } from "next-auth/react";

function LoginPage() {
  return (
    <section className="flex h-screen">
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
    </section> 
  );
};

export default LoginPage;