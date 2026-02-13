import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { Nav } from "../Home/Nav";
import { Link } from "react-router-dom";
import { MessageCircle, Heart, Share2, MoreHorizontal, Send, Image as ImageIcon } from "lucide-react";

export const Blog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null); // For comments text input focus

  const fetchPosts = async () => {
    setLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(postsData);
    setLoading(false);
  };

  // Real-time online user status
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "status"), (snapshot) => {
      const updatedStatus = {};
      snapshot.forEach((doc) => {
        updatedStatus[doc.id] = doc.data().state === "online";
      });
      setOnlineUsers(updatedStatus);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content) {
      toast.error("Post content is required");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        title: title || "Untitled", // Titles are optional in social feeds
        content,
        authorId: user.uid,
        authorEmail: user.email,
        authorName: user.displayName || user.email.split('@')[0],
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0
      });
      setTitle("");
      setContent("");
      setShowForm(false);
      toast.success("Posted!");
      fetchPosts();
    } catch (err) {
      console.error("Error adding post:", err);
      toast.error("Failed to post");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
      <Nav />

      <div className="max-w-xl mx-auto pt-20 px-0 sm:px-4">

        {/* Create Post Input (Twitter/FB style) */}
        {user && (
          <div className="bg-white dark:bg-gray-800 p-4 sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold shrink-0">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="What's happening?"
                  className="w-full resize-none border-none focus:ring-0 text-lg dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 min-h-[80px] bg-transparent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                  <button className="text-green-600 dark:text-green-400 p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition">
                    <ImageIcon size={20} />
                  </button>
                  <button
                    onClick={handlePostSubmit}
                    disabled={!content.trim()}
                    className="bg-green-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm h-64 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
              </div>
            ))
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white dark:bg-gray-800 sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                {/* Post Header */}
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] rounded-full">
                        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 text-sm overflow-hidden">
                          {post.authorEmail.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${onlineUsers[post.authorId] ? "bg-green-500" : "bg-red-500"}`}></div>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{post.authorName || post.authorEmail.split('@')[0]}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {post.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-2">
                  {post.title && post.title !== "Untitled" && <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{post.title}</h3>}
                  <p className="text-gray-800 dark:text-gray-200 text-[15px] whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 dark:border-gray-700 mt-2 transition-colors">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition group">
                      <Heart size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition">
                      <MessageCircle size={22} />
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-500 transition">
                      <Share2 size={22} />
                    </button>
                  </div>

                  {/* Message Author Button */}
                  {post.authorId !== user?.uid && (
                    <Link
                      to={`/chat/${post.authorId}`}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/40 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 rounded-full text-xs font-bold transition"
                    >
                      <Send size={14} />
                      Message
                    </Link>
                  )}
                </div>

                {/* Likes count (Mock) */}
                <div className="px-4 pb-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">24 likes</p>
                </div>
              </article>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
