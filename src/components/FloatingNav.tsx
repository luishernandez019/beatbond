"use client";
import { Settings, Heart } from "lucide-react";
import { useSession } from "next-auth/react";

export type NavView = "home" | "settings" | "liked";

interface NavItem {
  id: NavView;
  icon: React.ElementType | null;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home",     icon: null     },
  { id: "settings", icon: Settings },
  { id: "liked",    icon: Heart    },
];

interface FloatingNavProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  orientation: "vertical" | "horizontal";
}

export function FloatingNav({ activeView, onNavigate, orientation }: FloatingNavProps) {
  const { data: session } = useSession();
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`
        bg-[#BC96FF] shadow-xl
        ${isVertical
          ? "flex flex-col items-center gap-5 rounded-full px-2 py-2"
          : "flex flex-row items-center gap-5 rounded-full px-2 py-2"
        }
      `}
    >
      {NAV_ITEMS.map(({ id, icon: Icon }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`
              w-13 h-13 rounded-full flex items-center justify-center
              transition cursor-pointer
              ${isActive ? "bg-[#371F7D]" : "hover:bg-white/30"}
            `}
            title={id}
          >
            {Icon === null ? (
              /* BeatBond logo shape — filtered to match state colors */
              <img
                src="/icons/beatbond.svg"
                alt=""
                width={24}
                height={24}
                className={isActive
                  ? "[filter:brightness(0)_saturate(100%)_invert(93%)_sepia(46%)_saturate(500%)_hue-rotate(30deg)]"
                  : "[filter:brightness(0)_saturate(100%)_invert(13%)_sepia(60%)_saturate(900%)_hue-rotate(240deg)]"
                }
              />
            ) : (
              <Icon
                size={20}
                color={isActive ? "#D7FF81" : "#371F7D"}
                fill={isActive ? "#D7FF81" : "none"}
              />
            )}
          </button>
        );
      })}

      {/* Profile photo — decorative */}
      <div className="w-13 h-13 rounded-full overflow-hidden bg-white/30 flex-shrink-0">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#371F7D]/20" />
        )}
      </div>
    </div>
  );
}
