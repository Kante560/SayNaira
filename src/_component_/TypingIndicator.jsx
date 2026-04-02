import React from "react";
import { motion } from "framer-motion";

export const TypingIndicator = ({ variant = "bubble" }) => {
  if (variant === "text") {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-green-400 font-medium animate-pulse italic">typing</span>
        <div className="flex gap-0.5">
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
            className="w-1 h-1 bg-green-400 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            className="w-1 h-1 bg-green-400 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            className="w-1 h-1 bg-green-400 rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e1e]/90 text-white/90 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-white/10 backdrop-blur-3xl flex items-center gap-1.5 min-w-[60px] justify-center">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
        className="w-1.5 h-1.5 bg-green-500 rounded-full"
      />
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
        className="w-1.5 h-1.5 bg-green-500 rounded-full"
      />
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
        className="w-1.5 h-1.5 bg-green-500 rounded-full"
      />
    </div>
  );
};
