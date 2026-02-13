import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  limit,
  getFirestore,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { Bell } from "lucide-react";

const firestore = getFirestore();

/**
 * Fetch notifications for current authenticated user
 */
async function fetchNotifications() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("No user is logged in.");
      return [];
    }

    // Reference to the notifications collection
    const notificationsRef = collection(firestore, "notifications");

    // Create a query: only for this user, ordered by newest first
    const q = query(
      notificationsRef,
      where("userId", "==", user.uid),
      where("read", "==", false), // Only fetch unread for badge
      orderBy("timestamp", "desc"),
      limit(10)
    );

    // Fetch the documents
    const snapshot = await getDocs(q);

    // Map the documents into a usable array
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return notifications;

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for unread count only
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", user.uid),
      where("read", "==", false),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUnreadCount(notifs.length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400`}
      aria-label={`Notifications ${unreadCount > 0 ? unreadCount + ' unread' : ''}`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};
