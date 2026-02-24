import React, { useState, useEffect, useRef } from "react";
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
import { Avatar } from "../_component_/Avatar";

export const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [senderProfiles, setSenderProfiles] = useState({}); // senderId -> { photoURL }

  /* ---------------- SWIPE STATE ---------------- */
  const [swipeId, setSwipeId] = useState(null);
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef(0);

  /* ---------------- MARK ALL AS READ ---------------- */
  const markAllAsRead = async (notifs) => {
    const unread = notifs.filter((n) => !n.read);
    if (!unread.length) return;

    await Promise.all(
      unread.map((n) =>
        updateDoc(doc(db, "notifications", n.id), { read: true })
      )
    );
  };

  /* ---------------- CASCADE CLEAR READ ---------------- */
  const clearViewedNotifications = async () => {
    if (!user) return;

    setClearing(true);

    const readNotifs = notifications.filter((n) => n.read);

    for (let i = 0; i < readNotifs.length; i++) {
      await new Promise((r) => setTimeout(r, 120));
      await deleteDoc(doc(db, "notifications", readNotifs[i].id));
    }

    setClearing(false);
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
      setUnreadCount(notifs.filter((n) => !n.read).length);
      setLoading(false);

      // Fetch profile photos for all senders we haven't loaded yet
      const senderIds = [...new Set(notifs.map((n) => n.senderId).filter(Boolean))];
      setSenderProfiles((prev) => {
        const missing = senderIds.filter((id) => !prev[id]);
        if (missing.length === 0) return prev;
        Promise.all(
          missing.map((id) =>
            getDocs(query(collection(db, "users"), where("uid", "==", id))).then(
              (snap) => {
                if (!snap.empty) return { id, data: snap.docs[0].data() };
                // Fallback: try direct doc lookup
                return import("firebase/firestore").then(({ getDoc, doc: fdoc }) =>
                  getDoc(fdoc(db, "users", id)).then((d) => ({ id, data: d.data() }))
                );
              }
            )
          )
        ).then((results) => {
          const patch = {};
          results.forEach(({ id, data }) => {
            patch[id] = { photoURL: data?.photoURL || "" };
          });
          setSenderProfiles((p) => ({ ...p, ...patch }));
        });
        return prev;
      });

      await markAllAsRead(notifs);
    });

    return () => unsub();
  }, [user]);

  /* ---------------- SWIPE HANDLERS ---------------- */
  const handleTouchStart = (e, id) => {
    startX.current = e.touches[0].clientX;
    setSwipeId(id);
  };

  const handleTouchMove = (e) => {
    if (!swipeId) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    if (diff < 0) setSwipeX(diff);
  };

  const handleTouchEnd = async (notif) => {
    if (!swipeId) return;

    if (Math.abs(swipeX) > 120) {
      await deleteDoc(doc(db, "notifications", notif.id));
    }

    setSwipeId(null);
    setSwipeX(0);
  };

  /* ---------------- CLICK HANDLER ---------------- */
  const handleNotificationClick = (notif) => {
    if (notif.type === "message") {
      navigate(`/chat/${notif.senderId}`);
    }
  };

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
    return <div className="text-center mt-20">Please log in.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HEADER */}
      <div className="fixed top-0 w-full bg-white dark:bg-gray-800 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
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

          <button
            onClick={clearViewedNotifications}
            disabled={clearing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <Trash2
              className={`w-5 h-5 ${clearing ? "animate-pulse text-gray-400" : ""
                }`}
            />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="pt-16 px-4 pb-20 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : notifications.length ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl divide-y">
            {notifications.map((notif) => (
              <div key={notif.id} className="relative overflow-hidden">
                {/* DELETE BACKGROUND */}
                <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 text-white font-semibold">
                  Delete
                </div>

                {/* SWIPE CARD */}
                <div
                  onTouchStart={(e) =>
                    handleTouchStart(e, notif.id)
                  }
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() =>
                    handleTouchEnd(notif)
                  }
                  onClick={() =>
                    handleNotificationClick(notif)
                  }
                  style={{
                    transform:
                      swipeId === notif.id
                        ? `translateX(${swipeX}px)`
                        : "translateX(0)",
                    transition:
                      swipeId === notif.id
                        ? "none"
                        : "transform 0.25s ease",
                  }}
                  className={`relative p-4 bg-white dark:bg-gray-800 cursor-pointer select-none
                  ${!notif.read &&
                    "bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500"}
                  `}
                >
                  <div className="flex gap-3">
                    <Avatar
                      src={senderProfiles[notif.senderId]?.photoURL}
                      name={notif.senderName || notif.senderEmail}
                      size="w-10 h-10"
                      textSize="text-base"
                    />

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
