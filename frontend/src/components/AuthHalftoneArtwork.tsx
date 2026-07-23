import React, { useEffect, useRef } from "react";

interface AuthHalftoneArtworkProps {
  variant?: "dotmatrix" | "landscape";
}

export const AuthHalftoneArtwork: React.FC<AuthHalftoneArtworkProps> = ({ variant = "dotmatrix" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 650);

      // Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#000000";

      const gridStep = 8;
      const cols = Math.ceil(width / gridStep);
      const rows = Math.ceil(height / gridStep);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gridStep;
          const y = r * gridStep;

          let density = 0;

          if (variant === "dotmatrix") {
            // S-curve organic halftone wave matching Image 1
            const nx = x / width;
            const ny = y / height;

            // Distance to organic wave curves
            const d1 = Math.sin(nx * Math.PI * 2.5 + ny * Math.PI * 1.5);
            const d2 = Math.cos(ny * Math.PI * 3.0 - nx * Math.PI * 1.2);
            const wave = (d1 + d2) / 2;

            if (nx > 0.3) {
              density = Math.pow((nx - 0.3) / 0.7, 0.8) * 0.8 + wave * 0.25;
            } else {
              density = wave * 0.15;
            }
          } else {
            // Architectural garden / landscape halftone matching Image 2
            const nx = x / width;
            const ny = y / height;

            // Arch / Dome structure contour
            const dx = nx - 0.2;
            const dy = ny - 0.4;
            const distFromArch = Math.sqrt(dx * dx + dy * dy);

            if (distFromArch > 0.25 && distFromArch < 0.38) {
              density = 0.85;
            } else if (ny > 0.5 && nx < 0.5) {
              // Tree/bush foliage density
              density = Math.sin(nx * 20) * Math.cos(ny * 25) * 0.5 + 0.5;
            } else if (ny > 0.65) {
              // Water reflection & ground plane horizontal dither
              density = Math.sin(ny * 50) * 0.4 + 0.4;
            } else {
              // Sky clouds dither
              density = Math.pow(ny, 1.5) * 0.4 + Math.sin(nx * 10) * 0.1;
            }
          }

          density = Math.max(0, Math.min(1, density));

          if (density > 0.05) {
            const radius = (density * gridStep) / 2.2;
            ctx.beginPath();
            // Square / Diamond or circle halftone dots
            if (variant === "dotmatrix") {
              ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
            } else {
              ctx.arc(x, y, radius, 0, Math.PI * 2);
            }
            ctx.fill();
          }
        }
      }
    };

    render();

    const handleResize = () => {
      render();
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
