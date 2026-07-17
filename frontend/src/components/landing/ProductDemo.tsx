import React, { useEffect, useRef, useState } from "react";
import { MousePointer2 } from "lucide-react";

const DAYS = [
  { label: "Mon", load: 55 },
  { label: "Tue", load: 80 },
  { label: "Wed", load: 40 },
  { label: "Thu", load: 90 },
  { label: "Fri", load: 65 },
  { label: "Sat", load: 20 },
  { label: "Sun", load: 10 },
];

interface Waypoint {
  x: number;
  y: number;
  label: string;
}

export const ProductDemo: React.FC = () => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [cursor, setCursor] = useState({ x: 0, y: 0, opacity: 0 });
  const [tooltip, setTooltip] = useState({ text: "", show: false });
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    key: number;
  } | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function getWaypoints(): Waypoint[] {
      const bodyRect = bodyRef.current?.getBoundingClientRect();
      if (!bodyRect) return [];
      const targets = [
        { el: cellRefs.current[3], label: "Risk score updates automatically" },
        { el: tabRef.current, label: "Tap to switch to Risk view" },
        { el: cellRefs.current[1], label: "WhatsApp alert fires here" },
        { el: cellRefs.current[6], label: "Light day — capacity available" },
      ];
      return targets
        .filter((t) => t.el)
        .map((t) => {
          const r = t.el!.getBoundingClientRect();
          return {
            x: r.left - bodyRect.left + r.width / 2,
            y: r.top - bodyRect.top + r.height / 2,
            label: t.label,
          };
        });
    }

    const cancelledRef: { current: boolean } = { current: false };
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    async function runTour() {
      const wp = getWaypoints();
      if (wp.length === 0 || cancelledRef.current) return;

      setCursor({ x: wp[0].x, y: wp[0].y, opacity: 1 });
      await wait(400);

      for (const point of wp) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- cancelledRef is mutated from the effect cleanup closure
        if (cancelledRef.current) return;
        setTooltip({ text: "", show: false });
        setCursor({ x: point.x, y: point.y, opacity: 1 });
        await wait(900);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- cancelledRef is mutated from the effect cleanup closure
        if (cancelledRef.current) return;
        setTooltip({ text: point.label, show: true });
        setRipple({ x: point.x, y: point.y, key: Date.now() });
        await wait(1400);
      }

      setTooltip((t) => ({ ...t, show: false }));
      await wait(700);
      if (!cancelledRef.current) await runTour();
    }

    function wait(ms: number) {
      return new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timeouts.push(t);
      });
    }

    runTour();

    return () => {
      cancelledRef.current = true;
      timeouts.forEach(clearTimeout);
    };
  }, [running]);

  return (
    <section ref={sectionRef} className="py-28 bg-[#121924]">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="max-w-[640px] mx-auto text-center mb-16">
          <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[#D8A548] mb-3.5">
            See It In Action
          </span>
          <h2 className="font-sans font-semibold text-[clamp(26px,3.4vw,40px)] leading-tight tracking-tight text-white mb-4">
            A closer look at the calendar &amp; risk view
          </h2>
          <p className="text-[15.5px] leading-relaxed text-[#B7C4DA]">
            A guided tour of how an Owner sees production load and order risk at
            a glance.
          </p>
        </div>

        <div className="max-w-[980px] mx-auto">
          <div className="rounded-[18px] border border-[#1E2836] bg-[#131A26] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-[#1E2836] bg-[#0F1622] px-4 py-3">
              <span className="h-[9px] w-[9px] rounded-full bg-[#26313F]" />
              <span className="h-[9px] w-[9px] rounded-full bg-[#26313F]" />
              <span className="h-[9px] w-[9px] rounded-full bg-[#26313F]" />
              <div className="ml-2.5 flex-1 h-[22px] rounded-[6px] bg-[#1B2536] px-2.5 flex items-center text-[10.5px] font-mono text-[#7A8CA8]">
                app.vendoros.com/owner/calendar
              </div>
            </div>

            <div ref={bodyRef} className="relative min-h-[420px] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[14px] font-semibold text-white">
                  Production Load — This Week
                </div>
                <div className="flex gap-1.5">
                  <span
                    ref={tabRef}
                    className="rounded-full bg-[#D8A548]/15 text-[#D8A548] px-3 py-1.5 text-[10.5px] font-mono font-semibold uppercase tracking-wide"
                  >
                    Calendar
                  </span>
                  <span className="rounded-full border border-[#26313F] bg-[#0F1622] text-[#7A8CA8] px-3 py-1.5 text-[10.5px] font-mono uppercase tracking-wide">
                    Risk
                  </span>
                  <span className="rounded-full border border-[#26313F] bg-[#0F1622] text-[#7A8CA8] px-3 py-1.5 text-[10.5px] font-mono uppercase tracking-wide">
                    Orders
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DAYS.map((d, i) => (
                  <div
                    key={d.label}
                    ref={(el) => {
                      cellRefs.current[i] = el;
                    }}
                    className="relative rounded-[10px] border border-[#1E2836] bg-[#0F1622] p-2 text-[10px] font-mono uppercase text-[#7A8CA8]"
                    style={{ aspectRatio: "1 / 0.85" }}
                  >
                    {d.label}
                    <div className="absolute inset-x-2 bottom-2 h-[5px] rounded-[3px] bg-[#1E2836] overflow-hidden">
                      <span
                        className="block h-full rounded-[3px] bg-[#D8A548]"
                        style={{ width: `${d.load}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="pointer-events-none absolute left-0 top-0 z-20 transition-[left,top] duration-[900ms] ease-linear"
                style={{
                  left: cursor.x,
                  top: cursor.y,
                  opacity: cursor.opacity,
                }}
              >
                <MousePointer2 className="w-5 h-5 fill-white text-[#0B0F17]" />
                <div
                  className="absolute left-3.5 top-[26px] whitespace-nowrap rounded-[8px] bg-white px-3 py-2 text-[12px] font-semibold text-black shadow-lg transition-all duration-300"
                  style={{
                    opacity: tooltip.show ? 1 : 0,
                    transform: tooltip.show
                      ? "translateY(0)"
                      : "translateY(4px)",
                  }}
                >
                  {tooltip.text}
                </div>
              </div>

              {ripple && (
                <span
                  key={ripple.key}
                  className="pointer-events-none absolute h-5 w-5 rounded-full border-2 border-[#D8A548] animate-ping"
                  style={{ left: ripple.x - 10, top: ripple.y - 10 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
