import type {
  StripeCheckoutSession,
  CreateCheckoutSessionRequest,
  PaymentWebSocketMessage,
} from "../types/stripe";

// Mock Stripe checkout session creation
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<StripeCheckoutSession> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: `cs_mock_${Date.now()}`,
    url: `https://checkout.stripe.com/mock/${Date.now()}`,
    payment_status: "unpaid",
    customer_email: request.userEmail,
  };
}

// Mock Stripe redirect
export async function redirectToCheckout(sessionId: string) {
  // Simulate redirect delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In a real implementation, this would redirect to Stripe
  // For demo purposes, we'll just log it
  console.log(`Redirecting to Stripe checkout: ${sessionId}`);

  // Simulate successful payment after a delay
  setTimeout(() => {
    // Simulate WebSocket payment success event
    const mockPaymentSuccess: PaymentWebSocketMessage = {
      type: "payment_success",
      orderId: `order_${Date.now()}`,
      sessionId: sessionId,
      amount: 29999, // $299.99 in cents
      status: "paid",
    };

    // Dispatch a custom event that the WebSocket service can listen to
    window.dispatchEvent(
      new CustomEvent("mock_payment_success", {
        detail: mockPaymentSuccess,
      })
    );
  }, 3000);
}

// Mock payment verification
export async function verifyPaymentStatus(
  sessionId: string
): Promise<PaymentWebSocketMessage> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    type: "payment_success",
    orderId: `order_${Date.now()}`,
    sessionId: sessionId,
    amount: 29999,
    status: "paid",
  };
}
