"use client";
import { motion } from "framer-motion";
import { Settings, Heart, History } from "lucide-react";
import { useSession } from "next-auth/react";

export type NavView = "home" | "liked" | "history" | "settings";

interface NavItem {
  id: NavView;
  icon: React.ElementType | null;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home",     icon: null     },
  { id: "liked",    icon: Heart    },
  { id: "history",  icon: History  },
  { id: "settings", icon: Settings },
];

interface FloatingNavProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  orientation: "vertical" | "horizontal";
  instanceId?: string;
}

export function FloatingNav({ activeView, onNavigate, orientation, instanceId = "default" }: FloatingNavProps) {
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
            className="relative w-13 h-13 rounded-full flex items-center justify-center cursor-pointer"
            title={id}
          >
            {/* Sliding active background */}
            {isActive && (
              <motion.div
                layoutId={`nav-active-bg-${instanceId}`}
                className="absolute inset-0 rounded-full bg-[#371F7D]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            {/* Hover background (inactive only) */}
            {!isActive && (
              <span className="absolute inset-0 rounded-full hover:bg-white/30 transition" />
            )}

            {/* Icon */}
            <span className="relative z-10">
              {Icon === null ? (
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
                  fill={id === "liked" && isActive ? "#D7FF81" : "none"}
                />
              )}
            </span>
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
