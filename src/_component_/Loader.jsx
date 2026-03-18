import React from "react";

const SIZE_MAP = {
  xs: "w-5 h-5",
  sm: "w-7 h-7",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

export function Loader({
  label = "Loading...",
  showLabel = true,
  size = "md",
  layout = "column",
  glass = true,
  className = "",
  imageClassName = "",
  glassClassName = "",
  labelClassName = "",
}) {
  const imgSize = SIZE_MAP[size] || SIZE_MAP.md;
  const isRow = layout === "row";

  return (
    <div
      className={`flex ${isRow ? "flex-row" : "flex-col"} items-center justify-center ${
        isRow ? "" : "text-center"
      } ${className}`}
    >
      <div
        className={
          glass
            ? `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_18px_50px_-30px_rgba(0,0,0,0.75)] p-3 ${glassClassName}`
            : glassClassName
        }
      >
        <img
          src="/loader.png"
          alt={label}
          className={`${imgSize} object-contain animate-pulse ${imageClassName}`}
          loading="lazy"
        />
      </div>
      {showLabel ? (
        <p
          className={`${isRow ? "ml-2" : "mt-3"} text-sm font-medium text-gray-600 dark:text-gray-300 ${labelClassName}`}
        >
          {label}
        </p>
      ) : null}
    </div>
  );
}

