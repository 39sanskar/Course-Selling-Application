import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";
import { 
  FaSun, 
  FaMoon, 
  FaUpload, 
  FaDollarSign, 
  FaHeading, 
  FaAlignLeft,
  FaArrowLeft,
  FaPlusCircle
} from "react-icons/fa";

function CourseCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const changePhotoHandler = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImagePreview(reader.result);
        setImage(file);
      };
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim() || !description.trim() || !price || !image) {
      toast.error("Please fill in all fields");
      return;
    }

    if (price < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("image", image);

    const admin = JSON.parse(localStorage.getItem("admin"));
    const token = admin?.token;
    
    if (!token) {
      toast.error("Authentication required");
      navigate("/admin/login");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/course/create`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      
      toast.success(response.data.message || "Course created successfully! 🎉");
      navigate("/admin/our-courses");
      
      // Reset form
      setTitle("");
      setPrice("");
      setImage("");
      setDescription("");
      setImagePreview("");
      
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.errors || "Failed to create course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/admin/our-courses");
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Header with Dark Mode Toggle */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Courses</span>
          </button>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FaSun className="text-yellow-500 text-xl" />
            ) : (
              <FaMoon className="text-gray-600 text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-3xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <FaPlusCircle className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create New Course</h1>
                <p className="text-blue-100 mt-2">
                  Fill in the details below to create an amazing course
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleCreateCourse} className="space-y-8">
              {/* Title Field */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
                  <FaHeading  className="text-blue-500"/>
                  <span>Course Title</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Advanced React Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
                  <FaAlignLeft className="text-green-500" />
                  <span>Course Description</span>
                </label>
                <textarea
                  placeholder="Describe what students will learn in this course..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-vertical"
                  required
                />
              </div>

              {/* Price Field */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
                  <FaDollarSign className="text-yellow-500" />
                  <span>Course Price</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="100"
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl outline-none focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Image Upload Field */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
                  <FaUpload className="text-purple-500" />
                  <span>Course Image</span>
                </label>
                
                {/* Image Preview */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-full max-w-md h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400">
                    <img
                      src={imagePreview || "/imgPL.webp"}
                      alt="Course preview"
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        imagePreview ? 'opacity-100' : 'opacity-60'
                      }`}
                    />
                    {!imagePreview && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <FaUpload className="text-3xl mb-2" />
                        <p className="text-sm">Upload course image</p>
                      </div>
                    )}
                  </div>

                  {/* File Input */}
                  <label className="cursor-pointer">
                    <div className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                      <FaUpload />
                      <span>Choose Image</span>
                    </div>
                    <input
                      type="file"
                      onChange={changePhotoHandler}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Recommended: 400x200px, max 5MB
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white flex items-center justify-center space-x-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Course...</span>
                  </>
                ) : (
                  <>
                    <FaPlusCircle />
                    <span>Create Course</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            💡 Quick Tips
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-sm">
            <li>• Use clear and descriptive titles that attract students</li>
            <li>• Write detailed descriptions highlighting key learning outcomes</li>
            <li>• Choose high-quality, relevant images for better engagement</li>
            <li>• Set competitive pricing based on course content and duration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CourseCreate;