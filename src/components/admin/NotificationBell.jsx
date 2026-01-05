
import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Loader,
  AlertCircle,
  Car,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const NotificationBell = ({ darkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (showPanel) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [showPanel]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/notifications/admin?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`relative p-2 rounded-xl transition-all ${
          darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
        }`}
      >
        <Bell size={20} className={unreadCount > 0 ? "text-amber-500" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div
            className={`absolute right-0 top-12 w-96 max-h-150 rounded-2xl shadow-2xl border z-50 flex flex-col ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Notifications</h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-amber-500" size={24} />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                    <Bell size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm text-center">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors cursor-pointer ${
                        !notification.read
                          ? darkMode
                            ? "bg-amber-500/5 hover:bg-amber-500/10"
                            : "bg-amber-50 hover:bg-amber-100"
                          : darkMode
                          ? "hover:bg-slate-700"
                          : "hover:bg-slate-50"
                      }`}
                      onClick={() =>
                        !notification.read && markAsRead(notification.id)
                      }
                    >
                      <div className="flex gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            notification.priority === "high"
                              ? "bg-red-100 dark:bg-red-900/20"
                              : "bg-amber-100 dark:bg-amber-900/20"
                          }`}
                        >
                          <Car
                            size={18}
                            className={
                              notification.priority === "high"
                                ? "text-red-600"
                                : "text-amber-600"
                            }
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4
                              className={`font-semibold text-sm ${
                                !notification.read
                                  ? "text-slate-900 dark:text-white"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          {notification.booking && (
                            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-xs space-y-1 mb-2">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Route:</span>
                                <span className="font-medium">
                                  {notification.booking.route}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Amount:</span>
                                <span className="font-bold text-amber-600">
                                  {notification.booking.amount}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {formatTime(notification.createdAt)}
                            </span>
                            {notification.read && (
                              <Check size={14} className="text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowPanel(false);
                    window.location.href = "/admin/bookings";
                  }}
                  className="w-full text-center text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all bookings
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
