import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-hot-toast";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Avatar } from "../_component_/Avatar";

export const CreatePost = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        if (!user) return;
        getDoc(doc(db, "users", user.uid)).then((d) => {
            if (d.exists()) setUserProfile(d.data());
        });
    }, [user]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "posts"), {
                content,
                authorId: user.uid,
                authorEmail: user.email,
                authorName: user.displayName || user.email.split('@')[0],
                createdAt: serverTimestamp(),
                likes: 0,
                comments: 0
            });
            toast.success("Posted!");
            navigate('/blog');
        } catch (err) {
            console.error("Error adding post:", err);
            toast.error("Failed to post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors">
                <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition">
                    <ArrowLeft size={24} />
                </button>
                <span className="font-bold text-lg text-gray-900 dark:text-white">New Post</span>
                <button
                    onClick={handlePostSubmit}
                    disabled={!content.trim() || loading}
                    className="text-green-600 dark:text-green-400 font-bold disabled:opacity-50 hover:bg-green-50 dark:hover:bg-green-900/20 px-4 py-1 rounded-full transition"
                >
                    {loading ? "..." : "Post"}
                </button>
            </div>

            <div className="p-4">
                <div className="flex gap-3">
                    <Avatar
                        src={userProfile?.photoURL}
                        name={user?.displayName || user?.email}
                        size="w-10 h-10"
                        textSize="text-base"
                    />
                    <textarea
                        autoFocus
                        placeholder="What's happening?"
                        className="w-full resize-none border-none text-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 min-h-[200px] bg-transparent focus:outline-none transition-all duration-200 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
            </div>

            <div className="fixed bottom-0 w-full border-t border-gray-100 dark:border-gray-800 p-4 pb-safe flex items-center gap-4 text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 transition-colors">
                {/* <button className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                    <ImageIcon size={24} />
                </button> */}
            </div>
        </div>
    );
};
