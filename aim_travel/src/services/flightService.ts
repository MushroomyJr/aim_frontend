import axios from "axios";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  roundTrip: boolean;
}

export interface SpringBootTicketRequest {
  origin: string;
  destination: string;
  departureDate: string;
  passengers: number;
  roundTrip: boolean;
}

export interface FlightTicket {
  id: string | null;
  user: any | null;
  origin: string;
  destination: string;
  roundTrip: boolean;
  departureTime: number[];
  arrivalTime: number[];
  returnDepartureTime: number[] | null;
  returnArrivalTime: number[] | null;
  airline: string;
  cost: number;
  price: number;
  stops: number;
  baggage: string | null;
  travelClass: string | null;
}

export interface FlightSearchResponse {
  data: FlightTicket[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

function formatDate(date: Date | null): string | undefined {
  if (!date) return undefined;
  // Format to YYYY-MM-DD
  return date.toISOString().split("T")[0];
}

export async function searchFlights(
  params: Omit<FlightSearchParams, "departureDate" | "returnDate"> & {
    departureDate: Date | null;
    returnDate?: Date | null;
  }
): Promise<FlightSearchResponse> {
  // Build the request body for the Spring Boot API
  const requestBody: SpringBootTicketRequest = {
    origin: params.origin.trim(),
    destination: params.destination.trim(),
    departureDate: params.departureDate
      ? formatDate(params.departureDate)!
      : "",
    passengers: params.passengers,
    roundTrip: params.roundTrip,
  };

  const response = await axios.post(
    "http://localhost:8080/api/v1/tickets/search",
    requestBody
  );
  return response.data;
}
