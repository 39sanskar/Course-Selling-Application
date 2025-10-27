import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe(
  "pk_test_51SME5lHSkhPsbjKgi7ke6nZoVVW1FmPOwY7UNNx3ejUVjJzF9quy5SpN8gRrcSohiklCENrXulK53lueShvWQaTY00DZaeTppl"
);

createRoot(document.getElementById("root")).render(
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Elements>
);
