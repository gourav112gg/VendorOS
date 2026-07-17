import React from "react";
import { motion } from "motion/react";
import { Warehouse, CalendarDays, Mic, UserRound } from "lucide-react";

const STEPS = [
  {
    icon: Warehouse,
    title: "Owner",
    desc: "Assigns the order and sets priority",
  },
  {
    icon: CalendarDays,
    title: "Manager",
    desc: "Plans production and staffs the floor",
  },
  {
    icon: Mic,
    title: "Worker",
    desc: "Executes the task and verifies by voice",
  },
  {
    icon: UserRound,
    title: "Customer",
    desc: "Tracks delivery and confirms with a code",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-28 bg-[#0F1622]">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="max-w-[640px] mx-auto text-center mb-16">
          <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[#D8A548] mb-3.5">
            The Flow
          </span>
          <h2 className="font-sans font-semibold text-[clamp(26px,3.4vw,40px)] leading-tight tracking-tight text-white mb-4">
            From assignment to confirmation
          </h2>
          <p className="text-[15.5px] leading-relaxed text-[#B7C4DA]">
            A single order moves through four clear handoffs — everyone always
            knows whose turn it is.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-start justify-between gap-9 md:gap-3">
          <svg
            className="hidden md:block absolute top-8 left-16 right-16 h-0.5 z-0"
            viewBox="0 0 1000 4"
            preserveAspectRatio="none"
            style={{ width: "calc(100% - 8rem)" }}
          >
            <path
              d="M0,2 L1000,2"
              stroke="#1E2836"
              strokeWidth="2"
              fill="none"
            />
            <motion.path
              d="M0,2 L1000,2"
              stroke="#D8A548"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative z-10 flex-1 text-center px-2"
              >
                <div className="mx-auto mb-[18px] flex h-16 w-16 items-center justify-center rounded-[14px] border border-[#26313F] bg-[#131A26] text-[#D8A548] shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-white mb-1.5">
                  {s.title}
                </h4>
                <p className="text-[13px] leading-relaxed text-[#8A97AB]">
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
