import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export const OfflineConnectivityMonitor: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-bold flex items-center space-x-1.5 animate-pulse shadow-sm">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Local Operations Active</span>
    </div>
  );
};
