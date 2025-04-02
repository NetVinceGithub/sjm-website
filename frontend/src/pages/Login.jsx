import axios from 'axios';
import React, { useState } from 'react'; 
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import BG from '../assets/bg.png';

const Login = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState(null);
  const {login} = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => { 
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
  
      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.user.role);  // ✅ Store role in localStorage
  
        if (response.data.user.role === "admin") {
          navigate('/admin-dashboard');
        } else {
          navigate('/admin-dashboard/employees'); // ✅ Redirect to employee dashboard instead
        }
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error);
      } else {
        setError("Server Error");
      }
    }
  };
  

  return (
    <div
      className="flex flex-col items-center h-screen backdrop-blur-lg justify-center space-y-6 absolute inset-0 bg-cover bg-center px-4"
      style={{
        backgroundImage: `url(${BG})`,
        opacity: 0.7,
        zIndex: -1,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="border shadow-black rounded-lg shadow-lg p-6 bg-white w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] max-w-md">
        <h2 className="font-inter text-[28px] text-center font-bold text-neutralDGray">
          Payroll Management Login
        </h2>
        <hr className="my-3 mb-4" />

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="block mb-2 text-neutralGray">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md"
              placeholder={isEmailFocused ? "" : "Enter Email"}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="block mb-2 text-neutralGray">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md"
              placeholder={isPasswordFocused ? "" : "Enter Password"}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="mb-5 flex items-center justify-between">
            <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox accent-neutralDGray checked:accent-brandPrimary"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />
            <span
              className={`ml-2 text-sm transition-colors ${
                isChecked ? "text-brandPrimary" : "text-neutralGray"
              }`}
            >
              Remember me
            </span>
            </label>
            <a
              href="#"
              className="text-brandPrimary text-sm hover:text-neautralDGray no-underline hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-brandPrimary hover:bg-neutralDGray rounded-md text-white py-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>

  )
}

export default Login;
