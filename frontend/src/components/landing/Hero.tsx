import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  PlayCircle,
  ChevronDown,
  PackageSearch,
  BrainCircuit,
  Truck,
  Users,
  LineChart,
  Clock,
} from "lucide-react";

const FRAME_COUNT = 49;
const FRAME_SRC = (i: number) =>
  `/hero-frames/frame_${String(i + 1).padStart(3, "0")}.webp`;

type CardId =
  | "orders"
  | "ai"
  | "delivery"
  | "workers"
  | "production"
  | "ontime";

const CARD_CHECKPOINTS: { id: CardId; at: number }[] = [
  { id: "orders", at: 0.14 },
  { id: "ai", at: 0.3 },
  { id: "delivery", at: 0.46 },
  { id: "workers", at: 0.6 },
  { id: "production", at: 0.74 },
  { id: "ontime", at: 0.86 },
];

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const currentFrameRef = useRef(0);
  const [activeCards, setActiveCards] = useState<Set<CardId>>(new Set());
  const [hintVisible, setHintVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  function drawFrame(idx: number) {
    const canvas = canvasRef.current;
    const img = imagesRef.current[idx];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Preload frames
  useEffect(() => {
    const framesToLoad = reducedMotion
      ? [FRAME_COUNT - 1]
      : Array.from({ length: FRAME_COUNT }, (_, i) => i);
    framesToLoad.forEach((i) => {
      const img = new Image();
      img.src = FRAME_SRC(i);
      imagesRef.current[i] = img;
      if (i === (reducedMotion ? FRAME_COUNT - 1 : 0)) {
        img.onload = () => drawFrame(i);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (reducedMotion) return;
    const frameIdx = Math.round(progress * (FRAME_COUNT - 1));
    if (frameIdx !== currentFrameRef.current) {
      currentFrameRef.current = frameIdx;
      drawFrame(frameIdx);
    }
    setHintVisible(progress < 0.03);
    setActiveCards((prev) => {
      const next = new Set<CardId>();
      CARD_CHECKPOINTS.forEach((c) => {
        if (progress >= c.at) next.add(c.id);
      });
      if (next.size === prev.size && [...next].every((v) => prev.has(v)))
        return prev;
      return next;
    });
  });

  return (
    <section
      id="top"
      ref={wrapRef}
      className="relative"
      style={{ height: reducedMotion ? "auto" : "340vh" }}
    >
      {/*
        Fix for the "laptop viewport clipping" bug: this sticky container has a
        DEFINITE height (h-screen). Its children are a flex column, and the
        canvas stage below is flex-1 min-h-0 so it can actually shrink to fit
        whatever vertical space remains after the headline/copy — instead of
        forcing its own size from width (aspect-ratio) and overflowing on
        shorter "laptop" viewports where width-driven clamp() sizes stayed
        large but vertical space did not.
      */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center overflow-hidden bg-[#121924]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(207,159,79,0.08), transparent 70%)",
          }}
        />

        <div
          className="relative z-10 max-w-[820px] px-6 text-center shrink-0"
          style={{ paddingTop: "clamp(64px, 11vh, 118px)" }}
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#3B4C6B] bg-[#131A26] px-4 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-widest text-[#D8A548]">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Operations Platform
          </span>
          <h1
            className="mb-4 font-sans font-semibold leading-[1.1] tracking-tight text-white"
            style={{ fontSize: "clamp(28px, min(4.6vw, 6.4vh), 60px)" }}
          >
            Run your entire manufacturing operation{" "}
            <span className="font-serif italic font-medium text-[#D8A548]">
              from one intelligent workspace.
            </span>
          </h1>
          <p
            className="mx-auto mb-7 max-w-[600px] text-[#B7C4DA] leading-relaxed"
            style={{ fontSize: "clamp(14px, min(1.6vw, 2.2vh), 17px)" }}
          >
            VendorOS brings order tracking, workforce coordination, and delivery
            visibility into a single system — replacing scattered spreadsheets
            and WhatsApp threads with one connected view.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-white hover:bg-[#F0EAD8] text-black text-[11.5px] font-bold uppercase tracking-widest px-6 py-3 rounded-sm shadow-md transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 border border-[#26313F] hover:border-[#3B4C6B] text-[#EDF1F8] text-[11.5px] font-bold uppercase tracking-widest px-6 py-3 rounded-sm bg-[#131A26]/60 transition-colors"
            >
              See how it works
              <PlayCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Stage: flex-1 + min-h-0 is the key fix — lets this shrink to fit remaining height */}
        <div className="relative mt-5 flex w-[min(1240px,94vw)] flex-1 min-h-0 justify-center pb-[clamp(14px,3vh,28px)]">
          <div className="relative w-full max-w-[1080px] min-h-0 flex justify-center">
            <div
              className="relative w-full min-h-0 overflow-hidden rounded-[20px] border border-[#1E2836]"
              style={{
                background:
                  "radial-gradient(120% 140% at 50% 0%, #182233 0%, #0D131C 55%, #0A0E15 100%)",
                boxShadow:
                  "0 40px 90px -30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
              }}
            >
              <canvas
                ref={canvasRef}
                width={1600}
                height={900}
                className="block w-full h-full max-h-[56vh] min-h-[220px] object-cover"
              />
            </div>

            <FloatCard
              active={activeCards.has("orders")}
              className="left-[2%] top-[9%]"
              icon={<PackageSearch className="w-4 h-4" />}
              label="Incoming Orders"
              status="Syncing new orders"
            />
            <FloatCard
              active={activeCards.has("ai")}
              className="left-1/2 top-[1%] -translate-x-1/2"
              icon={<BrainCircuit className="w-4 h-4" />}
              label="AI Operations Copilot"
              status="Monitoring active orders"
            />
            <FloatCard
              active={activeCards.has("delivery")}
              className="right-[2%] top-[11%]"
              icon={<Truck className="w-4 h-4" />}
              label="Out for Delivery"
              status="In transit"
            />
            <FloatCard
              active={activeCards.has("workers")}
              className="bottom-[13%] left-[4%]"
              icon={<Users className="w-4 h-4" />}
              label="Workers on Floor"
              status="Active shift"
            />
            <FloatCard
              active={activeCards.has("production")}
              className="bottom-[5%] left-1/2 -translate-x-1/2"
              icon={<LineChart className="w-4 h-4" />}
              label="Production Status"
              status="On track"
            />
            <FloatCard
              active={activeCards.has("ontime")}
              className="bottom-[11%] right-[3%]"
              icon={<Clock className="w-4 h-4" />}
              label="On-Time Delivery"
              status="Trending well"
            />
          </div>
        </div>

        {!reducedMotion && (
          <div
            className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#7A8CA8] transition-opacity duration-300"
            style={{ opacity: hintVisible ? 0.9 : 0 }}
          >
            <span>Scroll to explore</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </section>
  );
};

function FloatCard({
  active,
  className,
  icon,
  label,
  status,
}: {
  active: boolean;
  className: string;
  icon: React.ReactNode;
  label: string;
  status: string;
}) {
  return (
    <div
      className={`absolute hidden lg:flex items-center gap-2.5 rounded-[10px] border border-[#26313F] bg-[#131A26]/95 backdrop-blur px-3.5 py-2.5 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out ${className}`}
      style={{
        opacity: active ? 1 : 0,
        transform: active
          ? "translateY(0) scale(1)"
          : "translateY(12px) scale(0.94)",
      }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#1B2536] text-[#D8A548]">
        {icon}
      </div>
      <div>
        <div className="text-[12px] font-semibold leading-tight text-[#EDF1F8]">
          {label}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-[#7A8CA8]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          {status}
        </div>
      </div>
    </div>
  );
}
