import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { MessageCircle, Home, User, LogOut, PlusSquare, Search } from "lucide-react";
import { motion } from "framer-motion";

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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">₦</div>
            <span className="font-bold text-xl text-green-600 tracking-tight">SayLess</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Log In</Link>
            <Link to="/signup" className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition">Get Started</Link>
          </div>
        </div>
      </nav>
    );
  }

  // APP NAVIGATION (Logged In)
  return (
    <>
      {/* DESKTOP TOP HEADER */}
      <header className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50 h-16 hidden md:flex items-center justify-between px-6 lg:px-12 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">SL</div>
          <span className="font-bold text-xl text-green-600">SayLess</span>
        </Link>

        <div className="flex items-center gap-8">
          <NavLinkDesktop to="/" icon={<Home size={20} />} label="Home" active={isActive("/")} />
          <NavLinkDesktop to="/blog" icon={<Search size={20} />} label="Posts" active={isActive("/blog")} />
          <NavLinkDesktop to="/profile" icon={<User size={20} />} label="Profile" active={isActive("/profile")} />
        </div>

        <div className="flex items-center gap-4">
          {/* Profile placeholder or smaller link */}
          <button onClick={logout} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition" aria-label="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MOBILE TOP BAR (Logo + Actions) */}
      <header className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 z-40 h-14 flex md:hidden items-center justify-between px-4 transition-colors duration-300">
        <span className="font-bold text-lg text-green-600">SayLess</span>
        <div className="flex items-center gap-3">
          <Link to="/messages" className="text-gray-700 dark:text-gray-200">
            <MessageCircle size={24} strokeWidth={1.5} />
          </Link>
        </div>
      </header>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-50 h-16 flex md:hidden items-center justify-around pb-safe transition-colors duration-300">
        <NavLinkMobile to="/" icon={<Home size={24} />} active={isActive("/")} />
        <NavLinkMobile to="/blog" icon={<Search size={24} />} active={isActive("/blog")} />
        <div className="relative -top-5">
          <Link to="/create-post" className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200 dark:shadow-none">
            <PlusSquare size={24} />
          </Link>
        </div>
        <NavLinkMobile to="/messages" icon={<MessageCircle size={24} />} active={isActive("/messages")} />
        <NavLinkMobile to="/profile" icon={<User size={24} />} active={isActive("/profile")} />
      </nav>
    </>
  );
};

const NavLinkDesktop = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${active ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-medium" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
    {icon}
    <span>{label}</span>
  </Link>
);

const NavLinkMobile = ({ to, icon, active }) => (
  <Link to={to} className={`p-2 rounded-xl transition ${active ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
    {React.cloneElement(icon, { strokeWidth: active ? 2.5 : 1.5 })}
  </Link>
);
