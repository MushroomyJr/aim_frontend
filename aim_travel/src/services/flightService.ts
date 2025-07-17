import axios from 'axios';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  roundTrip: boolean;
}

function formatDate(date: Date | null): string | undefined {
  if (!date) return undefined;
  // Format to YYYY-MM-DD
  return date.toISOString().split('T')[0];
}

export async function searchFlights(params: Omit<FlightSearchParams, 'departureDate' | 'returnDate'> & { departureDate: Date | null; returnDate?: Date | null }) {
  const payload: FlightSearchParams = {
    origin: params.origin.trim(),
    destination: params.destination.trim(),
    departureDate: formatDate(params.departureDate) || '',
    passengers: params.passengers,
    roundTrip: params.roundTrip,
    ...(params.roundTrip && params.returnDate ? { returnDate: formatDate(params.returnDate) } : {})
  };
  const response = await axios.post('http://localhost:8080/api/v1/tickets/search', payload);
  return response.data;
} 