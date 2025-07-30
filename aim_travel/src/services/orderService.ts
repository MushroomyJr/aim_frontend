import axios from "axios";

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  email: string;
  phone?: string;
}

// Flight ticket creation interface
export interface FlightTicketRequest {
  origin: string;
  destination: string;
  roundTrip: boolean;
  departureTime: string;
  arrivalTime: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  airline: string;
  cost: number;
  stops: number;
  baggage: string;
  travelClass: string;
}

export interface FlightTicketResponse {
  id: number;
  user: {
    id: number;
    email: string;
    name: string;
  };
  origin: string;
  destination: string;
  roundTrip: boolean;
  departureTime: string;
  arrivalTime: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  airline: string;
  cost: number;
  stops: number;
  baggage: string;
  travelClass: string;
}

// Updated to match backend API format
export interface OrderRequest {
  userEmail: string;
  flightTicketIds: number[];
  itineraryNumber: string;
}

export interface OrderResponse {
  orderId: number;
  userEmail: string;
  itineraryNumber: string;
  flightTickets: any[];
  totalCost: number;
  createdAt: string;
  status: string;
}

// Create flight ticket first
export async function createFlightTicket(
  ticketData: FlightTicketRequest,
  userEmail: string
): Promise<FlightTicketResponse> {
  try {
    const response = await axios.post(
      `http://localhost:8080/api/v1/tickets?userEmail=${userEmail}`,
      ticketData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating flight ticket:", error);
    throw error;
  }
}

export async function createOrder(
  orderData: OrderRequest
): Promise<OrderResponse> {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/v1/orders",
      orderData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getOrder(orderId: string): Promise<OrderResponse> {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/v1/orders/${orderId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

export async function cancelOrder(orderId: string): Promise<OrderResponse> {
  try {
    const response = await axios.put(
      `http://localhost:8080/api/v1/orders/${orderId}/cancel`
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
}
