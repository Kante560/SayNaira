import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Context/AuthContext";
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
import { Edit2, Grid, X, User, Mail, Check, LogOut, Camera } from "lucide-react";
import { toast } from "react-hot-toast";
import { Avatar } from "../_component_/Avatar";

export const Profile = () => {
    const { user } = useAuth();
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

    // Photo upload state
    const [photoPreview, setPhotoPreview] = useState(null);   // local blob
    const [photoUploaded, setPhotoUploaded] = useState(null); // Cloudinary URL
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const photoInputRef = useRef(null);

    /* ── Fetch profile & posts ───────────────────────────────────── */
    useEffect(() => {
        if (!user) return;

        const fetchUserData = async () => {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const d = userDoc.data();
                    const loaded = {
                        displayName: d.displayName || d.name || "",
                        bio: d.bio || "Digital creator. Making noise by saying less. 🤫",
                        photoURL: d.photoURL || "",
                    };
                    setProfileData(loaded);
                    setEditForm(loaded);
                    setProfileExists(true);
                } else {
                    const defaults = {
                        displayName: user.email.split("@")[0],
                        bio: "Digital creator. Making noise by saying less. 🤫",
                        photoURL: "",
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
            try {
                const q = query(
                    collection(db, "posts"),
                    where("authorId", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                setMyPosts(
                    snapshot.docs
                        .map((d) => ({ id: d.id, ...d.data() }))
                        .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
                );
            } catch (err) {
                console.error("Error fetching posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchMyPosts();
    }, [user]);

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
        setEditForm(profileData);
        setPhotoPreview(null);
        setPhotoUploaded(null);
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        if (isUploadingPhoto) {
            toast.error("Please wait for the photo to finish uploading");
            return;
        }

        setIsUpdating(true);
        try {
            const userRef = doc(db, "users", user.uid);
            const profileInfo = {
                displayName: editForm.displayName,
                bio: editForm.bio,
                photoURL: editForm.photoURL || profileData.photoURL || "",
                email: user.email,
                uid: user.uid,
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

    if (!user)
        return (
            <div className="text-center mt-20 dark:text-white">Please log in.</div>
        );

    /* ── Render ──────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 transition-colors duration-300">
            <Nav />

            <div className="max-w-2xl mx-auto pt-20 px-4">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    {/* Avatar with camera overlay */}
                    <div
                        className="relative mb-4 cursor-pointer group"
                        onClick={handleEditProfile}
                        title="Edit profile"
                    >
                        <div className="w-24 h-24 rounded-full ring-4 ring-green-500 overflow-hidden">
                            <Avatar
                                src={profileData.photoURL}
                                name={profileData.displayName || user.email}
                                size="w-24 h-24"
                                textSize="text-3xl"
                            />
                        </div>
                        {/* Camera hover overlay */}
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <Camera size={22} className="text-white" />
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {profileData.displayName || user.email.split("@")[0]}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        @{user.email.split("@")[0]}
                    </p>
                    <p className="text-center text-gray-600 dark:text-gray-300 max-w-sm mb-6">
                        {profileData.bio}
                    </p>

                    <div className="flex gap-4 w-full justify-center">
                        <button
                            onClick={handleEditProfile}
                            className={`${!profileExists
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                                } px-6 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2`}
                        >
                            {!profileExists ? <Check size={16} /> : <Edit2 size={16} />}
                            {!profileExists ? "Complete Profile" : "Edit Profile"}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center border-y border-gray-100 dark:border-gray-800 py-4 mb-6 transition-colors">
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 dark:text-white">
                            {myPosts.length}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Posts
                        </span>
                    </div>
                </div>

                {/* Posts Grid */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-bold border-b border-gray-100 dark:border-gray-800 pb-2 transition-colors">
                        <Grid size={20} /> Posts
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-3 gap-1">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="aspect-square bg-gray-100 dark:bg-gray-800 animate-pulse rounded"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1">
                            {myPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="aspect-square bg-gray-100 dark:bg-gray-800 relative group overflow-hidden cursor-pointer transition-colors rounded"
                                >
                                    {post.imageUrl ? (
                                        <img
                                            src={post.imageUrl}
                                            alt="Post"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="p-2 text-[10px] text-gray-500 dark:text-gray-400 h-full overflow-hidden">
                                            {post.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {myPosts.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                            No posts yet.
                        </div>
                    )}
                </div>

                {/* Edit Profile Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 transition-colors shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Edit Profile
                                </h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Photo upload */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative">
                                        {/* Preview layer */}
                                        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-green-500">
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Avatar
                                                    src={editForm.photoURL}
                                                    name={editForm.displayName || user.email}
                                                    size="w-20 h-20"
                                                    textSize="text-2xl"
                                                />
                                            )}
                                        </div>
                                        {/* Uploading spinner */}
                                        {isUploadingPhoto && (
                                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                        {/* Ready tick */}
                                        {photoUploaded && !isUploadingPhoto && (
                                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center border-2 border-white">
                                                <Check size={12} className="text-white" />
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
                                            className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                                        >
                                            <Camera size={14} />
                                            {isUploadingPhoto ? "Uploading…" : "Change Photo"}
                                        </button>
                                        {photoPreview && !isUploadingPhoto && (
                                            <button
                                                type="button"
                                                onClick={cancelPhoto}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Display name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        <User size={14} className="inline mr-1.5" />
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.displayName}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, displayName: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-colors"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Bio
                                    </label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, bio: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-colors resize-none"
                                        rows={3}
                                        placeholder="Tell us about yourself"
                                        maxLength={150}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        {editForm.bio.length}/150
                                    </p>
                                </div>

                                {/* Email (read-only) */}
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        <Mail size={14} className="inline mr-1.5" />
                                        {user.email}
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
                                    disabled={
                                        isUpdating ||
                                        isUploadingPhoto ||
                                        !editForm.displayName.trim()
                                    }
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isUpdating
                                        ? "Saving…"
                                        : profileExists
                                            ? "Update Profile"
                                            : "Create Profile"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
