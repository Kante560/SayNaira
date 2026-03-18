import React, { useEffect, useMemo, useState } from "react";
import { Nav } from "../Home/Nav";

const FALLBACK_UNDERLAY_SRC = "/SayLess.png";
const DEFAULT_UNDERLAY_CANDIDATE_SRC = "/sideimg.jpg";

export function AuthLayout({
  heading,
  subheading,
  children,
  footer,
  underlaySrc,
  asideTitle = "SayLess",
  asideSubtitle = "Say less. Connect more.",
}) {
  const desiredUnderlaySrc = useMemo(
    () => underlaySrc || DEFAULT_UNDERLAY_CANDIDATE_SRC,
    [underlaySrc],
  );
  const [resolvedUnderlaySrc, setResolvedUnderlaySrc] = useState(desiredUnderlaySrc);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setResolvedUnderlaySrc(desiredUnderlaySrc);
    };
    img.onerror = () => {
      if (!cancelled) setResolvedUnderlaySrc(FALLBACK_UNDERLAY_SRC);
    };
    img.src = desiredUnderlaySrc;
    return () => {
      cancelled = true;
    };
  }, [desiredUnderlaySrc]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      <main className="relative pt-16 min-h-screen overflow-hidden">
        {/* Underlay image */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-center bg-cover opacity-35 saturate-125"
            style={{ backgroundImage: `url(${resolvedUnderlaySrc})` }}
          />
          {/* Dark overlay + subtle green tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_40%,rgba(34,197,94,0.18),transparent_60%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:py-14">
          <div className="grid gap-6 lg:gap-10 lg:grid-cols-2 items-stretch">
            {/* Left: glass form */}
            <section className="flex">
              <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_70px_-30px_rgba(0,0,0,0.85)] overflow-hidden">
                <div className="p-7 sm:p-9">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md grid place-items-center">
                      <img
                        src="/SayLess.png"
                        alt="SayLess"
                        className="h-7 w-7 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        {heading}
                      </h1>
                      {subheading ? (
                        <p className="text-sm text-white/65 mt-0.5">{subheading}</p>
                      ) : null}
                    </div>
                  </div>

                  {children}

                  {footer ? <div className="mt-6">{footer}</div> : null}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="px-7 sm:px-9 py-5 text-xs text-white/50">
                  By continuing you agree to our terms and privacy policy.
                </div>
              </div>
            </section>

            {/* Right: visual / marketing */}
            <aside className="hidden lg:flex relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl">
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0 bg-center bg-cover opacity-70"
                  style={{ backgroundImage: `url(${resolvedUnderlaySrc})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/55 to-black/70" />
                <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_40%_30%,rgba(34,197,94,0.22),transparent_55%)]" />
              </div>

              <div className="relative w-full p-10 flex flex-col justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md w-fit">
                  <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_0_6px_rgba(34,197,94,0.15)]" />
                  <span className="text-xs text-white/75">Dark • Glass • Clean</span>
                </div>

                <div>
                  <h2 className="text-4xl font-extrabold tracking-tight text-white">
                    {asideTitle}
                  </h2>
                  <p className="mt-3 text-white/70 leading-relaxed max-w-md">
                    {asideSubtitle}
                  </p>
                  <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    <span>Fast signup, smoother chats</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

