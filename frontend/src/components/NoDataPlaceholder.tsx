import React from "react";
import { Inbox } from "lucide-react";

interface NoDataPlaceholderProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

/**
 * Simple empty-state box used in place of the subscription upgrade/pricing
 * card wherever a feature has no data to show yet.
 */
export const NoDataPlaceholder: React.FC<NoDataPlaceholderProps> = ({
  title = "No data yet",
  message = "This section will populate once related activity is recorded.",
  icon,
}) => {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-sm p-12 text-center max-w-2xl mx-auto my-8 shadow-md">
      <div className="w-10 h-10 rounded-sm bg-[#0A0A0A] border border-[#222222] text-[#444444] flex items-center justify-center mx-auto mb-4">
        {icon || <Inbox className="w-4 h-4" />}
      </div>
      <p className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">
        {title}
      </p>
      <p className="text-xs text-[#444444] mt-2 leading-relaxed max-w-sm mx-auto">
        {message}
      </p>
    </div>
  );
};

export default NoDataPlaceholder;
