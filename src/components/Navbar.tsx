"use client";
import { signOut, useSession } from "next-auth/react";

function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="absolute top-0 left-0 w-full flex items-center justify-between px-24 py-[45px] z-10">
      <h1
        className={`
          flex gap-x-[15px] text-[34px] font-bold
          ${session?.user ? "text-white" : "text-[#1E1E1E]"}
        `}
      >
        <img src="/icons/beatbond.svg" alt="BeatBond icon"/>
        BeatBond
      </h1>

      {session?.user ? (
        <img
          src="/icons/logout.svg" alt="Sign out icon"
          className="cursor-pointer"
          onClick={async () => {
            await signOut({
              callbackUrl: "/",
            })
          }}
        />
      ) : (
        <h1 className="text-lg font-medium cursor-pointer">
          Privacy Policy
        </h1>
      )}
    </nav>
  );
};

export default Navbar;