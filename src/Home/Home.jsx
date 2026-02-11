import React from "react";
import { Nav } from "./Nav";
import { Footer } from "../pages/Footer";
import { motion } from "framer-motion";
import { useAuth } from "../Context/AuthContext";
import { Hero } from "./Hero";
import { ChatList } from "../pages/ChatList";

const Home = () => {
  const { user } = useAuth();

  // If logged in, the Home is the DM/Chat Dashboard
  if (user) {
    return <ChatList />;
  }

  // If logged out, show the Landing Page
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-950"
    >
      <Nav />
      {/* New Modern Hero/Landing Page */}
      <Hero />
      <Footer />
    </motion.div>
  );
};

export default Home;
