import React, { useEffect, useState, useRef } from "react";
import { useInView } from "motion/react";

interface NumberRollProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export const NumberRoll: React.FC<NumberRollProps> = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.8,
  className = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const startTime = performance.now();

    const updateNumber = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out expo curve for smooth number roll
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [isInView, value, duration]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
