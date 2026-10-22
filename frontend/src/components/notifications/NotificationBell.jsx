import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, ExternalLink, X } from "lucide-react";
import { OfferAPI } from "../../utils/marketplaceApi";
import { getSocket } from "../../utils/socket";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await OfferAPI.getNotifications({ limit: 15 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.warn("Could not load notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for live notifications over WebSocket
    const socket = getSocket();
    const handleNewNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification_new", handleNewNotif);

    // Click outside to close
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      socket.off("notification_new", handleNewNotif);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await OfferAPI.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await OfferAPI.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.warn(e);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-yellow-400 transition-colors rounded-full hover:bg-neutral-800"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-black ring-2 ring-neutral-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#1c1c1e] border border-neutral-700/80 shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-base">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-xs font-semibold text-yellow-400 border border-yellow-400/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-neutral-400 hover:text-yellow-400 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  to={notif.link || "/offers"}
                  onClick={() => handleItemClick(notif)}
                  className={`block p-4 transition-colors hover:bg-neutral-800/70 ${
                    !notif.is_read ? "bg-yellow-400/[0.04]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-sm font-medium ${
                        !notif.is_read ? "text-yellow-400 font-semibold" : "text-white"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span className="h-2 w-2 rounded-full bg-yellow-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="mt-2 block text-[10px] text-neutral-500">
                    {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-neutral-800 p-2 text-center bg-neutral-900/60">
            <Link
              to="/offers"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-yellow-400 hover:underline block py-1"
            >
              View All Offers &amp; Deals &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
