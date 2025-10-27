import React, { useEffect, useState } from "react";
import logo from "../../public/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaLaptopCode, FaChalkboardTeacher, FaClock, FaCertificate,FaFacebook, FaTwitter, FaInstagram, FaMoon, FaSun } from "react-icons/fa";

import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";
import PopularCourses from "./PopularCourses";

function Home() {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Default to light mode
  const navigate = useNavigate(); 

  // Check user login
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!token || !!user);
    // Initialize dark mode from localStorage if available
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        setCourses(response.data.courses || []);
      } catch (error) {
        console.log("Error in fetchCourses", error);
      }
    };
    fetchCourses();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userData");
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.log("Error in logout", error);
      toast.error(error.response?.data?.errors || "Logout failed");
    }
  };

  // Handle Get Started button click
  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/courses");
    } else {
      navigate("/signup");
    }
  };

  // Handle Enroll Now button click
  const handleEnrollNow = (courseId, courseTitle) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { 
        state: { 
          from: { 
            pathname: `/buy/${courseId}`,
            courseTitle: courseTitle
          } 
        } 
      });
    } else {
      navigate(`/buy/${courseId}`);
    }
  };

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, slidesToScroll: 2 },
      },
      {
        breakpoint: 768, // Adjusted for typical tablet sizes
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 640, // Adjusted for smaller tablets/large phones
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "dark bg-[#121212]" : "bg-white"
      } text-gray-900 dark:text-gray-100 transition-colors duration-500`}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 shadow-md bg-white dark:bg-[#1e1e1e]">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
          <h1 className="text-2xl font-bold text-[#0056D2] dark:text-[#2E8BFF]">
            CodingHub
          </h1>
        </div>

        {/* Desktop Navigation - Hidden on small screens */}
        <nav className="hidden md:flex space-x-8 text-gray-700 dark:text-gray-200 font-semibold">
          <Link to="/" className="hover:text-[#0056D2] dark:hover:text-[#2E8BFF] transition-colors duration-200">Home</Link>
          <Link to="/courses" className="hover:text-[#0056D2] dark:hover:text-[#2E8BFF] transition-colors duration-200">Courses</Link>
          <Link to="/purchases" className="hover:text-[#0056D2] dark:hover:text-[#2E8BFF] transition-colors duration-200">Purchases</Link>
          <Link to="/settings" className="hover:text-[#0056D2] dark:hover:text-[#2E8BFF] transition-colors duration-200">Settings</Link>
        </nav>

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

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="border border-[#0056D2] text-[#0056D2] dark:border-[#2E8BFF] dark:text-[#2E8BFF] font-semibold py-2 px-5 rounded-lg hover:bg-[#0056D2] hover:text-white dark:hover:bg-[#2E8BFF] transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-[#0056D2] dark:bg-[#2E8BFF] text-white font-semibold py-2 px-5 rounded-lg hover:opacity-90 transition"
              >
                Signup
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area - Adjust padding-top for fixed header */}
      <div className="pt-20"> {/* This padding accounts for the fixed header */}
        {/* Hero Section */}
        <section className="relative text-center py-24 px-6 bg-gradient-to-r from-[#89B9EE] to-[#B39DDB] dark:from-[#0f172a] dark:to-[#1e293b] overflow-hidden">
          {/* Background circles/shapes for visual interest */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-[#0056D2] dark:bg-[#2E8BFF] opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-teal-400 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-purple-400 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-6xl font-extrabold mb-6 text-gray-900 dark:text-white leading-tight">
              Unlock Your Potential with Expert-Led Coding Courses
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-10">
              Master the latest technologies through practical, project-based learning.
              Start your journey with us today!
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-block bg-[#FF8C00] hover:bg-[#e07b00] dark:bg-[#2E8BFF] dark:hover:bg-[#0056D2] text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {isLoggedIn ? "Browse Courses" : "Explore Courses"}
            </button>
          </div>
        </section>

        {/* Key Features/Value Proposition Section */}
        <section className="py-16 bg-white dark:bg-[#1e1e1e] px-8">
          <h2 className="text-4xl font-bold mb-12 text-center text-[#0056D2] dark:text-[#2E8BFF]">
            Why Choose CodingHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {/* Feature 1: Flexible Learning */}
            <div className="text-center p-6 rounded-lg shadow-xl dark:bg-[#2a2a2a] transform hover:scale-105 transition-transform duration-300">
              <FaGraduationCap className="text-5xl text-[#FF8C00] dark:text-[#2E8BFF] mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Flexible Learning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Study at your own pace, anytime, anywhere.
              </p>
            </div>

            {/* Feature 2: Hands-on Coding */}
            <div className="text-center p-6 rounded-lg shadow-xl dark:bg-[#2a2a2a] transform hover:scale-105 transition-transform duration-300">
              <FaLaptopCode className="text-5xl text-[#FF8C00] dark:text-[#2E8BFF] mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Hands-on Coding</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn by building real projects with live coding exercises.
              </p>
            </div>

            {/* Feature 3: Expert Mentors */}
            <div className="text-center p-6 rounded-lg shadow-xl dark:bg-[#2a2a2a] transform hover:scale-105 transition-transform duration-300">
              <FaChalkboardTeacher className="text-5xl text-[#FF8C00] dark:text-[#2E8BFF] mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Expert Mentors</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn from experienced instructors guiding you step-by-step.
              </p>
            </div>

            {/* Feature 4: Learn Anytime */}
            <div className="text-center p-6 rounded-lg shadow-xl dark:bg-[#2a2a2a] transform hover:scale-105 transition-transform duration-300">
              <FaClock className="text-5xl text-[#FF8C00] dark:text-[#2E8BFF] mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Learn Anytime</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access your courses 24/7 on any device, wherever you are.
              </p>
            </div>

            {/* Feature 5: Certification */}
            <div className="text-center p-6 rounded-lg shadow-xl dark:bg-[#2a2a2a] transform hover:scale-105 transition-transform duration-300">
              <FaCertificate className="text-5xl text-[#FF8C00] dark:text-[#2E8BFF] mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Certification</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Earn certificates to showcase your skills and achievements.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg shadow-xl dark:bg-[#2a2a2a] transform hover:scale-105 transition-transform duration-300">
              <FaSun className="text-5xl text-[#FF8C00] dark:text-[#2E8BFF] mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Hands-on Learning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Dive deep into real-world projects and build a strong portfolio.
              </p>
            </div>
          </div>
        </section>

        {/* Courses Slider */}
        <section className="p-10 py-16 bg-gray-50 dark:bg-[#121212]">
          <h2 className="text-4xl font-bold mb-12 text-center text-[#0056D2] dark:text-[#2E8BFF]">
            Popular Courses
          </h2>
          <div className="max-w-7xl mx-auto">
            <Slider {...settings}>
              {courses.map((course) => (
                <div key={course._id} className="p-4">
                  <div className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transform transition duration-300 hover:scale-[1.02]">
                    <img
                      src={course.image?.url || "https://via.placeholder.com/400x250?text=Course+Image"}
                      alt={course.title}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-5 text-left">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white truncate">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {course.description || "A comprehensive course to master the fundamentals of this topic."}
                      </p>
                      <button
                        onClick={() => handleEnrollNow(course._id, course.title)}
                        className="block w-full text-center bg-[#0056D2] dark:bg-[#2E8BFF] hover:bg-[#0044b3] dark:hover:bg-[#1f7ae0] text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </section>

     <section className="bg-[#f5f3f0] py-4 px-4 md:px-12">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-8">
        
            {/* Text Content */}
            <div className="flex-1">
              <h2 className="text-5xl md:text-4xl font-bold mb-4 text-gray-800">
               About CodingHub 
              </h2>

            <div className="bg-gradient-to-r from-[#e7d7f7] to-[#d8c3a5] rounded-2xl p-6 md:p-10 shadow-md text-gray-800 leading-relaxed">
              <p className="mb-3">Welcome to the CodingHub.</p>

              <p className="mb-3">
              This is a dedicated space where developers of all levels can explore, learn, and practice programming through real-world projects
              </p>

              <p className="mb-3">
             Our goal is to transform learners into skilled engineers by providing hands-on experience, mentorship, and a community of like-minded coders.
              </p>
              <p className="mb-3">
             Here, you can sharpen your coding skills, collaborate on exciting open-source projects, and gain the confidence to tackle complex challenges in the software world.
              </p>

              <p>
              Join us at the Coding Hub and take the next step in your journey to becoming a proficient and innovative programmer.
              </p>
            </div>
          </div>
        </div>
      </section>


        {/* Testimonials/Call to Action - Optional, but good for a home page */}
        <section className="py-16 bg-[#E8F1FF] dark:bg-[#1e1e1e] text-center px-8">
          <h2 className="text-4xl font-bold mb-8 text-[#0056D2] dark:text-[#2E8BFF]">
            Ready to Start Your Coding Journey?
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-700 dark:text-gray-300 mb-10">
            Join thousands of students who are transforming their careers with CodingHub.
            {isLoggedIn ? " Continue your learning journey!" : " Sign up today and unlock a world of opportunities."}
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-block bg-[#FF8C00] hover:bg-[#e07b00] dark:bg-[#2E8BFF] dark:hover:bg-[#0056D2] text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {isLoggedIn ? "Continue Learning" : "Get Started Free"}
          </button>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-10 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
              <h1 className="text-2xl font-bold text-orange-500">CodingHub</h1>
            </div>
            <p className="text-gray-400 text-sm">
              Your hub for mastering coding skills and advancing your career.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors duration-200">Terms & Conditions</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors duration-200">Refunds & Cancellation Policy</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/faq" className="hover:text-white transition-colors duration-200">FAQ</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors duration-200">Help Center</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Follow Us</h3>
            <div className="flex space-x-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                <FaFacebook className="text-2xl" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors duration-200">
                <FaInstagram className="text-2xl" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 transition-colors duration-200">
                <FaTwitter className="text-2xl" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} CodingHub — All Rights Reserved
        </div>
      </footer>
    </div>
  );
}

export default Home;