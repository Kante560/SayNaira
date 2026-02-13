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
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { Nav } from "../Home/Nav";
import { Link } from "react-router-dom";
import { MessageCircle, Heart, Share2, MoreHorizontal, Send, Image as ImageIcon, Copy } from "lucide-react";

export const Blog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null); // For comments text input focus
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [showShareOptions, setShowShareOptions] = useState({});

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

  // Real-time posts listener
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
      toast.error("Failed to load posts");
    });
    return unsubscribe;
  }, []);

  // Real-time comments listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "comments"), (snapshot) => {
      const commentsData = {};
      snapshot.forEach((doc) => {
        const commentData = doc.data();
        const postId = commentData.postId;
        if (!commentsData[postId]) {
          commentsData[postId] = [];
        }
        commentsData[postId].push({
          id: doc.id,
          ...commentData,
        });
      });
      
      // Sort comments by timestamp for each post
      Object.keys(commentsData).forEach(postId => {
        commentsData[postId].sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt;
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt;
          return timeA - timeB;
        });
      });
      
      setComments(commentsData);
    });
    return unsubscribe;
  }, []);

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

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.share-dropdown')) {
        setShowShareOptions({});
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
        likes: [], // Array of user IDs who liked the post
        comments: 0
      });
      setTitle("");
      setContent("");
      setShowForm(false);
      toast.success("Posted!");
    } catch (err) {
      console.error("Error adding post:", err);
      toast.error("Failed to post");
    }
  };

  // Handle like/unlike functionality
  const handleLike = async (postId, currentLikes) => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    const postRef = doc(db, "posts", postId);
    const hasLiked = currentLikes && currentLikes.includes(user.uid);

    try {
      if (hasLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid)
        });
        toast.success("Post unliked");
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid)
        });
        toast.success("Post liked!");
      }
    } catch (err) {
      console.error("Error updating like:", err);
      toast.error("Failed to update like");
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (postId) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    try {
      await addDoc(collection(db, "comments"), {
        postId: postId,
        text: commentText,
        authorId: user.uid,
        authorEmail: user.email,
        authorName: user.displayName || user.email.split('@')[0],
        createdAt: serverTimestamp(),
      });

      // Update post comment count
      await updateDoc(doc(db, "posts", postId), {
        comments: (comments[postId]?.length || 0) + 1
      });

      // Clear comment input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ""
      }));

      toast.success("Comment added!");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment");
    }
  };

  // Toggle comments visibility
  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Toggle share options
  const toggleShareOptions = (postId) => {
    setShowShareOptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = (post) => {
    const postText = post.title && post.title !== "Untitled" 
      ? `${post.title}\n\n${post.content}`
      : post.content;
    
    // Truncate very long posts for WhatsApp
    const maxLength = 1000;
    const truncatedText = postText.length > maxLength 
      ? postText.substring(0, maxLength) + "...\n\n[Read more on SayNaira App]"
      : postText;
    
    const shareMessage = `📝 *${post.authorName || post.authorEmail.split('@')[0]} posted:*\n\n${truncatedText}\n\n🔗 *Shared from SayLess App*`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    
    window.open(shareUrl, '_blank');
    toast.success("Opening WhatsApp to share post");
  };

  // Handle copy link
  const handleCopyLink = async (post) => {
    const postUrl = `${window.location.origin}/blog#${post.id}`;
    
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success("Link copied to clipboard!");
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
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center">
              <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to share something!</p>
            </div>
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
                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
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
                    <button 
                      onClick={() => handleLike(post.id, post.likes || [])}
                      className={`flex items-center gap-2 transition group ${
                        (post.likes || []).includes(user?.uid) 
                          ? "text-red-500 dark:text-red-400" 
                          : "text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      }`}
                    >
                      <Heart 
                        size={22} 
                        className={`group-hover:scale-110 transition-transform ${
                          (post.likes || []).includes(user?.uid) ? "fill-current" : ""
                        }`} 
                      />
                      <span className="text-sm font-medium">
                        {post.likes?.length || 0}
                      </span>
                    </button>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
                    >
                      <MessageCircle size={22} />
                      <span className="text-sm font-medium">{comments[post.id]?.length || 0}</span>
                    </button>
                    
                    {/* Share Button with Dropdown */}
                    <div className="relative share-dropdown">
                      <button 
                        onClick={() => toggleShareOptions(post.id)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-500 transition"
                      >
                        <Share2 size={22} />
                      </button>
                      
                      {/* Share Options Dropdown */}
                      {showShareOptions[post.id] && (
                        <div className="absolute bottom-8 left-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 text-sm space-y-1 z-50 border border-gray-200 dark:border-gray-700 min-w-[150px]">
                          <button
                            onClick={() => {
                              handleWhatsAppShare(post);
                              toggleShareOptions(post.id);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <span className="text-green-500">📱</span>
                            <span className="text-gray-700 dark:text-gray-200">WhatsApp</span>
                          </button>
                          <button
                            onClick={() => {
                              handleCopyLink(post);
                              toggleShareOptions(post.id);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Copy size={16} className="text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-200">Copy Link</span>
                          </button>
                        </div>
                      )}
                    </div>
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

                {/* Likes count */}
                <div className="px-4 pb-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {post.likes?.length || 0} {post.likes?.length === 1 ? "like" : "likes"}
                  </p>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    {/* Comments List */}
                    <div className="px-4 py-3 space-y-3 max-h-64 overflow-y-auto">
                      {comments[post.id]?.length > 0 ? (
                        comments[post.id].map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0 text-sm">
                              {comment.authorEmail.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-sm text-gray-900 dark:text-white">
                                  {comment.authorName || comment.authorEmail.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : new Date().toLocaleString()}
                                </p>
                              </div>
                              <p className="text-gray-800 dark:text-gray-200 text-sm">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>

                    {/* Comment Input */}
                    {user && (
                      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold shrink-0 text-sm">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={commentInputs[post.id] || ""}
                              onChange={(e) => setCommentInputs(prev => ({
                                ...prev,
                                [post.id]: e.target.value
                              }))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleCommentSubmit(post.id);
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                            <button
                              onClick={() => handleCommentSubmit(post.id)}
                              disabled={!commentInputs[post.id]?.trim()}
                              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
