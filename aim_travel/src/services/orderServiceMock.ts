import type { FlightTicketRequest, OrderRequest, OrderResponse } from "./orderService";

// Mock flight ticket creation
export async function createFlightTicket(
  ticketData: FlightTicketRequest,
  userEmail: string
): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    user: {
      id: 1,
      email: userEmail,
      name: userEmail.split('@')[0],
    },
    ...ticketData,
  };
}

// Mock order creation with Stripe
export async function createOrderWithStripe(
  orderData: OrderRequest,
  stripeSessionId: string
): Promise<OrderResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    orderId: Math.floor(Math.random() * 10000) + 1,
    userEmail: orderData.userEmail,
    itineraryNumber: orderData.itineraryNumber,
    flightTickets: [],
    totalCost: 299.99,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };
} 