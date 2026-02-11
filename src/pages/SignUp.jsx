import{  React, useState } from "react"; 
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Nav } from "../Home/Nav";

const SignUp = () => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signup(email, password, name);
      toast.success("Signup successful! Welcome to SayLess.");
      navigate("/");
    } catch (err) {
      console.error("Signup failed:", err.message);
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Nav/>
    <div className="flex justify-center items-center  min-h-screen  w-full h-100vh bg-gradient-to-br from-green-50 via-white mt-4 to-white py-20 bg-gray-50">
      <form
        onSubmit={handleSignUp}
        className="p-8 border border-gray-200 rounded-lg min-w-[400px] bg-white shadow-md"
      > <Link to="/">
                <h2 className="text-center items-center flex justify-center mb-4" >
                   < div className="flex items-center cursor:pointer space-x-2 px-4">
                  <div className="flex item-center space-x-2 text-[13.5px] font-bold p-1.5 px-2.5 rounded-lg bg-green-600 text-white">
                    ₦
                  </div>
                  <span>
                    <h1 className="font-bold text-2xl text-green-600">SayLess</h1>
                  </span>
                </div></h2>
                </Link>
        <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block mb-2 font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:shadow-sm focus:shadow-green-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-2 font-medium text-gray-700"
          >
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:shadow-sm focus:shadow-green-500"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block mb-2 font-medium text-gray-700"
          >
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            id="password"
            name="password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:shadow-sm focus:shadow-green-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded bg-green-600 text-white font-bold hover:bg-green-700 transition cursor:pointer"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
        
       <p className="text-center mt-4 block " >I already have an account <span> <Link  to="/Login"
          className="text-blue-500 hover:underline  hover:text-purple-800 "
        > Login</Link></span> 

           </p>
       
      </form>
    </div>
    </>

  );
};

export default SignUp;
