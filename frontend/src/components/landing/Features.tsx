import React from "react";
import { motion } from "motion/react";
import {
  Warehouse,
  Gauge,
  MessageCircle,
  ShieldCheck,
  CalendarDays,
  LayoutGrid,
  Mic,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Warehouse,
    title: "Live Order Tracking",
    description:
      "Stages, assigned workers, and delivery location — all in one view.",
  },
  {
    icon: Gauge,
    title: "AI Risk Scoring",
    description:
      "A plain-English risk read on every active order before it runs late.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Alerts",
    description:
      "Delay risk, delivery halts, verification, and payment — sent automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Public Trust Score",
    description:
      "On-time delivery rate and ratings, visible to every customer.",
  },
  {
    icon: CalendarDays,
    title: "Calendar Load View",
    description: "See production load across the week at a glance.",
  },
  {
    icon: LayoutGrid,
    title: "Private Templates",
    description: "Managers spin up recurring order types instantly.",
  },
  {
    icon: Mic,
    title: "Voice Task Updates",
    description:
      "Workers update checklists by speaking — no typing on the floor.",
  },
  {
    icon: BadgeCheck,
    title: "Secure Delivery Verification",
    description: "Code-based proof of delivery, with no ambiguity.",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-28 bg-[#121924]">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="max-w-[640px] mx-auto text-center mb-16">
          <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[#D8A548] mb-3.5">
            Platform
          </span>
          <h2 className="font-sans font-semibold text-[clamp(26px,3.4vw,40px)] leading-tight tracking-tight text-white mb-4">
            Everything the floor and the front office need to stay in sync
          </h2>
          <p className="text-[15.5px] leading-relaxed text-[#B7C4DA]">
            Built around how manufacturing teams actually work — from the shop
            floor to the customer's inbox.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: (i % 4) * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -2 }}
                className="rounded-[14px] border border-[#1E2836] bg-[#131A26] p-6 transition-colors hover:border-[#3B4C6B]"
              >
                <div className="w-11 h-11 rounded-[10px] bg-[#1B2536] text-[#D8A548] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <h3 className="text-[15.5px] font-semibold text-[#EDF1F8] tracking-tight mb-1.5">
                  {f.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-[#8A97AB]">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
