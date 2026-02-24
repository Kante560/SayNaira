import React from "react";
import { Toaster } from "react-hot-toast";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home/Home";
import { Blog } from "./pages/Blog";
import { Contact } from "./pages/Contact";
import { Marketing } from "./Home/Marketing";
import { About } from "./Home/About";
import { Chat } from "./_component_/Chat";
import { ChatList } from "./pages/ChatList";
import { Profile } from "./pages/Profile";
import { CreatePost } from "./pages/CreatePost";
import { Notifications } from "./pages/Notifications";
import { ThemeProvider } from "./Context/ThemeContext";
import { useAuth } from "./Context/AuthContext";
import { ProfileCompletionModal } from "./_component_/ProfileCompletionModal";

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  return children;
};

// Component to prevent logged-in users from accessing Auth pages (Login/Signup)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;
  return children;
};

// Global profile completion modal gate
const ProfileCompletionGate = () => {
  const { user, showProfileCompletion, setShowProfileCompletion } = useAuth();
  if (!user || !showProfileCompletion) return null;
  return <ProfileCompletionModal onClose={() => setShowProfileCompletion(false)} />;
};

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
          {/* Universal Home Route (Handles Landing vs Dashboard internally) */}
          <Route path="/" element={<Home />} />

          {/* Publicly Accessible Information Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes (Restricted to logged-out users) */}
          <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Protected App Routes (Restricted to logged-in users) */}
          <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
          <Route path="/chat/:recipientId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Global profile-completion modal — renders on top of all routes */}
        <ProfileCompletionGate />
      </Router>
    </ThemeProvider>
  );
};

export default App;
