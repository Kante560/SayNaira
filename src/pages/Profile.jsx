import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { db } from "../../firebase";
import { collection, query, where, getDocs, orderBy, doc, setDoc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Nav } from "../Home/Nav";
import { Edit2, Grid, Settings, X, User, Mail, Check, LogOut } from "lucide-react";

export const Profile = () => {
    const { user } = useAuth();
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        displayName: '',
        bio: 'Digital creator. Making noise by saying less. 🤫'
    });
    const [editForm, setEditForm] = useState({
        displayName: '',
        bio: 'Digital creator. Making noise by saying less. 🤫'
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [profileExists, setProfileExists] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchUserData = async () => {
            try {
                // Check if user profile exists
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setProfileData({
                        displayName: userData.displayName || userData.name || '',
                        bio: userData.bio || 'Digital creator. Making noise by saying less. 🤫'
                    });
                    setProfileExists(true);
                } else {
                    // Profile doesn't exist, use defaults
                    setProfileData({
                        displayName: user.email.split('@')[0],
                        bio: 'Digital creator. Making noise by saying less. 🤫'
                    });
                    setProfileExists(false);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setProfileData({
                    displayName: user.email.split('@')[0],
                    bio: 'Digital creator. Making noise by saying less. 🤫'
                });
            }
        };

        const fetchMyPosts = async () => {
            try {
                // Remove orderBy to avoid index requirement for now
                const q = query(
                    collection(db, "posts"),
                    where("authorId", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                const postsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
                setMyPosts(postsData);
            } catch (err) {
                console.error("Error fetching posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchMyPosts();
    }, [user]);

    const handleEditProfile = () => {
        setEditForm(profileData);
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        
        setIsUpdating(true);
        try {
            const userRef = doc(db, "users", user.uid);
            const profileInfo = {
                displayName: editForm.displayName,
                bio: editForm.bio,
                email: user.email,
                uid: user.uid,
                updatedAt: new Date()
            };
            
            if (profileExists) {
                // Update existing profile
                await setDoc(userRef, profileInfo, { merge: true });
            } else {
                // Create new profile
                await setDoc(userRef, {
                    ...profileInfo,
                    createdAt: new Date()
                });
                setProfileExists(true);
            }
            
            setProfileData(editForm);
            setIsEditModalOpen(false);
            console.log("Profile saved successfully");
        } catch (err) {
            console.error("Error saving profile:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Redirect will be handled by AuthContext
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

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

                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{profileData.displayName}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">@{user.email.split('@')[0]}</p>

                    <p className="text-center text-gray-600 dark:text-gray-300 max-w-sm mb-6">
                        {profileData.bio}
                    </p>

                    <div className="flex gap-4 w-full justify-center">
                        <button 
                            onClick={handleEditProfile}
                            className={`${!profileExists ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'} px-6 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2`}
                        >
                            {!profileExists ? <Check size={16} /> : <Edit2 size={16} />}
                            {!profileExists ? 'Complete Profile' : 'Edit Profile'}
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center border-y border-gray-100 dark:border-gray-800 py-4 mb-6 transition-colors">
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 dark:text-white">{myPosts.length}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Posts</span>
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

                {/* Edit Profile Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <User size={16} className="inline mr-2" />
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.displayName}
                                        onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-colors"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-colors resize-none"
                                        rows={3}
                                        placeholder="Tell us about yourself"
                                        maxLength={150}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {editForm.bio.length}/150 characters
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        <Mail size={16} className="inline mr-2" />
                                        Email: {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isUpdating || !editForm.displayName.trim()}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isUpdating ? 'Saving...' : (profileExists ? 'Update Profile' : 'Create Profile')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
