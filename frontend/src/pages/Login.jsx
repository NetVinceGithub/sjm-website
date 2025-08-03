import axios from "axios";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import BG from "../assets/bg.png";
import { Eye, EyeOff } from "lucide-react";
import * as Icon from "react-icons/fi";
import Checkbox from "react-custom-checkbox";

const Login = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has 'Remember me' set in localStorage
    const savedEmail = localStorage.getItem("email");
    const savedChecked = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedChecked) {
      setEmail(savedEmail);
   
      setIsChecked(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.user.role);

        if (isChecked) {
          localStorage.setItem("email", email);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("rememberMe");
        }

        navigate("/admin-dashboard/overview"); // ✅ correct
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error);
      } else {
        setError("Server Error");
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null); // Clear the error after 3 seconds
      }, 3000);

      return () => clearTimeout(timer); // Clean up if component re-renders
    }
  }, [error]);

  const handleForgotPassword = () => {
    navigate("/forgot-password"); // You can create a new route for this
  };

  return (
    <div
      className="flex flex-col items-center h-screen justify-center space-y-6 absolute inset-0 bg-cover bg-center px-4"
      style={{
        backgroundImage: `url(${BG})`,
        opacity: 1,
        zIndex: -1,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="backdrop-blur-md bg-white/20 border border-white/20  rounded-lg shadow-black shadow-2xl p-6 w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] max-w-md">
        <h2 className="font-inter text-[28px] text-center font-bold text-neutralDGray">
          Payroll Management Portal
        </h2>
        <hr className="my-3 mb-4 border-t-1 border-black" />

        {error && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-100 text-xs text-red-700 border border-red-400 px-6 py-2 rounded-lg shadow-xl z-50 animate-slide-down">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="email"
              name="email"
              id="email"
              className="block py-2.5 px-2 w-full text-sm text-gray-900 bg-transparent border-r-0 border-l-0 border-t-0 border-b-1 border-neutralDGray appearance-none focus:outline-none focus:ring-0 focus:border-brandPrimary     "
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <label
              htmlFor="email"
              className="absolute text-sm text-neutralGray duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Email
            </label>
          </div>

          <div className="relative z-0 w-full mb-4 group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              className="block py-2.5 px-2 w-full text-sm text-gray-900 bg-transparent border-r-0 border-l-0 border-t-0 border-b-1 border-neutralDGray appearance-none focus:outline-none focus:ring-0 focus:border-brandPrimary peer pr-10"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <label
              htmlFor="password"
              className="absolute text-sm text-neutralGray duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Password
            </label>

            {/* TOGGLE PASSWORD VISIBILITY */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute w-fit right-3 top-1 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="mb-5 -mt-2 flex items-center justify-between">
            <Checkbox
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              icon={
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    backgroundColor: "#974364",
                    alignSelf: "stretch",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon.FiCheck color="white" size={14} />
                </div>
              }
              borderColor="#974364"
              borderRadius={14}
              style={{ overflow: "hidden" }}
              size={14}
              label={
                <span
                  className={`ml-1 mt-0 text-sm transition-colors ${
                    isChecked ? "text-[#974364]" : "text-neutralGray"
                  }`}
                >
                  Remember me
                </span>
              }
            />

            <a
              href="#"
              onClick={handleForgotPassword}
              className="text-[#974364] text-sm hover:text-neutralDGray no-underline hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-2 h-10 flex justify-center items-center text-center hover:-translate-y-2 text-sm font-medium text-white bg-brandPrimary rounded-md hover:bg-neutralDGray transition duration-200 ease-in-out disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
