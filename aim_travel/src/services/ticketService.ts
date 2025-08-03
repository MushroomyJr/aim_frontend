export interface CreateTicketRequest {
  passenger: string;
  dob: string; // Format: "YYYY-MM-DD"
  email?: string | null; // Optional for guest users
  origin: string;
  destination: string;
  roundTrip: boolean;
  departureTime: string; // Format: "YYYY-MM-DDTHH:mm:ss"
  arrivalTime: string;
  returnDepartureTime?: string | null;
  returnArrivalTime?: string | null;
  airline: string;
  cost: number;
  stops: number;
  baggage?: string | null;
  travelClass?: string | null;
}

export interface PaymentSession {
  ticketId: number;
  orderNumber: string;
  passengerName: string;
  email: string | null;
  origin: string;
  destination: string;
  airline: string;
  cost: string;
  paymentSessionUrl: string;
  paymentSessionId: string;
  status: string;
}

export interface OrderDetails {
  orderNumber: string;
  itineraryNumber: string;
  passengerName: string;
  origin: string;
  destination: string;
  airline: string;
  cost: string;
  success: boolean;
  message?: string;
}

export const createTicketWithPayment = async (
  ticketData: CreateTicketRequest
): Promise<PaymentSession> => {
  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/tickets/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("Ticket created successfully:", result);
      return result;
    } else {
      throw new Error(result.message || "Failed to create ticket");
    }
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  sessionId: string,
  status: "paid" | "failed"
): Promise<OrderDetails> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/orders/payment/${sessionId}/${status}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("Payment status updated successfully:", result);
      return result;
    } else {
      throw new Error(result.message || "Failed to update payment status");
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

export const getOrderBySessionId = async (
  sessionId: string
): Promise<OrderDetails> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/orders/session/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("Order details retrieved:", result);
      return result;
    } else {
      throw new Error(result.message || "Failed to get order details");
    }
  } catch (error) {
    console.error("Error getting order details:", error);
    throw error;
  }
};
