import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { BACKEND_URL } from "../utils/utils";
import CourseCardSkeleton from "./CourseCardSkeleton";

function Buy() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [course, setCourse] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");
  const [cardError, setCardError] = useState("");

  // Get user from localStorage safely
  const getUser = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : {};
    } catch (error) {
      console.error("Error parsing user data:", error);
      return {};
    }
  };

  const user = getUser();
  const token = user?.token;

  useEffect(() => {
    console.log("[BUY] Component mounted");
    console.log("[BUY] Course ID:", courseId);
    console.log("[BUY] User token:", token ? "Token exists" : "No token");
    console.log("[BUY] Full user object:", user);

    if (!token) {
      console.log("[BUY] No token found, redirecting to login");
      toast.error("Please login to purchase courses.");
      navigate("/login");
      return;
    }

    if (!courseId) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("🛒 [BUY] Making request to:", `${BACKEND_URL}/course/buy/${courseId}`);

        const response = await axios.post(
          `${BACKEND_URL}/course/buy/${courseId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true,
          }
        );

        console.log("Backend response:", response.data);

        if (!response.data.course || !response.data.clientSecret) {
          console.log("[BUY] Missing course or clientSecret in response");
          setError("Failed to load course or payment info.");
          toast.error("Failed to load course or payment info.");
          return;
        }

        setCourse(response.data.course);
        setClientSecret(response.data.clientSecret);
        console.log("[BUY] Course and client secret set successfully");

      } catch (err) {
        console.error("[BUY] Error fetching course:", err);
        console.error("[BUY] Error response:", err.response);
        console.error("[BUY] Error status:", err.response?.status);
        console.error("[BUY] Error data:", err.response?.data);
        let errorMessage = "Failed to fetch course.";
        
        if (err.response?.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
          console.log("[BUY] 401 Unauthorized - token might be invalid");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        } else if (err.response?.status === 404) {
          errorMessage = "Course not found.";
        } else if (err.response?.data?.errors) {
          errorMessage = Array.isArray(err.response.data.errors) 
            ? err.response.data.errors.join(', ') 
            : err.response.data.errors;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate, token]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    setCardError("");

    if (!stripe || !elements) {
      setCardError("Stripe.js has not loaded yet. Please wait...");
      return;
    }

    if (!clientSecret) {
      setCardError("Payment not initialized. Please refresh the page.");
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setCardError("Card input not found.");
      return;
    }

    setProcessingPayment(true);

    try {
      console.log("[BUY] Processing payment...");
      
      // Confirm payment
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name: user?.user?.firstName || "Customer",
              email: user?.user?.email || "customer@example.com",
            },
          },
        });

      if (confirmError) {
        console.error("[BUY] Stripe confirmation error:", confirmError);
        setCardError(confirmError.message);
        toast.error(`Payment failed: ${confirmError.message}`);
        return;
      }

      console.log("[BUY] Payment Intent Status:", paymentIntent.status);
      
      if (paymentIntent.status === "succeeded") {
        toast.success("Payment successful! Saving your purchase...");

        try {
          const orderPayload = {
            email: user?.user?.email || "",
            courseId: courseId,
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
          };

          console.log("[BUY] Sending order payload:", orderPayload);

          const saveResponse = await axios.post(
            `${BACKEND_URL}/order`,
            orderPayload,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              withCredentials: true,
            }
          );

          console.log("[BUY] Purchase saved successfully:", saveResponse.data);
          toast.success("Course purchased successfully! Redirecting...");

          setTimeout(() => {
            navigate("/purchases", { replace: true });
          }, 2000);

        } catch (saveError) {
          console.error("[BUY] Save error:", saveError.response?.data || saveError.message);
          
          let saveErrorMessage = "Error saving purchase";
          if (saveError?.response?.data?.errors) {
            saveErrorMessage = Array.isArray(saveError.response.data.errors) 
              ? saveError.response.data.errors.join(', ') 
              : saveError.response.data.errors;
          } else if (saveError?.response?.data?.message) {
            saveErrorMessage = saveError.response.data.message;
          }

          toast.error(`Save failed: ${saveErrorMessage}`);

          setTimeout(() => {
            navigate("/purchases", { replace: true });
          }, 4000);
        }
      } else {
        toast.error(`Payment not completed. Status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error("[BUY] Payment processing error:", err);
      toast.error("An unexpected error occurred during payment processing.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return <CourseCardSkeleton />;

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <div className="bg-red-700 text-white p-6 rounded-lg text-center max-w-md">
          <p className="text-xl font-bold mb-4">{error}</p>
          <Link
            to="/courses"
            className="bg-orange-500 px-6 py-3 rounded hover:bg-orange-600 transition inline-block"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <div className="bg-red-700 text-white p-6 rounded-lg text-center max-w-md">
          <p className="text-xl font-bold mb-4">Course not found</p>
          <Link
            to="/courses"
            className="bg-orange-500 px-6 py-3 rounded hover:bg-orange-600 transition inline-block"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-4xl w-full flex flex-col md:flex-row text-white">
        {/* Course Details */}
        <div className="md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-gray-700 mb-8 md:mb-0">
          <h2 className="text-3xl font-bold text-orange-500 mb-6">
            Order Details
          </h2>
          <p className="text-xl text-gray-300 mb-2">Course Name:</p>
          <p className="text-2xl font-bold text-white mb-4">{course.title}</p>
          <p className="text-xl text-gray-300 mb-2">Description:</p>
          <p className="text-sm text-gray-400 mb-4 line-clamp-3">
            {course.description}
          </p>
          <p className="text-xl text-gray-300 mb-2">Price:</p>
          <p className="text-3xl font-bold text-red-500">₹{course.price || 0}</p>
        </div>

        {/* Payment Form */}
        <div className="md:w-1/2 p-4 flex justify-center items-center">
          <form
            onSubmit={handlePurchase}
            className="bg-gray-700 p-6 rounded-lg w-full max-w-sm"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              Complete Payment
            </h2>
            <div className="mb-4 p-4 bg-gray-600 rounded">
              <CardElement
                options={{
                  style: {
                    base: {
                      color: "#E0E0E0",
                      fontSize: "16px",
                      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                      "::placeholder": {
                        color: "#A0A0A0",
                      },
                    },
                    invalid: {
                      color: "#EF4444",
                      iconColor: "#EF4444",
                    },
                  },
                  hidePostalCode: true,
                }}
              />
            </div>
            {cardError && (
              <p className="text-red-500 mb-4 text-center text-sm bg-red-900 p-2 rounded">
                {cardError}
              </p>
            )}
            <button
              type="submit"
              disabled={!stripe || processingPayment || !clientSecret}
              className="w-full py-3 rounded bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition text-white font-semibold text-lg"
            >
              {processingPayment
                ? "Processing Payment..."
                : `Pay ₹${course.price || 0}`}
            </button>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Test Card: 4242 4242 4242 4242 | Any future date | Any CVC | Any ZIP
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Buy;
