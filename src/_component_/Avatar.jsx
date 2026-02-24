/**
 * Avatar — shared component.
 * Shows a real photo if `src` is provided, otherwise falls back to
 * the coloured initial-letter circle.
 *
 * Props:
 *   src        – photo URL (optional)
 *   name       – display name or email used for the fallback initial
 *   size       – Tailwind size classes, e.g. "w-10 h-10" (default)
 *   textSize   – Tailwind text-size for the fallback letter (default "text-base")
 *   className  – extra classes appended to the outer wrapper
 */
import React from "react";

export const Avatar = ({
    src,
    name = "?",
    size = "w-10 h-10",
    textSize = "text-base",
    className = "",
}) => {
    const initial = (name || "?").charAt(0).toUpperCase();

    return (
        <div
            className={`${size} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-green-400 to-emerald-600 ${className}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // If image fails to load show the fallback initial
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.setAttribute(
                            "data-fallback",
                            initial
                        );
                    }}
                />
            ) : (
                <span className={`font-bold text-white ${textSize}`}>{initial}</span>
            )}
        </div>
    );
};
