"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className={`absolute top-0 left-0 w-full flex items-center px-6 py-6 md:px-24 md:py-[45px] z-10 ${pathname === "/privacy" ? "justify-center md:justify-between" : "justify-between"}`}>
      <Link
        href="/"
        className={`
          flex gap-x-[10px] md:gap-x-[15px] text-3xl md:text-[34px] font-bold hover:opacity-80 transition-opacity
          ${session?.user ? "text-white" : "text-[#1E1E1E]"}
        `}
      >
        <img
          src="/icons/beatbond.svg"
          alt="BeatBond icon"
          className={session?.user
            ? ""
            : "[filter:brightness(0)_saturate(100%)_invert(13%)_sepia(60%)_saturate(900%)_hue-rotate(240deg)]"
          }
        />
        BeatBond
      </Link>

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
      ) : pathname !== "/privacy" ? (
        <Link href="/privacy" className="text-lg font-medium hover:opacity-75 transition-opacity">
          Privacy Policy
        </Link>
      ) : null}
    </nav>
  );
};

export default Navbar;