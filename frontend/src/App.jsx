import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import Purchases from "./components/Purchases";
import Buy from "./components/Buy";
import Courses from "./components/Courses";
import AdminSignup from "./admin/AdminSignup";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/Dashboard";
import CourseCreate from "./admin/CourseCreate";
import UpdateCourse from "./admin/UpdateCourse";
import OurCourses from "./admin/OurCourses";
// Import Stripe specific components
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const admin = JSON.parse(localStorage.getItem("admin"));

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Other Routes */}
        <Route path="/courses" element={<Courses />} />

        {/* Wrap Buy component with Elements provider */}
        <Route
          path="/buy/:courseId"
          element={
            <Elements stripe={stripePromise}>
              <Buy />
            </Elements>
          }
        />

        <Route
          path="/purchases"
          element={user ? <Purchases /> : <Navigate to={"/login"} />}
        />

        {/* Admin Routes */}
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={admin ? <Dashboard /> : <Navigate to={"/admin/login"} />}
        />
        <Route
          path="/admin/create-course"
          element={admin ? <CourseCreate /> : <Navigate to={"/admin/login"} />} // Protect admin routes
        />
        <Route
          path="/admin/update-course/:id"
          element={admin ? <UpdateCourse /> : <Navigate to={"/admin/login"} />} // Protect admin routes
        />
        <Route
          path="/admin/our-courses"
          element={admin ? <OurCourses /> : <Navigate to={"/admin/login"} />} // Protect admin routes
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
