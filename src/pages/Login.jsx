import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Nav } from "../Home/Nav";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Nav />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16">
        <form
          onSubmit={handleLogin}
          className="p-8 rounded-2xl w-full max-w-md mx-4 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 transition-colors"
        >
          <Link to="/" className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">
              SL
            </div>
            <h1 className="font-bold text-2xl text-green-600">SayLess</h1>
          </Link>

          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Welcome Back</h2>

          <div className="mb-4">
            <label
              className="block mb-2 font-medium text-gray-700 dark:text-gray-300"
              htmlFor="Email"
            >
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              id="Email"
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          <div className="mb-6">
            <label
              className="block mb-2 font-medium text-gray-700 dark:text-gray-300"
              htmlFor="Password"
            >
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              id="Password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
