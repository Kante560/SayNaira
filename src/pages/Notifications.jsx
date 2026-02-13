import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { Bell, ArrowLeft, Trash2 } from "lucide-react";

export const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  /* ---------------- MARK ALL AS READ ---------------- */
  const markAllAsRead = async (notifs) => {
    const unread = notifs.filter((n) => !n.read);

    if (!unread.length) return;

    const updates = unread.map((n) =>
      updateDoc(doc(db, "notifications", n.id), { read: true })
    );

    await Promise.all(updates);
  };

  /* ---------------- CLEAR READ NOTIFICATIONS ---------------- */
  const clearViewedNotifications = async () => {
    if (!user) return;

    try {
      setClearing(true);

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        where("read", "==", true)
      );

      const snap = await getDocs(q);

      const deletes = snap.docs.map((d) => deleteDoc(d.ref));

      await Promise.all(deletes);

      console.log("Viewed notifications deleted ✅");
    } catch (err) {
      console.error("Clear error:", err);
    } finally {
      setClearing(false);
    }
  };

  /* ---------------- REALTIME LISTENER ---------------- */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const notifs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setNotifications(notifs);

      const unread = notifs.filter((n) => !n.read).length;
      setUnreadCount(unread);

      setLoading(false);

      // Auto mark as read
      await markAllAsRead(notifs);
    });

    return () => unsub();
  }, [user]);

  /* ---------------- CLICK HANDLER ---------------- */
  const handleNotificationClick = (notif) => {
    if (notif.type === "message") {
      navigate(`/chat/${notif.senderId}`);
    }
  };

  /* ---------------- TIME FORMAT ---------------- */
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    const diff = Date.now() - date;

    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return `${days}d ago`;
  };

  if (!user) {
    return (
      <div className="text-center mt-20 dark:text-white">
        Please log in.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* HEADER */}
      <div className="fixed top-0 w-full bg-white dark:bg-gray-800  z-50">
        <div className="flex items-center justify-between px-4 py-3">

          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full "
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-bold flex items-center gap-2">

            Notifications

            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}

          </h1>

          {/* CLEAR BUTTON */}
          <button
            onClick={clearViewedNotifications}
            disabled={clearing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Clear viewed"
          >
            <Trash2
              className={`w-5 h-5 ${
                clearing ? "animate-pulse text-gray-400" : ""
              }`}
            />
          </button>

        </div>
      </div>

      {/* CONTENT */}
      <div className="pt-16 px-4 pb-20 max-w-2xl mx-auto">

        {loading ? (

          <div className="text-center py-20 text-gray-500">
            Loading...
          </div>

        ) : notifications.length ? (

          <div className="bg-white dark:bg-gray-800 rounded-xl divide-y">

            {notifications.map((notif) => (

              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700
                  ${!notif.read && "bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500"}
                `}
              >

                <div className="flex gap-3">

                  {/* AVATAR */}
                  <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                    {notif.senderName?.[0] || "?"}
                  </div>

                  {/* BODY */}
                  <div className="flex-1">

                    <div className="flex justify-between mb-1">

                      <p className="font-semibold truncate">
                        {notif.senderName || notif.senderEmail}
                      </p>

                      <span className="text-xs text-gray-400">
                        {formatTime(notif.timestamp)}
                      </span>

                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {notif.message}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="text-center py-20 text-gray-500">

            <Bell className="mx-auto mb-4" size={40} />

            <p>No notifications yet</p>

          </div>

        )}

      </div>
    </div>
  );
};
