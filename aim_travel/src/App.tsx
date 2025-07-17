import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import { searchFlights } from "./services/flightService";
import type { TicketInfo } from "./components/ticketresultcard/TicketResultCard";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (params: any) => {
    setLoading(true);
    setPage(1);
    setLastSearchParams(params);
    setError(null);
    try {
      const result = await searchFlights({ ...params, page: 1 });
      console.log("API Response:", result);
      const tickets = (result.data || []).map((ticket: any) => ({
        airline: ticket.airlineName || ticket.airline || "",
        price: ticket.price,
        departure: ticket.departureTime,
        arrival: ticket.arrivalTime,
        duration: ticket.duration,
        stops: ticket.stops,
      }));
      console.log("Mapped tickets:", tickets);
      setTickets(tickets);
      setTotalPages(result.pagination?.totalPages || 1);
      setError(null);
    } catch (error: any) {
      setTickets([]);
      setTotalPages(1);
      setError(
        error?.response?.data?.message ||
          "An error occurred while searching for flights."
      );
    } finally {
      setLoading(false);
      navigate("/results");
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (!lastSearchParams) return;
    setLoading(true);
    setPage(newPage);
    try {
      const result = await searchFlights({
        ...lastSearchParams,
        page: newPage,
      });
      const tickets = (result.data || []).map((ticket: any) => ({
        airline: ticket.airlineName || ticket.airline || "",
        price: ticket.price,
        departure: ticket.departureTime,
        arrival: ticket.arrivalTime,
        duration: ticket.duration,
        stops: ticket.stops,
      }));
      setTickets(tickets);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      setTickets([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage onSearch={handleSearch} />} />
      <Route
        path="/results"
        element={
          <ResultsPage
            loading={loading}
            tickets={tickets}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            error={error}
          />
        }
      />
    </Routes>
  );
}

export default App;
