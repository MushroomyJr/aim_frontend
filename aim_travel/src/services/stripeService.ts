import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import type {
  StripeCheckoutSession,
  CreateCheckoutSessionRequest,
  PaymentWebSocketMessage,
} from "../types/stripe";

// Re-export types for backward compatibility
export type {
  StripeCheckoutSession,
  CreateCheckoutSessionRequest,
  PaymentWebSocketMessage,
};

// Initialize Stripe (you'll need to replace with your actual publishable key)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51Rr6S8EMe6uiUy78qMaiP1chYDylNOyep9BQmvgUHIwdX68bD7SzP3alZmktorGUXIBKUaZ7wFswYiKS9TLwkF6900PGNBBdbt"
);

// Create a Stripe checkout session
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<StripeCheckoutSession> {
  try {
    console.log("Creating checkout session for:", request);

    // Make API call to your Spring backend
    const response = await axios.post(
      "http://localhost:8080/api/v1/stripe/create-checkout-session",
      request,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

// Get Stripe instance
export async function getStripe() {
  return await stripePromise;
}

// Redirect to Stripe checkout using Stripe.js
export async function redirectToCheckout(sessionId: string) {
  try {
    const stripe = await getStripe();

    if (!stripe) {
      throw new Error("Stripe failed to load");
    }

    console.log("Redirecting to Stripe checkout for session:", sessionId);

    // Use Stripe's redirectToCheckout method
    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });

    if (error) {
      console.error("Error redirecting to checkout:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error redirecting to checkout:", error);
    throw error;
  }
}

// Verify payment status
export async function verifyPaymentStatus(
  sessionId: string
): Promise<PaymentWebSocketMessage> {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/v1/stripe/verify-payment/${sessionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying payment status:", error);
    throw error;
  }
}
