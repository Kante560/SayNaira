import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { Nav } from "../Home/Nav";
import { MessageCircle, Search, Plus } from "lucide-react";

export const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetch all users for the user directory (and stories/status style list)
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = {};
      usersSnapshot.forEach((doc) => {
        usersData[doc.id] = doc.data();
      });
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (!userSearchQuery.trim()) {
      setFilteredUsers([]);
      return;
    }

    const filtered = Object.entries(users)
      .filter(([uid, u]) => uid !== user?.uid)
      .filter(([uid, u]) => {
        const name = (u.name || u.displayName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const query = userSearchQuery.toLowerCase();
        return name.includes(query) || email.includes(query);
      })
      .map(([uid, u]) => ({ uid, ...u }));

    setFilteredUsers(filtered);
  }, [userSearchQuery, users, user]);

  // Listen to online status
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "status"), (snapshot) => {
      const status = {};
      snapshot.forEach((doc) => {
        status[doc.id] = doc.data().state === "online";
      });
      setOnlineUsers(status);
    });
    return () => unsubscribe();
  }, []);

  // Listen to all chats involving current user
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      const chatsData = [];

      for (const chatDoc of snapshot.docs) {
        const chatId = chatDoc.id;
        const [userId1, userId2] = chatId.split("_");

        // Only include chats where current user is participant
        if (userId1 === user.uid || userId2 === user.uid) {
          const otherUserId = userId1 === user.uid ? userId2 : userId1;

          // Get last message
          const messagesRef = collection(db, "chats", chatId, "messages");
          const q = query(messagesRef, orderBy("timestamp", "desc"));
          const messagesSnapshot = await getDocs(q);

          const lastMessageDoc = messagesSnapshot.docs[0]?.data();
          let lastMessageText = "No messages yet";

          if (lastMessageDoc) {
            if (lastMessageDoc.type === "sticker") {
              lastMessageText = "🎨 Sticker";
            } else if (lastMessageDoc.type === "voice") {
              lastMessageText = "🎤 Voice note";
            } else {
              lastMessageText = lastMessageDoc.text || "";
            }
          }

          const unreadCount = messagesSnapshot.docs.filter(
            (doc) => doc.data().receiverId === user.uid && !doc.data().read
          ).length;

          // Get other user info (fallback if not in users state yet)
          let otherUserData = users[otherUserId];

          chatsData.push({
            chatId,
            otherUserId,
            otherUserName: otherUserData?.name || otherUserData?.displayName || "User",
            otherUserEmail: otherUserData?.email || "",
            lastMessage: lastMessageText,
            timestamp: lastMessageDoc?.timestamp,
            unreadCount,
          });
        }
      }

      // Sort by timestamp
      chatsData.sort((a, b) => {
        const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });

      setConversations(chatsData);
    });

    return () => unsubscribe();
  }, [user, users]);

  const filteredConversations = conversations.filter((conv) => {
    const hay = (conv.otherUserName || conv.otherUserEmail || "").toLowerCase();
    return hay.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
      <Nav />
      <div className="max-w-3xl mx-auto pt-20 px-4">

        {/* Header Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
          <button
            onClick={() => setShowUserSearch(true)}
            className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-green-500 outline-none placeholder-gray-400 dark:placeholder-gray-500 font-medium text-gray-900 dark:text-gray-100 transition-colors"
          />
        </div>

        {/* Online / Stories (Horizontal Scroll) */}
        {/* <div className="mb-8 overflow-x-auto no-scrollbar">
          <div className="flex space-x-4 min-w-max p-1">
            {/* My Story (Placeholder) */}
          {/*  <div className="flex flex-col items-center space-y-1 cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Your Story</span>
            </div> */}

            {/* Online Users */}
            {/* {Object.entries(users).map(([uid, u]) => {
              if (uid === user?.uid) return null;
              const isOnline = onlineUsers[uid];

              return (
                <div
                  key={uid}
                  onClick={() => navigate(`/chat/${uid}`)}
                  className="flex flex-col items-center space-y-1 cursor-pointer"
                >
                  <div className={`relative p-[2px] rounded-full ${isOnline ? "bg-gradient-to-tr from-green-400 to-emerald-600" : "bg-gray-300 dark:bg-gray-700"}`}>
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 flex items-center justify-center overflow-hidden transition-colors">
                      <span className="text-xl font-bold text-gray-700 dark:text-gray-200">{(u.name || u.email || "?").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 border-2 border-white dark:border-gray-800 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[64px] truncate">{u.name || "User"}</span>
                </div>
              );
            })} 
          </div>
        </div> */}

        {/* Conversations List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.chatId}
                onClick={() => navigate(`/chat/${conv.otherUserId}`)}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition border-b border-gray-50 dark:border-gray-700 last:border-none"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xl transition-colors">
                    {(conv.otherUserName).charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-gray-800 rounded-full ${onlineUsers[conv.otherUserId] ? "bg-green-500" : "bg-red-500"}`}></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-[15px]">
                      {conv.otherUserName || conv.otherUserEmail}
                    </h4>
                    {conv.timestamp && (
                      <span className={`text-xs ${conv.unreadCount > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-gray-400 dark:text-gray-500"}`}>
                        {new Date(conv.timestamp.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? "text-gray-900 dark:text-white font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 transition-colors">
                <MessageCircle className="w-8 h-8 text-gray-300 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-6">Connect with people on the feed to start a conversation.</p>
              <button
                onClick={() => navigate('/blog')}
                className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
              >
                Explore Feed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md mx-4 rounded-2xl shadow-xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Search Users</h2>
              <button
                onClick={() => {
                  setShowUserSearch(false);
                  setUserSearchQuery("");
                  setFilteredUsers([]);
                }}
                className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Plus size={18} className="rotate-45 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 pl-10 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-green-500 outline-none placeholder-gray-400 dark:placeholder-gray-500 font-medium text-gray-900 dark:text-gray-100 transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {userSearchQuery.trim() && filteredUsers.length > 0 ? (
                <div className="p-2">
                  {filteredUsers.map((user) => {
                    const isOnline = onlineUsers[user.uid];
                    return (
                      <div
                        key={user.uid}
                        onClick={() => {
                          navigate(`/chat/${user.uid}`);
                          setShowUserSearch(false);
                          setUserSearchQuery("");
                          setFilteredUsers([]);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition"
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${isOnline ? "from-green-400 to-emerald-600" : "from-gray-400 to-gray-600"} p-[2px]`}>
                            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 text-sm">
                              {(user.name || user.displayName || user.email || "?").charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.name || user.displayName || "User"}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>

                        {/* Online Status */}
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : userSearchQuery.trim() ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Search for users</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Type to search by name or email</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
