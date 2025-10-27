import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../public/logo.png";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_URL } from "../utils/utils";
import { FaMoon, FaSun, FaHome, FaBook, FaPlus, FaSignOutAlt } from "react-icons/fa";

function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load dark mode preference and admin data
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    // Load admin data from localStorage
    const admin = localStorage.getItem("admin");
    if (admin) {
      try {
        setAdminData(JSON.parse(admin));
      } catch (error) {
        console.error("Error parsing admin data:", error);
      }
    }
    setLoading(false);
  }, []);

  // Apply dark mode class
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("admin");
      navigate("/admin/login");
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 p-6 shadow-xl transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="CodingHub" className="w-10 h-10 rounded-full" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">CodingHub</span>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="flex flex-col items-center mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors duration-300">
          <img src={logo} alt="Admin" className="rounded-full h-24 w-24 border-4 border-blue-500 dark:border-blue-400" />
          <h2 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">Admin Panel</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
            {adminData?.email || "Administrator"}
          </p>
          <div className="mt-2 px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
            Online
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-3">
          <Link to="/admin/our-courses">
            <button className="w-full flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <FaBook className="text-lg" />
              <span>Our Courses</span>
            </button>
          </Link>

          {/* Small gap between buttons */}
          <div className="my-1"></div>

          <Link to="/admin/create-course">
            <button className="w-full flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <FaPlus className="text-lg" />
              <span>Create Course</span>
            </button>
          </Link>
          <div className="my-1"></div>
          <Link to="/">
            <button className="w-full flex items-center space-x-3 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <FaHome className="text-lg" />
              <span>Home Page</span>
            </button>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              {/* Dark Mode Toggle - Moved to top right */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {darkMode ? (
                  <FaSun className="text-yellow-400 text-lg" />
                ) : (
                  <FaMoon className="text-gray-600 text-lg" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-center max-w-2xl">
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Welcome to CodingHub Admin!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Manage your courses, track student progress, and analyze platform performance 
              from your centralized dashboard.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
                <FaBook className="text-3xl text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Course Management</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Create, edit, and manage your course catalog
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
                <FaPlus className="text-3xl text-orange-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Create Content</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Add new courses and learning materials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;