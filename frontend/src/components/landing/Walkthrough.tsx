import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface Beat {
  role: string;
  title: string;
  url: string;
  description: string;
  render: () => React.ReactNode;
}

const TAG_STYLES: Record<string, string> = {
  ontrack: "bg-emerald-500/10 text-emerald-400",
  risk: "bg-amber-500/10 text-amber-400",
  transit: "bg-[#D8A548]/15 text-[#D8A548]",
  free: "bg-white/5 text-[#8A97AB]",
};

function Row({
  name,
  tag,
  tone,
  dot,
}: {
  name: string;
  tag: string;
  tone: keyof typeof TAG_STYLES;
  dot: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-[8px] border border-[#1E2836] bg-[#0F1622] px-3 py-2.5">
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ background: dot }}
      />
      <span className="flex-1 text-[12px] font-medium text-[#EDF1F8]">
        {name}
      </span>
      <span
        className={`rounded-full px-2 py-[3px] text-[10px] font-semibold ${TAG_STYLES[tone]}`}
      >
        {tag}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#1E2836] bg-[#0F1622] px-3.5 py-3">
      <div className="text-[10.5px] font-mono uppercase tracking-wide text-[#7A8CA8]">
        {label}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-[#EDF1F8]">
        {value}
      </div>
    </div>
  );
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-[6px] px-3 py-2.5 text-[11.5px] font-mono uppercase tracking-wide ${
        active
          ? "bg-[#D8A548]/15 text-[#D8A548] font-semibold"
          : "text-[#7A8CA8]"
      }`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
      {label}
    </div>
  );
}

const BEATS: Beat[] = [
  {
    role: "Owner",
    title: "The full-company view",
    url: "app.vendoros.com/owner",
    description:
      "See every order, every manager, and every risk flag across the company from one dashboard.",
    render: () => (
      <div className="flex h-full gap-4">
        <div className="w-[140px] shrink-0 flex flex-col gap-1.5">
          <NavItem label="Overview" active />
          <NavItem label="Orders" />
          <NavItem label="Managers" />
          <NavItem label="Trust Score" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2.5">
            <Stat label="Active Orders" value="Sample data" />
            <Stat label="Managers" value="Sample data" />
            <Stat label="Risk Flags" value="Sample data" />
          </div>
          <div className="flex-1 flex flex-col gap-1.5 rounded-[10px] border border-[#1E2836] bg-[#0B0F17] p-2.5 overflow-hidden">
            <Row
              name="Aravali Steelworks — Batch 14"
              tone="ontrack"
              tag="On track"
              dot="#34D399"
            />
            <Row
              name="Crestline Textiles — Order 88"
              tone="risk"
              tag="At risk"
              dot="#F59E0B"
            />
            <Row
              name="Deccan Auto Parts — Order 41"
              tone="transit"
              tag="In transit"
              dot="#D8A548"
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    role: "Manager",
    title: "Plan, staff, and template",
    url: "app.vendoros.com/manager",
    description:
      "Assigned orders, a worker directory with busy/free status, and a library of private templates.",
    render: () => (
      <div className="flex h-full gap-4">
        <div className="w-[140px] shrink-0 flex flex-col gap-1.5">
          <NavItem label="My Orders" active />
          <NavItem label="Workers" />
          <NavItem label="Templates" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Row name="Priya Sharma" tone="transit" tag="Busy" dot="#D8A548" />
            <Row name="Rohit Verma" tone="ontrack" tag="Free" dot="#34D399" />
            <Row name="Ananya Iyer" tone="ontrack" tag="Free" dot="#34D399" />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <Stat label="Template" value="Standard Batch" />
            <Stat label="Template" value="Rush Order" />
            <Stat label="Template" value="Bulk Export" />
          </div>
        </div>
      </div>
    ),
  },
  {
    role: "Worker",
    title: "Update tasks by speaking",
    url: "app.vendoros.com/worker",
    description:
      "A simple checklist screen with voice-based updates — no typing needed on the floor.",
    render: () => (
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Row
            name="Cut & prep — Batch 14"
            tone="ontrack"
            tag="Done"
            dot="#34D399"
          />
          <Row
            name="Assembly — Batch 14"
            tone="transit"
            tag="In progress"
            dot="#D8A548"
          />
          <Row
            name="Quality check — Batch 14"
            tone="free"
            tag="Pending"
            dot="#7A8CA8"
          />
        </div>
        <div className="mt-auto self-center flex items-center gap-2.5 rounded-full bg-white text-black px-5 py-3 text-[11.5px] font-bold uppercase tracking-widest">
          <span className="h-2.5 w-2.5 rounded-full bg-black animate-pulse" />
          Listening — say "mark assembly done"
        </div>
      </div>
    ),
  },
  {
    role: "Customer",
    title: "Track, verify, confirm",
    url: "app.vendoros.com/track",
    description:
      "Order tracking, a live delivery map, and a verification code screen — no photo uploads needed.",
    render: () => (
      <div className="flex h-full flex-col gap-4">
        <div className="relative flex-1 rounded-[10px] border border-[#1E2836] bg-gradient-to-br from-[#1B2536] to-[#0B0F17] overflow-hidden">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 300 130"
            preserveAspectRatio="none"
          >
            <path
              d="M20,100 C 80,20 180,110 280,30"
              stroke="#D8A548"
              strokeWidth="2"
              strokeDasharray="5 5"
              fill="none"
            />
          </svg>
          <span className="absolute left-4 top-[86px] h-3.5 w-3.5 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[#D8A548] shadow-[0_0_0_4px_rgba(216,165,72,0.18)]" />
          <span className="absolute right-[26px] top-[18px] h-3.5 w-3.5 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]" />
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wide text-[#7A8CA8]">
            Enter verification code on delivery
          </div>
          <div className="mt-2 flex gap-2">
            {["4", "8", "2", "0"].map((d, i) => (
              <div
                key={i}
                className="flex h-10 w-[34px] items-center justify-center rounded-[8px] border border-[#26313F] bg-[#0F1622] text-[15px] font-bold text-[#D8A548]"
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

function BrowserFrame({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 rounded-[16px] border border-[#1E2836] bg-[#131A26] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
      <div className="flex items-center gap-1.5 border-b border-[#1E2836] bg-[#0F1622] px-4 py-3">
        <span className="h-[9px] w-[9px] rounded-full bg-[#26313F]" />
        <span className="h-[9px] w-[9px] rounded-full bg-[#26313F]" />
        <span className="h-[9px] w-[9px] rounded-full bg-[#26313F]" />
        <div className="ml-2.5 flex-1 h-[22px] rounded-[6px] bg-[#1B2536] px-2.5 flex items-center text-[10.5px] font-mono text-[#7A8CA8]">
          {url}
        </div>
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}

export const Walkthrough: React.FC = () => {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((el, i) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i);
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section id="walkthrough" className="py-28 bg-[#0F1622]">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="max-w-[640px] mb-16">
          <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[#D8A548] mb-3.5">
            Product Walkthrough
          </span>
          <h2 className="font-sans font-semibold text-[clamp(26px,3.4vw,40px)] leading-tight tracking-tight text-white mb-4">
            One workspace, four points of view
          </h2>
          <p className="text-[15.5px] leading-relaxed text-[#B7C4DA]">
            Everyone touching an order — from the owner to the customer waiting
            on it — sees exactly what they need, nothing more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-16">
          <div className="flex flex-col gap-1.5 lg:sticky lg:top-[130px] lg:self-start">
            {BEATS.map((b, i) => (
              <div
                key={b.role}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onClick={() => setActive(i)}
                className={`cursor-pointer rounded-[14px] border p-5 transition-colors duration-300 ${
                  active === i
                    ? "border-[#26313F] bg-[#131A26]"
                    : "border-transparent"
                }`}
              >
                <span
                  className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-[#D8A548] transition-opacity duration-300"
                  style={{ opacity: active === i ? 1 : 0.5 }}
                >
                  0{i + 1} · {b.role}
                </span>
                <h4
                  className="mb-1.5 text-[18px] font-semibold tracking-tight text-white transition-opacity duration-300"
                  style={{ opacity: active === i ? 1 : 0.45 }}
                >
                  {b.title}
                </h4>
                <p
                  className="text-[13.5px] leading-relaxed text-[#8A97AB] overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: active === i ? 80 : 0,
                    opacity: active === i ? 1 : 0,
                  }}
                >
                  {b.description}
                </p>
              </div>
            ))}
          </div>

          <div className="relative h-[560px] lg:sticky lg:top-[130px]">
            {BEATS.map((b, i) => (
              <motion.div
                key={b.role}
                className="absolute inset-0"
                animate={{
                  opacity: active === i ? 1 : 0,
                  y: active === i ? 0 : 18,
                  pointerEvents: active === i ? "auto" : "none",
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <BrowserFrame url={b.url}>{b.render()}</BrowserFrame>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
