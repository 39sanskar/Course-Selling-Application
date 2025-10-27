import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";
import { FaEdit, FaTrash, FaArrowLeft, FaEye, FaMoon, FaSun } from "react-icons/fa";

function OurCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [imageDisplayMode, setImageDisplayMode] = useState("contain"); // "cover" or "contain"
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

  const admin = JSON.parse(localStorage.getItem("admin"));
  const token = admin?.token;

  if (!token) {
    toast.error("Please login to admin");
    navigate("/admin/login");
  }

  // fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        console.log(response.data.courses);
        setCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.log("error in fetchCourses ", error);
        toast.error("Failed to fetch courses");
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // delete courses code
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${BACKEND_URL}/course/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      const updatedCourses = courses.filter((course) => course._id !== id);
      setCourses(updatedCourses);
    } catch (error) {
      console.log("Error in deleting course ", error);
      toast.error(error.response?.data?.errors || "Error in deleting course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <FaArrowLeft className="text-sm" />
                <span>Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Course Management
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Image Display Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setImageDisplayMode("contain")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    imageDisplayMode === "contain" 
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Full Image
                </button>
                <button
                  onClick={() => setImageDisplayMode("cover")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    imageDisplayMode === "cover" 
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Cropped
                </button>
              </div>
              
              {/* Dark Mode Toggle */}
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500 transition-colors duration-300">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Total Courses</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-green-500 transition-colors duration-300">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {courses.filter(course => course.price < 2000).length}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Budget Courses</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-purple-500 transition-colors duration-300">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {courses.filter(course => course.price >= 2000).length}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Premium Courses</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-orange-500 transition-colors duration-300">
            <Link
              to="/admin/create-course"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <FaEdit className="text-sm" />
              <span>Create New Course</span>
            </Link>
          </div>
        </div>

        {/* Image Display Info */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Current mode:</strong> {imageDisplayMode === "contain" ? "Showing complete images" : "Showing cropped images"}
            {imageDisplayMode === "contain" ? " - Images maintain their original aspect ratio" : " - Images fill the container completely"}
          </p>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-gray-300 dark:text-gray-600">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No Courses Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by creating your first course!
            </p>
            <Link
              to="/admin/create-course"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <FaEdit className="text-sm" />
              <span>Create Your First Course</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course._id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group"
              >
                {/* Course Image */}
                <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={course?.image?.url || "https://via.placeholder.com/400x250?text=Course+Image"}
                    alt={course.title}
                    className={`w-full ${
                      imageDisplayMode === "contain" 
                        ? "h-48 object-contain" // Shows complete image with borders
                        : "h-48 object-cover group-hover:scale-105 transition-transform duration-300" // Cropped image with hover effect
                    }`}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x250?text=Course+Image";
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Price Section */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{course.price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        ₹{Math.round(course.price / 0.8 )}
                      </span>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-semibold">
                      20% OFF
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/courses/${course._id}`}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <FaEye className="text-xs" />
                      <span>View</span>
                    </Link>
                    
                    <Link
                      to={`/admin/update-course/${course._id}`}
                      className="flex-1 flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <FaEdit className="text-xs" />
                      <span>Update</span>
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <FaTrash className="text-xs" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OurCourses;