import {React, useEffect, useState} from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {useAuth} from "../Context/AuthContext"
import { Nav } from "../Home/Nav";


const Login = () => {

const { login } =  useAuth()
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const navigate = useNavigate();




const handleLogin = async (e) => {
e.preventDefault();

try {
  setLoading(true);
  await login(email, password);
  toast.success("Welcome back to SayNaira");
    navigate("/");
    setLoading(false);

  
} catch (err) {

  console.log(err.message)
  toast.error(err.message || "Login failed");
  setLoading(false);  
}


}




   return (
    <>
    <Nav/>
      <div className="flex justify-center items-center min-h-screen ">
      
        <form
        onSubmit={handleLogin}
          action="Login"
          className="p-8 shado rounded-lg  min-w-[400px] mx-auto bg-white  shadow-lg "
        >
          <Link to="/">
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
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                   <div className="mb-4">
            <label
              className="block mb-2  font-medium text-gray-700"
              htmlFor="Email"
            >
              Email
            </label>

            <input
            onChange={(e) => setEmail(e.target.value) }
            required
              type="Email"
              id="Email"
              name="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none   focus:shadow-green-400 focus:shadow-sm mb-4"
            />
          </div>
           <div className="mb-4">
            <label
              className="block mb-2  font-medium text-gray-700"
              htmlFor="Password"
            >
              Password
            </label>

            <input
                onChange={(e) => setPassword(e.target.value) }
                required
              type="Password"
              id="Password"
              name="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:shadow-green-400 focus:shadow-sm smb-4"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 pt-4  rounded bg-green-600 cursor:pointer text-white font-bold hover:bg-green-700 transition"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          <p className="text-center mt-4 block">I dont have an account <Link to="/SignUp" className="text-blue-500 hover:underline  hover:text-purple-800 ">Sign up</Link></p>
        </form>
      </div>
    </>
  );
};

export default Login;
