import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    getDoc,
} from "firebase/firestore";
import { Nav } from "../Home/Nav";
import { Edit2, Grid, X, User, Mail, Check, LogOut, Camera, Calendar, MessageCircle, Heart, UserPlus, UserMinus } from "lucide-react";
import { toast } from "react-hot-toast";
import { Avatar } from "../_component_/Avatar";
import { Loader } from "../_component_/Loader";

export const Profile = () => {
    const { user: currentUser, logout } = useAuth();
    const { uid } = useParams();
    const navigate = useNavigate();
    
    // If no uid in URL, we're viewing our own profile
    const targetUid = uid || currentUser?.uid;
    const isOwnProfile = !uid || uid === currentUser?.uid;

    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        displayName: "",
        bio: "Digital creator. Making noise by saying less. 🤫",
        photoURL: "",
    });
    const [editForm, setEditForm] = useState({
        displayName: "",
        bio: "Digital creator. Making noise by saying less. 🤫",
        photoURL: "",
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowTransitioning, setIsFollowTransitioning] = useState(false);

    // Photo upload state
    const [photoPreview, setPhotoPreview] = useState(null);   // local blob
    const [photoUploaded, setPhotoUploaded] = useState(null); // Cloudinary URL
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const photoInputRef = useRef(null);

    /* ── Fetch profile & posts ───────────────────────────────────── */
    useEffect(() => {
        if (!currentUser && !uid) return;

        const fetchUserData = async () => {
            if (!targetUid) return;
            try {
                const userDocRef = doc(db, "users", targetUid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const d = userDoc.data();
                    const loaded = {
                        displayName: d.displayName || d.name || "Anonymous User",
                        bio: d.bio || "Digital creator. Making noise by saying less. 🤫",
                        photoURL: d.photoURL || "",
                        email: d.email || "",
                        createdAt: d.createdAt,
                    };
                    setProfileData(loaded);
                    setEditForm(loaded);
                    setProfileExists(true);
                } else if (isOwnProfile && currentUser) {
                    const defaults = {
                        displayName: currentUser.email.split("@")[0],
                        bio: "Digital creator. Making noise by saying less. 🤫",
                        photoURL: "",
                        email: currentUser.email,
                    };
                    setProfileData(defaults);
                    setEditForm(defaults);
                    setProfileExists(false);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };

        const fetchMyPosts = async () => {
            if (!targetUid) return;
            try {
                const q = query(
                    collection(db, "posts"),
                    where("authorId", "==", targetUid)
                );
                const snapshot = await getDocs(q);
                setMyPosts(
                    snapshot.docs
                        .map((d) => ({ id: d.id, ...d.data() }))
                        .sort((a, b) => {
                            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                            return timeB - timeA;
                        })
                );
            } catch (err) {
                console.error("Error fetching posts:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchFollowStats = async () => {
            if (!targetUid) return;
            try {
                // Followers count
                const followersQ = query(
                    collection(db, "follows"),
                    where("followingId", "==", targetUid)
                );
                const followersSnap = await getDocs(followersQ);
                setFollowersCount(followersSnap.size);

                // Following count
                const followingQ = query(
                    collection(db, "follows"),
                    where("followerId", "==", targetUid)
                );
                const followingSnap = await getDocs(followingQ);
                setFollowingCount(followingSnap.size);

                // Check if current user is following this profile
                if (currentUser && !isOwnProfile) {
                    const followDocRef = doc(db, "follows", `${currentUser.uid}_${targetUid}`);
                    const followDoc = await getDoc(followDocRef);
                    setIsFollowing(followDoc.exists());
                }
            } catch (err) {
                console.error("Error fetching follow stats:", err);
            }
        };

        fetchUserData();
        fetchMyPosts();
        fetchFollowStats();
    }, [targetUid, currentUser, isOwnProfile]);

    /* ── Follow / Unfollow ───────────────────────────────────────── */
    const handleFollow = async () => {
        if (!currentUser || isFollowTransitioning) return;
        if (isOwnProfile) return;

        setIsFollowTransitioning(true);
        const followDocId = `${currentUser.uid}_${targetUid}`;
        const followDocRef = doc(db, "follows", followDocId);

        try {
            if (isFollowing) {
                // Unfollow
                const { deleteDoc } = await import("firebase/firestore");
                await deleteDoc(followDocRef);
                setIsFollowing(false);
                setFollowersCount((prev) => Math.max(0, prev - 1));
                toast.success("Unfollowed");
            } else {
                // Follow
                await setDoc(followDocRef, {
                    followerId: currentUser.uid,
                    followingId: targetUid,
                    createdAt: new Date(),
                });
                setIsFollowing(true);
                setFollowersCount((prev) => prev + 1);
                toast.success("Following");
            }
        } catch (err) {
            console.error("Error toggling follow:", err);
            toast.error("Failed to update follow status");
        } finally {
            setIsFollowTransitioning(false);
        }
    };

    /* ── Photo selection & upload ────────────────────────────────── */
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Photo must be less than 5 MB");
            return;
        }
        setPhotoPreview(URL.createObjectURL(file));
        uploadPhoto(file);
    };

    const uploadPhoto = async (file) => {
        setIsUploadingPhoto(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "social_app_uploads");

        try {
            const res = await fetch(
                "https://api.cloudinary.com/v1_1/dc5mukmoh/image/upload",
                { method: "POST", body: formData }
            );
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            setPhotoUploaded(data.secure_url);
            setEditForm((prev) => ({ ...prev, photoURL: data.secure_url }));
            toast.success("Photo ready!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload photo");
            cancelPhoto();
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const cancelPhoto = () => {
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
        setPhotoUploaded(null);
        setEditForm((prev) => ({ ...prev, photoURL: profileData.photoURL }));
        if (photoInputRef.current) photoInputRef.current.value = "";
    };

    /* ── Edit / Save ─────────────────────────────────────────────── */
    const handleEditProfile = () => {
        if (!isOwnProfile) return;
        setEditForm(profileData);
        setPhotoPreview(null);
        setPhotoUploaded(null);
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async () => {
        if (!currentUser) return;
        if (isUploadingPhoto) {
            toast.error("Please wait for the photo to finish uploading");
            return;
        }

        setIsUpdating(true);
        try {
            const userRef = doc(db, "users", currentUser.uid);
            const profileInfo = {
                displayName: editForm.displayName,
                bio: editForm.bio,
                photoURL: editForm.photoURL || profileData.photoURL || "",
                email: currentUser.email,
                uid: currentUser.uid,
                updatedAt: new Date(),
            };

            await setDoc(
                userRef,
                profileExists
                    ? profileInfo
                    : { ...profileInfo, createdAt: new Date() },
                { merge: true }
            );

            setProfileData({ ...profileInfo });
            setProfileExists(true);
            setIsEditModalOpen(false);
            setPhotoPreview(null);
            setPhotoUploaded(null);
            toast.success("Profile updated!");
        } catch (err) {
            console.error("Error saving profile:", err);
            toast.error("Failed to save profile");
        } finally {
            setIsUpdating(false);
        }
    };

    if (!currentUser && !uid)
        return (
            <div className="text-center mt-20 dark:text-white">Please log in.</div>
        );

    /* ── Render ──────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-black pb-20">
            <Nav />

            <div className="max-w-2xl mx-auto pt-20 px-4 relative">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    {/* Avatar with camera overlay (only for owner) */}
                    <div
                        className={`relative mb-6 ${isOwnProfile ? "cursor-pointer group" : ""}`}
                        onClick={isOwnProfile ? handleEditProfile : undefined}
                    >
                        <div className="w-32 h-32 rounded-full ring-4 ring-green-600/30 p-1 overflow-hidden transition-transform duration-500 hover:rotate-6">
                            <Avatar
                                src={profileData.photoURL}
                                name={profileData.displayName || profileData.email}
                                size="w-32 h-32"
                                textSize="text-5xl"
                            />
                        </div>
                        {isOwnProfile && (
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <Camera size={28} className="text-white animate-bounce" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
                        {profileData.displayName}
                    </h1>
                    <p className="text-green-500 font-mono text-sm mb-4">
                        {profileData.email ? `@${profileData.email.split("@")[0]}` : ""}
                    </p>

                    <div className="flex items-center gap-2 mb-6">
                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                           <Calendar size={12} className="text-white/40" />
                           <span className="text-[10px] text-white/50 uppercase tracking-tighter font-bold">
                             Member Since {profileData.createdAt ? (profileData.createdAt.toDate ? profileData.createdAt.toDate() : (profileData.createdAt instanceof Date ? profileData.createdAt : new Date(profileData.createdAt))).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "October 2023"}
                           </span>
                        </div>
                    </div>

                    <p className="text-center text-white/70 max-w-sm mb-8 leading-relaxed italic px-4">
                        "{profileData.bio}"
                    </p>

                    <div className="flex gap-3 w-full justify-center">
                        {isOwnProfile ? (
                            <div className="flex gap-2 w-full max-w-sm justify-center">
                                <button
                                    onClick={handleEditProfile}
                                    className={`${!profileExists
                                            ? "bg-green-600 hover:bg-green-700 text-white flex-1"
                                            : "bg-white/10 text-white/80 hover:bg-white/20 flex-1"
                                        } px-10 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 backdrop-blur-xl group shadow-2xl shadow-black/40 active:scale-95`}
                                >
                                    {!profileExists ? <Check size={20} className="group-hover:rotate-12 transition-transform" /> : <Edit2 size={20} className="group-hover:rotate-12 transition-transform" />}
                                    {!profileExists ? "Complete Profile" : "Edit Profile"}
                                </button>
                                <button
                                    onClick={logout}
                                    className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/10 transition-all active:scale-95 group"
                                    title="Logout"
                                >
                                    <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3 w-full max-w-sm">
                                <button
                                    onClick={handleFollow}
                                    disabled={isFollowTransitioning}
                                    className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 backdrop-blur-xl shadow-2xl active:scale-95 group ${
                                        isFollowing
                                            ? "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10"
                                            : "bg-green-600 hover:bg-green-500 text-white shadow-green-900/40"
                                    }`}
                                >
                                    {isFollowTransitioning ? (
                                        <Loader size="xs" showLabel={false} />
                                    ) : isFollowing ? (
                                        <>
                                            <UserMinus size={20} className="group-hover:scale-110 transition-transform" />
                                            Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                                            Follow
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => navigate(`/chat/${targetUid}`)}
                                    className="px-6 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-2xl transition-all shadow-2xl active:scale-95 group"
                                    title="Message"
                                >
                                    <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-8 mb-8 bg-white/[0.02] rounded-3xl px-4">
                    <div className="text-center border-r border-white/5">
                        <span className="block text-2xl font-black text-white">
                            {myPosts.length}
                        </span>
                        <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                            Posts
                        </span>
                    </div>
                    <div className="text-center border-r border-white/5">
                        <span className="block text-2xl font-black text-white">
                            {followersCount}
                        </span>
                        <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                            Followers
                        </span>
                    </div>
                    <div className="text-center">
                        <span className="block text-2xl font-black text-white">
                            {followingCount}
                        </span>
                        <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                            Following
                        </span>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="px-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-white font-black uppercase text-xs tracking-widest translate-y-1">
                            <Grid size={16} /> Posts
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="aspect-square bg-white/5 animate-pulse rounded-2xl"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {myPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="aspect-square bg-white/5 relative group overflow-hidden cursor-pointer rounded-2xl border border-white/5"
                                >
                                    {post.imageUrl ? (
                                        <img
                                            src={post.imageUrl}
                                            alt="Post"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="p-4 text-[11px] text-white/40 h-full overflow-hidden italic leading-relaxed">
                                            {post.content}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                       <Heart size={20} className="text-white fill-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {myPosts.length === 0 && !loading && (
                        <div className="bg-white/5 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-6 border border-white/5 border-dashed">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                               <Grid size={24} className="text-white/20" />
                            </div>
                            <p className="text-white/40 text-sm font-medium">No posts shared yet.</p>
                        </div>
                    )}
                </div>

                {/* Edit Profile Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <div className="bg-[#121212] rounded-[2.5rem] w-full max-w-md p-8 border border-white/10 shadow-2xl overflow-hidden relative">
                            {/* Decorative background */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />

                            <div className="flex justify-between items-center mb-8 relative">
                                <h2 className="text-2xl font-black text-white tracking-tight">
                                    Edit Profile
                                </h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6 relative">
                                {/* Photo upload */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        {/* Preview layer */}
                                        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-green-600/30 p-1">
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <Avatar
                                                    src={editForm.photoURL}
                                                    name={editForm.displayName || currentUser.email}
                                                    size="w-24 h-24"
                                                    textSize="text-3xl"
                                                />
                                            )}
                                        </div>
                                        {/* Uploading spinner */}
                                        {isUploadingPhoto && (
                                            <div className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                <Loader size="xs" showLabel={false} />
                                            </div>
                                        )}
                                        {/* Ready tick */}
                                        {photoUploaded && !isUploadingPhoto && (
                                            <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center border-2 border-[#121212] shadow-lg">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        ref={photoInputRef}
                                        onChange={handlePhotoSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => photoInputRef.current.click()}
                                            disabled={isUploadingPhoto}
                                            className="flex items-center gap-2 px-6 py-2 bg-white/5 text-white/80 rounded-full text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50 border border-white/5"
                                        >
                                            <Camera size={14} />
                                            {isUploadingPhoto ? "Uploading…" : "Change Photo"}
                                        </button>
                                        {photoPreview && !isUploadingPhoto && (
                                            <button
                                                type="button"
                                                onClick={cancelPhoto}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all border border-red-500/10"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Display name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                                        Display Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                        <input
                                            type="text"
                                            value={editForm.displayName}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, displayName: e.target.value })
                                            }
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600/50 text-white placeholder:text-white/20 transition-all font-medium"
                                            placeholder="Your name"
                                        />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                                        Bio
                                    </label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, bio: e.target.value })
                                        }
                                        className="w-full px-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600/50 text-white placeholder:text-white/20 transition-all resize-none min-h-[100px] font-medium"
                                        placeholder="Share a bit about yourself"
                                        maxLength={150}
                                    />
                                    <div className="flex justify-end">
                                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                          {editForm.bio.length} / 150
                                      </span>
                                    </div>
                                </div>

                                {/* Email (read-only) */}
                                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex items-center gap-3 opacity-60">
                                    <Mail size={18} className="text-white/30" />
                                    <span className="text-sm font-medium text-white/40">{currentUser.email}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10 relative">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={
                                        isUpdating ||
                                        isUploadingPhoto ||
                                        !editForm.displayName.trim()
                                    }
                                    className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-green-900/20 active:scale-95"
                                >
                                    {isUpdating ? (
                                        <Loader size="xs" showLabel={false} />
                                    ) : profileExists ? (
                                        "Save Changes"
                                    ) : (
                                        "Create Profile"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
