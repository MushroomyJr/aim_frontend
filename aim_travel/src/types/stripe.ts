export interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_status: string;
  customer_email: string;
}

export interface CreateCheckoutSessionRequest {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
}

export interface PaymentWebSocketMessage {
  type: "payment_success" | "payment_failed" | "payment_pending";
  orderId: string;
  sessionId: string;
  amount: number;
  status: string;
}
