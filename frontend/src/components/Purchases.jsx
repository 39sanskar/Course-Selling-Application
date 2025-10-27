import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaDiscourse, FaPlayCircle, FaClock, FaCheckCircle, FaHome, FaCog, FaSignOutAlt, FaUser, FaShoppingBag, FaMoon, FaSun } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";
import logo from "/logo.png";
import CourseCardSkeleton from './CourseCardSkeleton';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [enrichedPurchases, setEnrichedPurchases] = useState([]);

  const navigate = useNavigate();
  
  // Get user from localStorage
  const getUser = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const user = getUser();
  const token = user?.token;

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

  // Check authentication
  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      toast.error("Please log in to view your purchases.");
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch course details for each purchased course
  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/course/${courseId}`, {
        withCredentials: true,
      });
      return response.data.course;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      return null;
    }
  };

  // Main data fetching effect
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchPurchasesAndCourses = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("[PURCHASES] Fetching purchases data...");
        
        const response = await axios.get(`${BACKEND_URL}/user/purchases`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        
        console.log("[PURCHASES] API Response received:", response.data);

        let purchasedCourseIds = [];
        
        // Handle different response structures
        if (response.data && response.data.purchases && Array.isArray(response.data.purchases)) {
          // Structure 1: { purchases: [...] }
          purchasedCourseIds = response.data.purchases
            .map(purchase => purchase.courseId || purchase.course?._id || purchase._id)
            .filter(id => id && id !== "unknown");
        } else if (response.data && response.data.courses && Array.isArray(response.data.courses)) {
          // Structure 2: { courses: [...] }
          purchasedCourseIds = response.data.courses
            .map(course => course.courseId || course._id)
            .filter(id => id && id !== "unknown");
        } else if (Array.isArray(response.data)) {
          // Structure 3: Direct array
          purchasedCourseIds = response.data
            .map(item => item.courseId || item._id)
            .filter(id => id && id !== "unknown");
        } else if (response.data && response.data.courseData && Array.isArray(response.data.courseData)) {
          // Structure 4: { courseData: [...] }
          purchasedCourseIds = response.data.courseData
            .map(item => item.courseId || item._id)
            .filter(id => id && id !== "unknown");
        }

        console.log("[PURCHASES] Extracted Course IDs:", purchasedCourseIds);

        if (purchasedCourseIds.length === 0) {
          console.log("[PURCHASES] No purchased courses found");
          setEnrichedPurchases([]);
          setLoading(false);
          return;
        }

        // Remove duplicates
        const uniqueCourseIds = [...new Set(purchasedCourseIds)];
        console.log("[PURCHASES] Unique Course IDs to fetch:", uniqueCourseIds);

        // Fetch details for each course
        const coursePromises = uniqueCourseIds.map(courseId => fetchCourseDetails(courseId));
        const coursesData = await Promise.all(coursePromises);
        
        console.log("[PURCHASES] Fetched courses data:", coursesData);

        // Filter out null responses and create enriched purchases
        const validCourses = coursesData.filter(course => course !== null);
        setEnrichedPurchases(validCourses);

        console.log("[PURCHASES] Final enriched purchases:", validCourses.length, "courses");

      } catch (err) {
        console.error("[PURCHASES] Error fetching purchases:", err);
        
        let errorMessage = "An unexpected error occurred while fetching your purchases.";
        
        if (err.response) {
          console.error("[PURCHASES] Response details:", {
            status: err.response.status,
            data: err.response.data
          });
          
          errorMessage = err.response.data?.message || 
                        err.response.data?.errors || 
                        "Failed to load your purchased courses.";
          
          if (err.response.status === 401) {
            console.log("[PURCHASES] Authentication failed - redirecting to login");
            localStorage.removeItem("user");
            navigate("/login");
            return;
          }
        } else if (err.request) {
          errorMessage = "Unable to connect to server. Please check your internet connection.";
        } else {
          errorMessage = err.message || errorMessage;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasesAndCourses();
  }, [token, navigate]);

  // Utility functions
  const getCourseImage = (course) => {
    if (!course) return "https://via.placeholder.com/400x250/4F46E5/FFFFFF?text=Course+Image";
    
    const imagePaths = [
      course.image?.url,
      course.image?.secure_url,
      course.thumbnail,
      course.courseImage,
      course.imageUrl,
      typeof course.image === 'string' ? course.image : null,
    ];

    const foundImage = imagePaths.find(path => path && typeof path === 'string');
    return foundImage || "https://via.placeholder.com/400x250/4F46E5/FFFFFF?text=Course+Image";
  };

  const getCourseTitle = (course) => {
    return course?.title || "Untitled Course";
  };

  const getCourseDescription = (course) => {
    return course?.description || "No description available for this course.";
  };

  const getCoursePrice = (course) => {
    return course?.price || 0;
  };

  const getCourseId = (course) => {
    return course?._id || `course-${Math.random()}`;
  };

  // Event handlers
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message || "Logged out successfully");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
      const errorMessage = err.response?.data?.errors || 
                          err.response?.data?.message || 
                          "Error occurred during logout";
      toast.error(errorMessage);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently purchased";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Recently purchased";
    }
  };

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-800 p-6 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-80 z-50 shadow-xl`}
      >
        <div className="flex flex-col items-center mb-10 mt-6">
          <img 
            src={logo} 
            alt="CodingHub Logo" 
            className="rounded-full h-40 w-45 mb-4 border-4 shadow-lg"
          />
          <h1 className="text-2xl font-bold text-blue-500 text-center">CodingHub</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Learn. Build. Grow.</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-sm" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">
                {user?.user?.firstName || "Welcome Back"}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-xs">
                {user?.user?.email || "Continue Learning"}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          <Link to="/" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 group">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <FaHome className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <span className="font-medium">Home</span>
          </Link>

          <Link to="/courses" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 group">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
              <FaDiscourse className="text-green-600 dark:text-green-400 text-lg" />
            </div>
            <span className="font-medium">Courses</span>
          </Link>

          <Link to="/purchases" className="flex items-center space-x-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold group">
            <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <FaShoppingBag className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <span>My Purchases</span>
          </Link>

          <Link to="/settings" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 group">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
              <FaCog className="text-purple-600 dark:text-purple-400 text-lg" />
            </div>
            <span className="font-medium">Settings</span>
          </Link>

          <button onClick={() => setDarkMode(!darkMode)} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 w-full group">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors">
              {darkMode ? <FaSun className="text-yellow-500 text-lg" /> : <FaMoon className="text-gray-600 text-lg" />}
            </div>
            <span className="font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button onClick={() => { handleLogout(); handleLinkClick(); }} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 text-red-600 dark:text-red-400 w-full group mt-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
              <FaSignOutAlt className="text-red-600 dark:text-red-400 text-lg" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Mobile Toggle Button */}
      <button className="fixed top-6 left-6 z-50 md:hidden bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={toggleSidebar}>
        {isSidebarOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
      </button>

      {/* Main Content */}
      <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? "ml-80" : "ml-0"} md:ml-80 overflow-auto`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                My Learning Journey
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                {enrichedPurchases.length > 0 
                  ? `You're enrolled in ${enrichedPurchases.length} course${enrichedPurchases.length !== 1 ? 's' : ''} - Keep learning!`
                  : "Start your coding journey with our expert-led courses"
                }
              </p>
            </div>
            
            {enrichedPurchases.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">{enrichedPurchases.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Courses Owned</div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => <CourseCardSkeleton key={index} />)}
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4 text-red-400">😔</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops! Something went wrong</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl">Try Again</button>
                <Link to="/courses" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl" onClick={handleLinkClick}>Browse Courses</Link>
              </div>
            </div>
          ) : enrichedPurchases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {enrichedPurchases.map((course) => {
                const courseId = getCourseId(course);
                const courseImage = getCourseImage(course);
                const courseTitle = getCourseTitle(course);
                const courseDescription = getCourseDescription(course);
                const coursePrice = getCoursePrice(course);

                return (
                  <div key={courseId} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group">
                    <div className="relative overflow-hidden">
                      <img
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        src={courseImage}
                        alt={courseTitle}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x250/4F46E5/FFFFFF?text=Course+Image";
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">Enrolled ✓</div>
                      <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">Your Course</div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{courseTitle}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">{courseDescription}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300 text-xs">
                          <FaClock className="mr-2 text-blue-500 flex-shrink-0" />
                          <span>Lifetime Access</span>
                        </div>
                        <div className="flex items-start text-gray-700 dark:text-gray-300 text-xs">
                          <FaCheckCircle className="mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Certificate of Completion</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-xl font-bold text-green-600 dark:text-green-400">₹{coursePrice}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">₹{Math.round(coursePrice * 1.5)}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Purchased</span>
                      </div>

                      <Link to={`/courses/${courseId}`} className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105" onClick={handleLinkClick}>
                        <FaPlayCircle className="text-sm" />
                        <span>Continue Learning</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-8xl mb-6 text-gray-300 dark:text-gray-600">🎓</div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Start Your Learning Journey</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto text-lg leading-relaxed">You haven't enrolled in any courses yet. Discover our wide range of programming courses and start building your skills today!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/courses" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105" onClick={handleLinkClick}>Explore All Courses</Link>
                <Link to="/" className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-4 px-8 rounded-xl transition-all duration-200" onClick={handleLinkClick}>Go Home</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Purchases;