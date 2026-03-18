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
import { Loader } from "../_component_/Loader";

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
        <div className="min-h-screen bg-black pb-20">
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

                    <h1 className="text-xl font-bold text-white mb-1">
                        {profileData.displayName || user.email.split("@")[0]}
                    </h1>
                    <p className="text-white/60 text-sm mb-4">
                        @{user.email.split("@")[0]}
                    </p>
                    <p className="text-center text-white/80 max-w-sm mb-6">
                        {profileData.bio}
                    </p>

                    <div className="flex gap-4 w-full justify-center">
                        <button
                            onClick={handleEditProfile}
                            className={`${!profileExists
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-white/10 text-white/80 hover:bg-white/20"
                                } px-6 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 backdrop-blur-xl`}
                        >
                            {!profileExists ? <Check size={16} /> : <Edit2 size={16} />}
                            {!profileExists ? "Complete Profile" : "Edit Profile"}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center border-y border-white/10 py-4 mb-6">
                    <div className="text-center">
                        <span className="block font-bold text-white">
                            {myPosts.length}
                        </span>
                        <span className="text-xs text-white/60">
                            Posts
                        </span>
                    </div>
                </div>

                {/* Posts Grid */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-white font-bold border-b border-white/10 pb-2">
                        <Grid size={20} /> Posts
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-3 gap-1">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="aspect-square bg-white/10 animate-pulse rounded"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1">
                            {myPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="aspect-square bg-white/10 relative group overflow-hidden cursor-pointer rounded"
                                >
                                    {post.imageUrl ? (
                                        <img
                                            src={post.imageUrl}
                                            alt="Post"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="p-2 text-[10px] text-white/60 h-full overflow-hidden">
                                            {post.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {myPosts.length === 0 && !loading && (
                        <div className="text-center py-10 text-white/60 text-sm">
                            No posts yet.
                        </div>
                    )}
                </div>

                {/* Edit Profile Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-black/90 backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-white/10 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    Edit Profile
                                </h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-white/60 hover:text-white transition-colors"
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
                                                <Loader size="xs" showLabel={false} />
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
                                            className="flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white/80 rounded-full text-sm font-medium hover:bg-white/20 transition disabled:opacity-50"
                                        >
                                            <Camera size={14} />
                                            {isUploadingPhoto ? "Uploading…" : "Change Photo"}
                                        </button>
                                        {photoPreview && !isUploadingPhoto && (
                                            <button
                                                type="button"
                                                onClick={cancelPhoto}
                                                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-full transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Display name */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                                        <User size={14} className="inline mr-1.5" />
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.displayName}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, displayName: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 bg-black/30 text-white transition-colors shadow-inner shadow-black/20"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                                        Bio
                                    </label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, bio: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 bg-black/30 text-white transition-colors resize-none shadow-inner shadow-black/20"
                                        rows={3}
                                        placeholder="Tell us about yourself"
                                        maxLength={150}
                                    />
                                    <p className="text-xs text-white/60 mt-1">
                                        {editForm.bio.length}/150
                                    </p>
                                </div>

                                {/* Email (read-only) */}
                                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                    <p className="text-sm text-white/80">
                                        <Mail size={14} className="inline mr-1.5" />
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-white/10 text-white/80 rounded-lg hover:bg-white/10 transition-colors"
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
                                    {isUpdating ? (
                                        <Loader
                                            size="xs"
                                            label="Saving…"
                                            layout="row"
                                            labelClassName="text-white"
                                            className="justify-center"
                                        />
                                    )
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
