import React from "react";
import { motion } from "motion/react";

export const AuthAmbientBackground: React.FC = () => {
  const GREEN = "#1B3A5C";
  const ORANGE = "#E8B23D";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden motion-reduce:hidden"
      style={{ perspective: "1400px" }}
    >
      {/* 1. Flat hexagon, slow 3D tumble, top-left */}
      <motion.svg
        className="absolute -top-16 -left-16 w-72 h-72"
        viewBox="0 0 100 100"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: [0, 25, -15, 0],
          rotateY: [0, -30, 20, 0],
          rotateZ: [0, 12, -8, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <polygon
          points="50,4 93,27 93,73 50,96 7,73 7,27"
          fill={GREEN}
          opacity={0.14}
        />
        <polygon
          points="50,4 93,27 93,73 50,96 7,73 7,27"
          fill="none"
          stroke={GREEN}
          strokeWidth="0.6"
          opacity={0.3}
        />
      </motion.svg>

      {/* 2. Flat diamond, counter-tumble, bottom-right */}
      <motion.svg
        className="absolute -bottom-20 -right-16 w-80 h-80"
        viewBox="0 0 100 100"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: [0, -20, 18, 0],
          rotateY: [0, 26, -22, 0],
          rotateZ: [0, -14, 10, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear",
          delay: 1.5,
        }}
      >
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          fill={ORANGE}
          opacity={0.12}
          transform="rotate(45 50 50)"
        />
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          fill="none"
          stroke={ORANGE}
          strokeWidth="0.6"
          opacity={0.32}
          transform="rotate(45 50 50)"
        />
      </motion.svg>

      {/* 3. Small rotating triangle, mid-right, third independent tumble */}
      <motion.svg
        className="absolute top-1/3 right-10 w-40 h-40"
        viewBox="0 0 100 100"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: [0, 30, -20, 0], rotateY: [0, -25, 35, 0] }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "linear",
          delay: 0.6,
        }}
      >
        <polygon
          points="50,10 90,85 10,85"
          fill="none"
          stroke={GREEN}
          strokeWidth="0.8"
          opacity={0.28}
        />
      </motion.svg>

      {/* 4. Radar sweep ring, slow full rotation, center-left */}
      <motion.svg
        className="absolute top-1/2 left-1/4 w-96 h-96 -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 200 200"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={GREEN}
          strokeWidth="0.5"
          opacity={0.18}
        />
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke={GREEN}
          strokeWidth="0.5"
          opacity={0.14}
          strokeDasharray="2 6"
        />
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="10"
          stroke={ORANGE}
          strokeWidth="1"
          opacity={0.35}
        />
      </motion.svg>

      {/* 5. Multiple dispatch routes with traveling stop-pins */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
      >
        <path
          id="route-a"
          d="M -50 460 C 180 380, 260 500, 420 400 S 700 220, 860 300 S 1050 180, 1100 140"
          fill="none"
          stroke={GREEN}
          strokeWidth="1"
          strokeDasharray="1 10"
          opacity={0.4}
        />
        <path
          id="route-b"
          d="M 1050 500 C 820 520, 760 380, 600 420 S 300 300, 120 340 S -80 260, -150 220"
          fill="none"
          stroke={ORANGE}
          strokeWidth="1"
          strokeDasharray="1 10"
          opacity={0.32}
        />
        <circle r="4.5" fill={ORANGE}>
          <animateMotion dur="13s" repeatCount="indefinite" rotate="auto">
            <mpath href="#route-a" />
          </animateMotion>
        </circle>
        <circle r="4" fill={GREEN}>
          <animateMotion
            dur="17s"
            repeatCount="indefinite"
            rotate="auto"
            begin="1.2s"
          >
            <mpath href="#route-b" />
          </animateMotion>
        </circle>
      </svg>

      {/* 6. Drifting dot-grid, gives texture without gradients/blur */}
      <motion.svg
        className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)] opacity-[0.16]"
        animate={{ x: [0, -24, 0], y: [0, -16, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <pattern
            id="dispatch-dot-grid"
            width="34"
            height="34"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.4" fill={GREEN} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dispatch-dot-grid)" />
      </motion.svg>
    </div>
  );
};
