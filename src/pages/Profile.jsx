import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { db } from "../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Nav } from "../Home/Nav";
import { Edit2, Grid, Settings } from "lucide-react";

export const Profile = () => {
    const { user } = useAuth();
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchMyPosts = async () => {
            try {
                const q = query(
                    collection(db, "posts"),
                    where("authorId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const postsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMyPosts(postsData);
            } catch (err) {
                console.error("Error fetching posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPosts();
    }, [user]);

    if (!user) return <div className="text-center mt-20 dark:text-white">Please log in.</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 transition-colors duration-300">
            <Nav />

            <div className="max-w-2xl mx-auto pt-20 px-4">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full p-[3px] mb-4">
                        <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center transition-colors">
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">{user.email.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{user.displayName || user.email.split('@')[0]}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">@{user.email.split('@')[0]}</p>

                    <p className="text-center text-gray-600 dark:text-gray-300 max-w-sm mb-6">
                        Digital creator. Making noise by saying less. 🤫
                    </p>

                    <div className="flex gap-4 w-full justify-center">
                        <button className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2">
                            <Edit2 size={16} /> Edit Profile
                        </button>
                        <button className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex justify-around border-y border-gray-100 dark:border-gray-800 py-4 mb-6 transition-colors">
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 dark:text-white">{myPosts.length}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Posts</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 dark:text-white">1.2k</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Followers</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 dark:text-white">450</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Following</span>
                    </div>
                </div>

                {/* Posts Grid */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-bold border-b border-gray-100 dark:border-gray-800 pb-2 transition-colors">
                        <Grid size={20} /> Posts
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-3 gap-1">
                            {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1">
                            {myPosts.map(post => (
                                <div key={post.id} className="aspect-square bg-gray-100 dark:bg-gray-800 relative group overflow-hidden cursor-pointer transition-colors">
                                    {/* For now just text, but ideally images */}
                                    <div className="p-2 text-[10px] text-gray-500 dark:text-gray-400 h-full overflow-hidden">
                                        {post.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {myPosts.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">No posts yet.</div>
                    )}
                </div>

            </div>
        </div>
    );
};
