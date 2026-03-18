import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { AuthLayout } from "../_component_/AuthLayout";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      toast.success("Welcome back to SayLess");
      navigate("/");
    } catch (err) {
      console.log(err.message);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      toast.success("Successfully logged in with Google!");
      navigate("/");
    } catch (err) {
      console.error("Google login failed:", err.message);
      toast.error("Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Log in to continue chatting on SayLess."
      footer={
        <p className="text-center text-sm text-white/65">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-green-400 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      }
      asideSubtitle="A dark, clean space to connect and chat — with a little glassy shine."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-white/75" htmlFor="loginEmail">
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            id="loginEmail"
            name="email"
            placeholder="name@example.com"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-black/30 text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-green-500/70 focus:border-transparent transition shadow-inner shadow-black/20"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-white/75" htmlFor="loginPassword">
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            id="loginPassword"
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-black/30 text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-green-500/70 focus:border-transparent transition shadow-inner shadow-black/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-3.5 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_14px_40px_-20px_rgba(34,197,94,0.7)] active:scale-[0.99]"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 py-1 rounded-full border border-white/10 bg-black/30 text-white/60 uppercase tracking-wide backdrop-blur-md">
            Or continue with
          </span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading}
        className="w-full py-3.5 flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 text-white/85 font-semibold hover:bg-white/10 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm active:scale-[0.99] backdrop-blur-xl"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-[15px]">{googleLoading ? "Connecting..." : "Continue with Google"}</span>
      </button>
    </AuthLayout>
  );
};

export default Login;
