import React, { useState, useRef } from "react";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { Camera, Check, X, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { Avatar } from "./Avatar";

export const ProfileCompletionModal = ({ onClose }) => {
    const { user } = useAuth();

    const [displayName, setDisplayName] = useState(
        user?.displayName || user?.email?.split("@")[0] || ""
    );
    const [bio, setBio] = useState("");
    const [photoPreview, setPhotoPreview] = useState(null);   // local blob
    const [photoURL, setPhotoURL] = useState(user?.photoURL || ""); // Cloudinary URL
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1); // 1 = photo, 2 = name/bio
    const photoInputRef = useRef(null);

    /* ── Photo upload ──────────────────────────────────────────── */
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
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", "social_app_uploads");
        try {
            const res = await fetch(
                "https://api.cloudinary.com/v1_1/dc5mukmoh/image/upload",
                { method: "POST", body: fd }
            );
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            setPhotoURL(data.secure_url);
            toast.success("Photo uploaded ✓");
        } catch {
            toast.error("Photo upload failed");
            setPhotoPreview(null);
            setPhotoURL("");
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    /* ── Save to Firestore ─────────────────────────────────────── */
    const handleSave = async () => {
        if (!user) return;
        if (isUploadingPhoto) {
            toast.error("Please wait for the photo to finish uploading");
            return;
        }
        setIsSaving(true);
        try {
            await setDoc(
                doc(db, "users", user.uid),
                {
                    displayName: displayName.trim() || user.email.split("@")[0],
                    bio: bio.trim(),
                    photoURL: photoURL || "",
                    email: user.email,
                    uid: user.uid,
                    profileCompletedAt: new Date(),
                },
                { merge: true }
            );
            toast.success("Profile saved! Welcome 🎉");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Render ─────────────────────────────────────────────────── */
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Blurred backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* Decorative gradient header band */}
                <div className="h-2 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

                {/* Skip button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
                    title="Skip for now"
                >
                    <X size={15} />
                </button>

                <div className="p-8">
                    {/* Heading */}
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={20} className="text-green-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Complete your profile
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        Add a photo and tell others who you are — it only takes a second.
                    </p>

                    {/* ── STEP 1 — Photo ── */}
                    {step === 1 && (
                        <div className="flex flex-col items-center gap-6">
                            {/* Avatar preview + upload button */}
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-green-500/50 shadow-lg">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Avatar
                                            src={photoURL}
                                            name={displayName || user?.email}
                                            size="w-28 h-28"
                                            textSize="text-4xl"
                                        />
                                    )}
                                </div>

                                {/* Uploading spinner */}
                                {isUploadingPhoto && (
                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                {/* Ready tick */}
                                {photoURL && !isUploadingPhoto && (
                                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow border-2 border-white">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}

                                {/* Camera button */}
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current.click()}
                                    disabled={isUploadingPhoto}
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-full shadow transition disabled:opacity-60"
                                >
                                    <Camera size={13} />
                                    {isUploadingPhoto ? "Uploading…" : "Add Photo"}
                                </button>
                                <input
                                    type="file"
                                    ref={photoInputRef}
                                    onChange={handlePhotoSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* Info text */}
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center max-w-xs">
                                Your profile photo helps friends recognise you instantly.
                            </p>

                            {/* Step 1 CTA */}
                            <button
                                onClick={() => setStep(2)}
                                disabled={isUploadingPhoto}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {photoURL ? "Looks great — Continue" : "Continue without photo"}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2 — Name & Bio ── */}
                    {step === 2 && (
                        <div className="space-y-5">
                            {/* Compact photo recap */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-green-500/40">
                                    {photoPreview ? (
                                        <img src={photoPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <Avatar
                                            src={photoURL}
                                            name={displayName || user?.email}
                                            size="w-12 h-12"
                                            textSize="text-lg"
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-xs text-green-600 dark:text-green-400 font-medium hover:underline"
                                >
                                    Change photo
                                </button>
                            </div>

                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    maxLength={40}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white transition placeholder-gray-400"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Bio{" "}
                                    <span className="font-normal text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell the world a little about yourself…"
                                    maxLength={150}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white transition resize-none placeholder-gray-400 text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">
                                    {bio.length}/150
                                </p>
                            </div>

                            {/* Save CTA */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving || isUploadingPhoto || !displayName.trim()}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        Save &amp; Get Started
                                    </>
                                )}
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition py-1"
                            >
                                Skip for now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
