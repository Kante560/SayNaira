import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Menu, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "../_component_/NotificationBell";

export const Nav = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Auto-close on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  return (
    <>
      <div className="bg-white border-b-gray-200 border-b-[2px] w-full z-50 fixed top-0 left-0">
        <div className="font-inter max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center cursor:pointer space-x-2 px-4">
              <div className="flex item-center space-x-2 text-[13.5px] font-bold p-1.5 px-2.5 rounded-lg bg-green-600 text-white">
                ₦
              </div>
              <span>
                <h1 className="font-bold text-2xl text-green-600">SayLess</h1>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6 items-center text-gray-600 font-lg px-6">
            <Link className="hover:text-green-600" to="/">
              Home
            </Link>
            
            <Link to="/blog" className="hover:text-green-600">
              Live Market
            </Link>
            {user && (
              <>
                <Link
                  to="/messages"
                  className="relative hover:text-green-600 flex items-center gap-1"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Messages</span>
                </Link>
                <NotificationBell />
              </>
            )}
            {!user && (
              <>
                <Link to="/marketing" className="hover:text-green-600">
                  Service
                </Link>
                <Link to="/about" className="hover:text-green-600">
                  About
                </Link>
                <Link
                  to="/signup"
                  className="py-2 px-4 bg-green-600 text-white rounded-lg"
                >
                  Get Started
                </Link>
              </>
            )}
            {user && (
              <motion.button
                onClick={async () => {
                  await logout();
                  toast.success('You have been logged out. Please log in again.');
                  navigate('/login');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-red-600 cursor-pointer rounded-lg font-semibold hover:underline"
              >
                Logout
              </motion.button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden bg-white px-6 py-4 border-t"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="flex flex-col space-y-4 text-gray-700 font-medium overflow-hidden">
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/"
                  className="hover:text-green-600"
                >
                  Home
                </Link>
                
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/blog"
                  className="hover:text-green-600"
                >
                  Live Market
                </Link>
                {user && (
                  <Link
                    onClick={() => setIsOpen(false)}
                    to="/messages"
                    className="hover:text-green-600 flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Messages
                  </Link>
                )}
                {!user && (
                  <>
                    <Link
                      onClick={() => setIsOpen(false)}
                      to="/marketing"
                      className="hover:text-green-600"
                    >
                      Service
                    </Link>
                    <Link
                      onClick={() => setIsOpen(false)}
                      to="/about"
                      className="hover:text-green-600"
                    >
                      About
                    </Link>
                    <Link
                      onClick={() => setIsOpen(false)}
                      to="/signup"
                      className="py-2 px-4 bg-green-600 text-white rounded-lg text-center w-full"
                    >
                      Get Started
                    </Link>
                  </>
                )}
                {user && (
                  <motion.button
                    onClick={async () => {
                      setIsOpen(false);
                      await logout();
                      toast.success('You have been logged out. Please log in again.');
                      navigate('/login');
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white cursor-pointer px-2 py-2 rounded-lg font-semibold shadow-md"
                  >
                    Logout
                  </motion.button>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
