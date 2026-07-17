import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      if (api.getToken()) {
        const res = await api.notifications.getAll();
        if (res.success) {
          setNotifications(res.notifications);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 10 seconds for real-time notifications
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications([]);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('assign')) {
      return <Clock className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (t.includes('update') || t.includes('status')) {
      return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#888888] hover:text-white hover:bg-[#1A1A1A] border border-transparent hover:border-[#222222] rounded-sm transition-all duration-150 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-mono font-bold text-white ring-2 ring-black animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-sm border border-[#222222] bg-[#0E0E0E] shadow-2xl z-50 overflow-hidden font-sans">
          <div className="flex items-center justify-between border-b border-[#222222] bg-[#0A0A0A] px-4 py-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center text-[10px] font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3 mr-1" />
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-[#1D1D1D] bg-[#0E0E0E]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Bell className="w-8 h-8 text-[#333333] mb-2" />
                <p className="text-xs text-[#666666] font-mono uppercase tracking-wider">All caught up!</p>
                <p className="text-[10px] text-[#444444] mt-1">No new operational alerts.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif._id} className="p-3.5 hover:bg-[#121212] transition-colors flex items-start space-x-3">
                  <div className="p-1.5 bg-[#161616] border border-[#222222] rounded-sm mt-0.5">
                    {getIcon(notif.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white leading-normal truncate">{notif.title}</p>
                    <p className="text-[10px] text-[#888888] leading-relaxed mt-0.5">{notif.message}</p>
                    <span className="text-[9px] text-[#444444] font-mono mt-1 block">{formatTime(notif.createdAt)}</span>
                  </div>
                  <button
                    onClick={(e) => handleMarkRead(notif._id, e)}
                    className="p-1 text-[#444444] hover:text-white hover:bg-[#1A1A1A] rounded-sm transition-all cursor-pointer self-center"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
