import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaShoppingBag, FaHome, FaCog, FaSignOutAlt, FaUser, FaMoon, FaSun } from "react-icons/fa";
import { FaDiscourse } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { FaCircleUser } from "react-icons/fa6"; // Fixed: Import from fa6 instead of fa
import logo from "../../public/logo.png";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";
import CourseCardSkeleton from "./CourseCardSkeleton";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

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
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Check login status on component mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        setCourses(response.data.courses);
        setFilteredCourses(response.data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses. Please try again.");
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter courses based on search term
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(lowercasedSearchTerm) ||
        course.description.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredCourses(results);
  }, [searchTerm, courses]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.get(`${BACKEND_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success("Logged out successfully!");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error.response?.data?.errors || "Error logging out.");
    }
  };

  // Toggle sidebar for mobile devices
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const defaultCourseImage = "https://via.placeholder.com/400x200?text=Course+Image";

  return (
    <div className={`flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Hamburger menu button for mobile */}
      <button
        className="md:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" // Fixed: Removed duplicate z-50
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 w-80 p-6 shadow-xl transform z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:shadow-none`}
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 mt-6">
          <img 
            src={logo} 
            alt="CodingHub Logo" 
            className="rounded-full h-40 w-45 mb-4 border-4  shadow-lg"
          />
          <h1 className="text-2xl font-bold text-orange-500 text-center">CodingHub</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Learn. Build. Grow.</p>
        </div>

        {/* User Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-sm" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">
                {isLoggedIn ? "Welcome Back" : "Welcome Guest"}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-xs">
                {isLoggedIn ? "Explore Our Courses" : "Login to Get Started"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link 
            to="/" 
            className="flex items-center space-x-4 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 group"
            onClick={handleLinkClick}
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <FaHome className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <span className="font-medium">Home</span>
          </Link>

          <Link 
            to="/courses" 
            className="flex items-center space-x-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold group"
            onClick={handleLinkClick}
          >
            <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <FaDiscourse className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <span>Courses</span>
          </Link>

          <Link 
            to="/purchases" 
            className="flex items-center space-x-4 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 group"
            onClick={handleLinkClick}
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
              <FaShoppingBag className="text-green-600 dark:text-green-400 text-lg" />
            </div>
            <span className="font-medium">My Purchases</span>
          </Link>

          <Link 
            to="/settings" 
            className="flex items-center space-x-4 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 group"
            onClick={handleLinkClick}
          >
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
              <FaCog className="text-purple-600 dark:text-purple-400 text-lg" />
            </div>
            <span className="font-medium">Settings</span>
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 w-full group"
          >
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors">
              {darkMode ? (
                <FaSun className="text-yellow-500 text-lg" />
              ) : (
                <FaMoon className="text-gray-600 text-lg" />
              )}
            </div>
            <span className="font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* Logout/Login */}
          {isLoggedIn ? (
            <button 
              onClick={() => {
                handleLogout();
                handleLinkClick();
              }} 
              className="flex items-center space-x-4 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 text-red-600 dark:text-red-400 w-full group mt-4"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                <FaSignOutAlt className="text-red-600 dark:text-red-400 text-lg" />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center space-x-4 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 group mt-4"
              onClick={handleLinkClick}
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <FaUser className="text-green-600 dark:text-green-400 text-lg" />
              </div>
              <span className="font-medium">Login</span>
            </Link>
          )}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={`flex-1 p-5 md:p-8 transition-all duration-300 ${
        isSidebarOpen ? "ml-80" : "ml-0"
      } md:ml-80 overflow-hidden`}>
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Explore Our Courses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Discover the perfect course to advance your skills
            </p>
          </div>
          
          <div className="flex items-center space-x-4 w-full lg:w-auto">
            <div className="flex items-center w-full lg:w-80">
              <input
                type="text"
                placeholder="Search courses..."
                className="border border-gray-300 dark:border-gray-600 rounded-l-xl px-4 py-3 h-12 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search courses"
              />
              <button
                className="h-12 border border-gray-300 dark:border-gray-600 rounded-r-xl px-4 flex items-center justify-center bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Submit search"
              >
                <FiSearch className="text-xl text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <FaCircleUser className="text-4xl text-blue-600 dark:text-blue-400 hidden lg:block" aria-label="User profile icon" />
          </div>
        </header>

        {/* Course Count */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredCourses.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {searchTerm ? "Search Results" : "Available Courses"}
              </div>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Vertically Scrollable Courses Section */}
        <div className="overflow-y-auto max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-180px)] p-2 -mx-2">
          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-8xl mb-6 text-gray-300 dark:text-gray-600">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {searchTerm ? "No Courses Found" : "No Courses Available"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? "We couldn't find any courses matching your search. Try different keywords."
                  : "Check back later for new courses or contact the administrator."
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                >
                  View All Courses
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <img
                      src={course.image?.url || defaultCourseImage}
                      alt={course.title}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Hot 🔥
                    </div>
                  </div>
                  <h2 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="font-bold text-xl text-green-600 dark:text-green-400">
                        ₹{course.price}
                      </span>
                      {course.originalPrice && (
                        <span className="text-gray-500 dark:text-gray-400 line-through text-base ml-2">
                          ₹{course.originalPrice}
                        </span>
                      )}
                    </div>
                    {course.discount && (
                      <span className="text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs">
                        {course.discount}% OFF
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      const user = JSON.parse(localStorage.getItem("user") || "{}");
                      if (!user?.token) {
                        navigate("/login", { 
                          state: { 
                            from: { 
                              pathname: `/buy/${course._id}`,
                              courseTitle: course.title
                            } 
                          } 
                        });
                      } else {
                        navigate(`/buy/${course._id}`);
                      }
                    }}
                    className="w-full text-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Enroll Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Courses;