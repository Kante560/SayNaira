import React from "react";
import { Toaster } from "react-hot-toast";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import { Blog } from "./pages/Blog";
import { Contact } from "./pages/Contact";
import { Marketing } from "./Home/Marketing";
import { About } from "./Home/About";
import { Chat } from "./_component_/Chat";
import { ChatList } from "./pages/ChatList";
import { Profile } from "./pages/Profile";
import { CreatePost } from "./pages/CreatePost";
import { ThemeProvider } from "./Context/ThemeContext";

const App = () => {
  return (
    <ThemeProvider>
    <Router>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#111827",
            color: "#F9FAFB",
            border: "1px solid #374151",
            boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
            borderRadius: "12px",
            padding: "12px 14px",
          },
          success: {
            iconTheme: { primary: "#10B981", secondary: "#111827" },
          },
          error: {
            iconTheme: { primary: "#EF4444", secondary: "#111827" },
          },
        }}
        gutter={10}
        containerStyle={{
          bottom: 24,
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/messages" element={<ChatList />} />
        <Route path="/chat/:recipientId" element={<Chat />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
};

export default App;
