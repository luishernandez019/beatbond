"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const hasSession = !!session?.user;

  return (
    <nav className={`absolute top-0 left-0 w-full flex items-center gap-4 px-6 py-6 md:px-24 md:py-[45px] z-10 ${pathname === "/privacy" ? "justify-center md:justify-between" : "justify-between"}`}>
      <Link
        href="/"
        className={`group flex gap-x-[10px] md:gap-x-[15px] text-3xl md:text-[34px] font-bold transition-colors ${hasSession ? "text-white hover:text-white/80" : "text-[#1E1E1E] hover:text-[#371F7D]"}`}
      >
        <img
          src="/icons/beatbond.svg"
          alt="BeatBond icon"
          className={hasSession ? "" : "[filter:brightness(0)] transition-[filter] duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(14%)_sepia(89%)_saturate(800%)_hue-rotate(233deg)_brightness(85%)]"}
        />
        BeatBond
      </Link>

      {hasSession ? (
        <img
          src="/icons/logout.svg"
          alt="Sign out icon"
          className="cursor-pointer"
          onClick={async () => {
            await signOut({ callbackUrl: "/" });
          }}
        />
      ) : pathname !== "/privacy" ? (
        <Link href="/privacy" className="text-base md:text-lg font-medium text-[#1E1E1E]/50 hover:text-[#1E1E1E] transition-colors">
          Privacy Policy
        </Link>
      ) : null}
    </nav>
  );
};

export default Navbar;
