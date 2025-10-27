import React, { useState, useEffect } from "react";
import logo from "../../public/logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";
import { FaEye, FaEyeSlash, FaMoon, FaSun } from "react-icons/fa";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = () => {
    setErrorMessage("");
    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    if (!password.trim()) {
      setErrorMessage("Password is required.");
      return false;
    }
    return true;
  };

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Apply dark mode class
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      toast.error(errorMessage);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/admin/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("AdminLogin successful: ", response.data);
      toast.success(response.data.message || "Admin login successful!");
      
      // Save admin data to localStorage
      localStorage.setItem("admin", JSON.stringify(response.data));
      navigate("/admin/dashboard");
      
    } catch (error) {
      console.error("Admin login error:", error);
      
      let errorMsg = "Admin login failed!";
      
      if (error.response?.data?.errors) {
        errorMsg = error.response.data.errors;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? "dark bg-[#121212]" : "bg-gradient-to-br from-blue-50 to-indigo-100"
      } text-gray-900 dark:text-gray-100 transition-colors duration-500`}
    >
      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-5">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
          <Link to="/" className="text-2xl font-bold text-[#0056D2] dark:text-[#2E8BFF]">
            CodingHub
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? <FaSun className="text-yellow-400" size={18} /> : <FaMoon className="text-gray-600" size={18} />}
          </button>
          
          <Link
            to={"/admin/signup"}
            className="border border-[#0056D2] text-[#0056D2] dark:border-[#2E8BFF] dark:text-[#2E8BFF] font-semibold py-2 px-5 rounded-lg hover:bg-[#0056D2] hover:text-white dark:hover:bg-[#2E8BFF] transition"
          >
            Signup
          </Link>
          <Link
            to={"/courses"}
            className="bg-[#0056D2] dark:bg-[#2E8BFF] text-white font-semibold py-2 px-5 rounded-lg hover:opacity-90 transition"
          >
            Join now
          </Link>
        </div>
      </header>

      {/* AdminLogin Form */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white dark:bg-[#1e1e1e] p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md mx-4 transform hover:scale-[1.01] transition-transform duration-300">
          <h2 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Welcome to CodingHub 
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Log in to access admin dashboard!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address 
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0056D2] dark:focus:ring-[#2E8BFF] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0056D2] dark:focus:ring-[#2E8BFF] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 pr-10 transition-all duration-200"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => !loading && setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </span>
              </div>
            </div>
            
            {errorMessage && (
              <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md text-sm text-center">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading 
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" 
                  : "bg-[#0056D2] dark:bg-[#2E8BFF] hover:bg-[#0044b3] dark:hover:bg-[#1f7ae0]"
              } text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link 
              to="/admin/signup" 
              className="text-[#0056D2] dark:text-[#2E8BFF] hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;