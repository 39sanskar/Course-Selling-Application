import React, { useState, useEffect } from "react";
import logo from "../../public/logo.png"; // Ensure this path is correct
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils"; // Ensure BACKEND_URL is correctly defined
import { FaEye, FaEyeSlash, FaMoon, FaSun, FaSpinner } from "react-icons/fa"; // Import eye icons and spinner
function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false); // Dark mode state
  const navigate = useNavigate();

  const validateForm = () => {
    setErrorMessage(""); // Clear previous errors
    if (!firstName.trim()) {
      setErrorMessage("First name is required.");
      return false;
    }
    if (!lastName.trim()) {
      setErrorMessage("Last name is required.");
      return false;
    }
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
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  // Load dark mode preference from localStorage
    useEffect(() => {
      const savedDarkMode = localStorage.getItem("darkMode");
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    }, []);
  
    // Apply dark mode class to HTML element and save preference
    useEffect(() => {
      localStorage.setItem("darkMode", JSON.stringify(darkMode));
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    if (!validateForm()) {
      toast.error(errorMessage); // Show toast for client-side validation error
      return;
    }

    setLoading(true);
    setErrorMessage(""); // Clear error message before new submission

    try {
      const response = await axios.post(
        `${BACKEND_URL}/user/signup`,
        {
          firstName,
          lastName,
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
      console.log("Signup successful: ", response.data);
      toast.success(response.data.message || "Signup successful!");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response) {
        setErrorMessage(error.response.data.errors || error.response.data.message || "Signup failed. Please try again.");
      } else if (error.request) {
        setErrorMessage("No response from server. Please check your network connection.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
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
        <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 shadow-md bg-white dark:bg-[#1e1e1e]">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
            <Link to="/" className="text-2xl font-bold text-[#0056D2] dark:text-[#2E8BFF]">
              CodingHub
            </Link>
          </div>
  
          {/* Right buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? (
                <FaSun className="text-yellow-400" size={18} />
              ) : (
                <FaMoon className="text-gray-600" size={18} />
              )}
            </button>
  
            <Link
              to="/login"
              className="border border-[#0056D2] text-[#0056D2] dark:border-[#2E8BFF] dark:text-[#2E8BFF] font-semibold py-2 px-5 rounded-lg hover:bg-[#0056D2] hover:text-white dark:hover:bg-[#2E8BFF] transition"
            >
              Login
            </Link>
            <Link
              to="/courses"
              className="bg-[#0056D2] dark:bg-[#2E8BFF] text-white font-semibold py-2 px-5 rounded-lg hover:opacity-90 transition"
            >
              Explore Courses 
            </Link>
          </div>
        </header>
  
        {/* Signup Form Container */}
        <div className="flex flex-1 items-center justify-center pt-20"> {/* pt-20 for fixed header */}
          <div className="bg-white dark:bg-[#1e1e1e] p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md mx-4 transform hover:scale-[1.01] transition-transform duration-300">
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">
              Join CodingHub Today!
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Create your account to start learning.
            </p>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0056D2] dark:focus:ring-[#2E8BFF] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder="Type your firstname"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0056D2] dark:focus:ring-[#2E8BFF] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder="Type your lastname"
                    required
                  />
                </div>
              </div>
  
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email" // Changed to type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0056D2] dark:focus:ring-[#2E8BFF] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // Toggle password visibility
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0056D2] dark:focus:ring-[#2E8BFF] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 pr-10 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
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
                className="w-full bg-[#0056D2] dark:bg-[#2E8BFF] hover:bg-[#0044b3] dark:hover:bg-[#1f7ae0] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                disabled={loading} // Disable button when loading
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Signing Up...
                  </>
                ) : (
                  "Signup"
                )}
              </button>
            </form>
  
            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-[#0056D2] dark:text-[#2E8BFF] hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
}

export default Signup;
