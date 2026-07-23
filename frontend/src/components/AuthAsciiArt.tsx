import React, { useEffect, useRef } from "react";

interface AuthAsciiArtProps {
  variant?: "matrix" | "landscape";
}

const CHAR_PALETTE = [
  " ",
  ".",
  ":",
  "-",
  "=",
  "+",
  "*",
  "#",
  "%",
  "@",
  "░",
  "▒",
  "▓",
  "█",
];

const MATRIX_GLYPHS = [
  "V",
  "E",
  "N",
  "D",
  "O",
  "R",
  "O",
  "S",
  "0",
  "1",
  "⚡",
  "✕",
  "✦",
  ":",
  ".",
  "+",
];

export const AuthAsciiArt: React.FC<AuthAsciiArtProps> = ({
  variant = "matrix",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const updateCanvasDimensions = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || 500;
      canvas.height = rect.height || 620;
    };
    updateCanvasDimensions();

    const render = () => {
      time += 0.02;
      const width = canvas.width;
      const height = canvas.height;

      // Clean White Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      const fontSize = 11;
      ctx.font = `${fontSize}px "Space Mono", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cols = Math.floor(width / (fontSize * 0.85));
      const rows = Math.floor(height / (fontSize * 1.15));

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * (fontSize * 0.85) + fontSize * 0.4;
          const y = r * (fontSize * 1.15) + fontSize * 0.5;

          const nx = c / cols;
          const ny = r / rows;

          let density = 0;
          let charToDraw = " ";

          if (variant === "matrix") {
            // Dynamic 3D sine wave field undulation
            const w1 = Math.sin(nx * 4 + time * 1.5);
            const w2 = Math.cos(ny * 5 - time * 1.2);
            const w3 = Math.sin((nx + ny) * 3 + time * 0.8);
            density = (w1 + w2 + w3 + 3) / 6;

            // Right-heavy gradient matching reference halftone density
            density *= Math.pow(nx, 0.7);

            const charIndex = Math.floor(density * (CHAR_PALETTE.length - 1));
            charToDraw = CHAR_PALETTE[Math.max(0, Math.min(CHAR_PALETTE.length - 1, charIndex))];

            // Random subtle matrix glyph sparkle
            if (density > 0.6 && Math.random() < 0.04) {
              const randGlyph = MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)];
              charToDraw = randGlyph;
            }
          } else {
            // Architectural / Organic Contour Wave matching Image 2
            const dx = nx - 0.5;
            const dy = ny - 0.5;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const ring = Math.sin(dist * 12 - time * 2);
            const wave = Math.cos(ny * 8 + nx * 6 + time);
            density = (ring + wave + 2) / 4;

            density *= Math.pow(nx, 0.5);

            const charIndex = Math.floor(density * (CHAR_PALETTE.length - 1));
            charToDraw = CHAR_PALETTE[Math.max(0, Math.min(CHAR_PALETTE.length - 1, charIndex))];
          }

          // Render ASCII character with high-precision opacity contrast
          if (density > 0.08) {
            const opacity = Math.min(1, Math.max(0.1, density * 1.2));
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.fillText(charToDraw, x, y);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      updateCanvasDimensions();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-white select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
