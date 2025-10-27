import React from "react";
import Slider from "react-slick";
import { Link, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PopularCourses = ({ courses = [] }) => {
  const navigate = useNavigate(); // ✅ Added navigate hook

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 }
      },
      {
        breakpoint: 640,
        settings: { 
          slidesToShow: 1,
          dots: false
        }
      },
    ],
  };

  //  FIX: Handle enroll click with authentication check
  const handleEnrollClick = (courseId, courseTitle) => {
  console.log(" Enroll clicked for:", courseTitle, courseId);
  
  // Check if user is logged in
  const userData = localStorage.getItem("user");
  console.log(" User data from localStorage:", userData);
  
  let user = null;
  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
  
  const hasValidToken = user?.token;
  console.log(" User has valid token:", hasValidToken);
  
  if (!hasValidToken) {
    console.log(" User not authenticated, redirecting to login");
    // FIX: Use consistent route - /buy/:courseId
    navigate("/login", { 
      state: { 
        from: { 
          pathname: `/buy/${courseId}`,
          courseTitle: courseTitle
        } 
      } 
    });
   } else {
    console.log(" User authenticated, going to purchase page");
    // FIX: Use consistent route - /buy/:courseId
    navigate(`/buy/${courseId}`);
   }
  };

  // Use real courses data passed from Home.jsx
  const displayCourses = courses.length > 0 ? courses : [
    // Fallback sample data
    {
      _id: "68fe8d63af353b79fd3d921c",
      title: "Full Stack Development",
      description: "Build complete web applications from frontend to backend! Master HTML, CSS, JavaScript, React, Node.js, and databases. Create stunning UIs and powerful APIs in one comprehensive skillset.",
      image: "https://res.cloudinary.com/dj0ightes/image/upload/v1761512802/aelqigppcws25ewf1wyl.png",
      price: 999
    },
    {
      _id: "68fe8e5caf353b79fd3d9220",
      title: "Machine Learning",
      description: "Teach computers to learn and predict! Master Python, TensorFlow, and neural networks. Build AI models that recognize patterns, make decisions, and automate intelligent tasks.",
      image: "https://res.cloudinary.com/dj0ightes/image/upload/v1761513052/bgvp5milfaxhgcx5wdca.png",
      price: 1299
    },
    {
      _id: "68fe8fb9af353b79fd3d9223",
      title: "Cloud Computing",
      description: "Deploy and scale applications globally! Master AWS, Azure, and GCP. Learn infrastructure, storage, and serverless computing to build scalable, cost-effective solutions.",
      image: "https://res.cloudinary.com/dj0ightes/image/upload/v1761513401/zjqzzcaqyksatwc7wvfk.png",
      price: 1199
    },
    {
      _id: "68fe9039af353b79fd3d9226",
      title: "Mobile Development",
      description: "Build apps for billions of users! Master React Native, Flutter, or native iOS/Android development. Create responsive, feature-rich mobile experiences that users love.",
      image: "https://res.cloudinary.com/dj0ightes/image/upload/v1761513529/bcotxfjfxgxvgls1h1uj.png",
      price: 1099
    },
    {
      _id: "68fe90cfaf353b79fd3d9229",
      title: "Algorithms & DSA",
      description: "Think like a coding expert! Master data structures, algorithms, and problem-solving. Ace technical interviews and write efficient, scalable code that stands out.",
      image: "https://res.cloudinary.com/dj0ightes/image/upload/v1761513679/tavyqhlklrqirxinphue.png",
      price: 899
    },
    {
      _id: "68fe9122af353b79fd3d922c",
      title: "Game Development",
      description: "Create immersive gaming worlds! Master Unity, Unreal Engine, and game design principles. Build 2D/3D games from concept to deployment across multiple platforms",
      image: "https://res.cloudinary.com/dj0ightes/image/upload/v1761513762/t5sq5bydlbddhzfparag.png",
      price: 1499
    },
    {
      _id: "68fe915faf353b79fd3d922f",
      title: "DevOps",
      description: "Bridge development and operations! Master CI/CD, Docker, Kubernetes, and cloud infrastructure. Automate deployments and ensure reliable, scalable software delivery.",
      image: "https://res.cloudinary.com/dj0ightes/image/upload/v1761513823/rzxcunby90wac0ea6ril.png",
      price: 1399
    },
  ];

  return (
    <section className="p-10 py-16 bg-gray-50 dark:bg-[#121212]">
      <h2 className="text-4xl font-bold mb-12 text-center text-[#0056D2] dark:text-[#2E8BFF]">
        Popular Courses
      </h2>
      <div className="max-w-7xl mx-auto">
        <Slider {...settings}>
          {displayCourses.map((course) => (
            <div key={course._id} className="p-4 group">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 group-hover:border-blue-500 dark:group-hover:border-blue-400">
                
                <div className="relative overflow-hidden rounded-lg mb-4 w-full h-40">
                  <img
                    src={course.image?.url || course.image || "/default-course.jpg"}
                    alt={course.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Course+Image";
                    }}
                  />
                </div>
                
                <h3 className="h-6 font-bold mb-2 text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {course.title}
                </h3>
                
                <p className="h-12 text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{course.price || "999"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      ₹{Math.round((course.price || 999) * 1.25)}
                    </span>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-semibold">
                    20% OFF
                  </div>
                </div>

                {/*FIXED: Replace Link with button that handles authentication */}
                <button
                  onClick={() => handleEnrollClick(course._id, course.title)}
                  className="w-full text-center bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default PopularCourses;