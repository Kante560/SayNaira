import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Bell, Home, User, LogOut, PlusSquare, Search } from "lucide-react";
import { motion } from "framer-motion";
import { NotificationBell } from "../_component_/NotificationBell";

export const Nav = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  // Render simplified Landing Page Nav if not logged in
  if (!user) {
    return (
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
           
             <img src="/SayLess.png" alt="SayLess Logo" className="w-auto h-25 rounded-lg" />   
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white">Log In</Link>
            <Link to="/signup" className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition">Get Started</Link>
          </div>
        </div>
      </nav>
    );
  }

  // MOBILE TOP BAR (Logo + Actions) - Hidden on chat pages
  const isChatPage = location.pathname.startsWith("/chat/");

  return (
    <>
      {/* DESKTOP TOP HEADER */}
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-white/10 z-50 h-16 hidden md:flex items-center justify-between px-6 lg:px-12 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2">
          <img src="/SayLess.png" alt="SayLess Logo" className="w-auto h-25 rounded-lg" />
        
        </Link>

        <div className="flex items-center gap-8">
          <NavLinkDesktop to="/" icon={<Home size={20} />} label="Home" active={isActive("/")} />
          <NavLinkDesktop to="/blog" icon={<Search size={20} />} label="Posts" active={isActive("/blog")} />
          <NavLinkDesktop to="/profile" icon={<User size={20} />} label="Profile" active={isActive("/profile")} />
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <button onClick={logout} className="text-white/60 hover:text-red-400 transition" aria-label="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MOBILE TOP BAR (Logo + Actions) */}
      {!isChatPage && (
        <header className="fixed top-0 w-full bg-black/95 backdrop-blur-sm border-b border-white/10 z-40 h-14 flex md:hidden items-center justify-between px-4 transition-colors duration-300">
          <Link to="/" className="flex items-center gap-2">
            <img src="/SayLess.png" alt="SayLess Logo" className="w-auto h-25 rounded-lg" />
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>
      )}

      {/* MOBILE BOTTOM TAB BAR */}
      {!isChatPage && (
        <nav className="fixed bottom-0 w-full bg-black border-t border-white/10 z-50 h-16 flex md:hidden items-center justify-around pb-safe transition-colors duration-300">
          <NavLinkMobile to="/" icon={<Home size={24} />} active={isActive("/")} />
          <NavLinkMobile to="/blog" icon={<Search size={24} />} active={isActive("/blog")} />
          <div className="relative -top-5">
            <Link to="/create-post" className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <PlusSquare size={24} />
            </Link>
          </div>
          <NavLinkMobile to="/notifications" icon={<Bell size={24} />} active={isActive("/notifications")} />
          <NavLinkMobile to="/profile" icon={<User size={24} />} active={isActive("/profile")} />
        </nav>
      )}
    </>
  );
};

const NavLinkDesktop = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${active ? "bg-green-500/20 text-green-400 font-medium" : "text-white/60 hover:bg-white/10"}`}>
    {icon}
    <span>{label}</span>
  </Link>
);

const NavLinkMobile = ({ to, icon, active }) => (
  <Link to={to} className={`p-2 rounded-xl transition ${active ? "text-green-400" : "text-white/60"}`}>
    {React.cloneElement(icon, { strokeWidth: active ? 2.5 : 1.5 })}
  </Link>
);
