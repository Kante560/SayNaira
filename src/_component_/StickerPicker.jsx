import React, { useState, useEffect } from "react";
import { X, Smile, ThumbsUp, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const stickerPacks = {
    emoji: [
        { id: "emoji_1", url: "https://em-content.zobj.net/thumbs/240/google/350/grinning-face_1f600.png", name: "Grinning" },
        { id: "emoji_2", url: "https://em-content.zobj.net/thumbs/240/google/350/smiling-face-with-heart-eyes_1f60d.png", name: "Heart Eyes" },
        { id: "emoji_3", url: "https://em-content.zobj.net/thumbs/240/google/350/face-with-tears-of-joy_1f602.png", name: "Laughing" },
        { id: "emoji_4", url: "https://em-content.zobj.net/thumbs/240/google/350/thumbs-up_1f44d.png", name: "Thumbs Up" },
        { id: "emoji_5", url: "https://em-content.zobj.net/thumbs/240/google/350/red-heart_2764-fe0f.png", name: "Heart" },
        { id: "emoji_6", url: "https://em-content.zobj.net/thumbs/240/google/350/fire_1f525.png", name: "Fire" },
        { id: "emoji_7", url: "https://em-content.zobj.net/thumbs/240/google/350/star-struck_1f929.png", name: "Star Struck" },
        { id: "emoji_8", url: "https://em-content.zobj.net/thumbs/240/google/350/partying-face_1f973.png", name: "Party" },
        { id: "emoji_9", url: "https://em-content.zobj.net/thumbs/240/google/350/winking-face_1f609.png", name: "Wink" },
        { id: "emoji_10", url: "https://em-content.zobj.net/thumbs/240/google/350/smiling-face-with-sunglasses_1f60e.png", name: "Cool" },
        { id: "emoji_11", url: "https://em-content.zobj.net/thumbs/240/google/350/thinking-face_1f914.png", name: "Thinking" },
        { id: "emoji_12", url: "https://em-content.zobj.net/thumbs/240/google/350/face-blowing-a-kiss_1f618.png", name: "Kiss" },
    ],
    reactions: [
        { id: "react_1", url: "https://em-content.zobj.net/thumbs/240/google/350/clapping-hands_1f44f.png", name: "Clap" },
        { id: "react_2", url: "https://em-content.zobj.net/thumbs/240/google/350/folded-hands_1f64f.png", name: "Pray" },
        { id: "react_3", url: "https://em-content.zobj.net/thumbs/240/google/350/party-popper_1f389.png", name: "Celebrate" },
        { id: "react_4", url: "https://em-content.zobj.net/thumbs/240/google/350/hundred-points_1f4af.png", name: "100" },
        { id: "react_5", url: "https://em-content.zobj.net/thumbs/240/google/350/rocket_1f680.png", name: "Rocket" },
        { id: "react_6", url: "https://em-content.zobj.net/thumbs/240/google/350/sparkles_2728.png", name: "Sparkles" },
    ],
    animals: [
        { id: "animal_1", url: "https://em-content.zobj.net/thumbs/240/google/350/dog-face_1f436.png", name: "Dog" },
        { id: "animal_2", url: "https://em-content.zobj.net/thumbs/240/google/350/cat-face_1f431.png", name: "Cat" },
        { id: "animal_3", url: "https://em-content.zobj.net/thumbs/240/google/350/lion_1f981.png", name: "Lion" },
        { id: "animal_4", url: "https://em-content.zobj.net/thumbs/240/google/350/unicorn_1f984.png", name: "Unicorn" },
        { id: "animal_5", url: "https://em-content.zobj.net/thumbs/240/google/350/monkey-face_1f435.png", name: "Monkey" },
        { id: "animal_6", url: "https://em-content.zobj.net/thumbs/240/google/350/panda_1f43c.png", name: "Panda" },
    ]
};

export const StickerPicker = ({ isOpen, onClose, onSelectSticker }) => {
    const [activeTab, setActiveTab] = useState("emoji");

    const tabs = [
        { id: "emoji", icon: <Smile size={20} />, label: "Emoji" },
        { id: "reactions", icon: <ThumbsUp size={20} />, label: "Reactions" },
        { id: "animals", icon: <Heart size={20} />, label: "Animals" },
    ];

    const handleStickerClick = (e, sticker) => {
        e.preventDefault();
        e.stopPropagation();
        onSelectSticker(sticker);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="fixed inset-0 bg-black/70 z-[9998] md:hidden backdrop-blur-md"
                    />

                    {/* Sticker Panel */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-24 md:left-4 md:right-auto bg-[#1e1e1e] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-[9999] md:w-96 overflow-hidden flex flex-col pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold text-white">Stickers & Emojis</h3>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                }}
                                className="p-2 hover:bg-white/10 rounded-full transition text-white/60"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTab(tab.id);
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 transition ${activeTab === tab.id
                                            ? "text-green-500 border-b-2 border-green-500 bg-green-500/5"
                                            : "text-white/40 hover:text-white/70"
                                        }`}
                                >
                                    {tab.icon}
                                    <span className="text-sm font-medium hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Sticker Grid */}
                        <div className="p-4 max-h-80 overflow-y-auto bg-[#121212]/50">
                            <div className="grid grid-cols-4 gap-3">
                                {stickerPacks[activeTab]?.map((sticker) => (
                                    <button
                                        key={sticker.id}
                                        type="button"
                                        onClick={(e) => handleStickerClick(e, sticker)}
                                        className="aspect-square bg-white/5 rounded-2xl hover:bg-white/10 active:scale-90 transition-all p-2 flex items-center justify-center border border-white/5 group"
                                        title={sticker.name}
                                    >
                                        <img
                                            src={sticker.url}
                                            alt={sticker.name}
                                            className="w-full h-full object-contain pointer-events-none"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer tip */}
                        <div className="p-3 bg-black/30 border-t border-white/5">
                            <p className="text-[10px] text-white/30 text-center uppercase tracking-widest font-bold">
                                Tap to send sticker
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
