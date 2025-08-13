import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import OrderForm from "./components/orderform/OrderForm";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import StripeDemo from "./components/stripecheckout/StripeDemo";
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
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const navigate = useNavigate();

  const handleSearch = async (params: any) => {
    setLoading(true);
    setPage(1);
    setLastSearchParams(params);
    setError(null);
    try {
      const result = await searchFlights({ ...params, page: 1 });
      console.log("API Response:", result);
      const tickets = (result.data || []).map((ticket: any) => {
        console.log("Processing ticket:", ticket);
        console.log("Ticket price:", ticket.price);
        console.log("Ticket cost:", ticket.cost);
        return {
          airline: ticket.airlineName || ticket.airline || "",
          price: ticket.price || ticket.cost || 0,
          departure: ticket.departureTime,
          arrival: ticket.arrivalTime,
          duration: ticket.duration,
          stops: ticket.stops,
          origin: ticket.origin,
          destination: ticket.destination,
          roundTrip: ticket.roundTrip,
          baggage: ticket.baggage,
          travelClass: ticket.travelClass,
        };
      });
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
      const tickets = (result.data || []).map((ticket: any) => {
        console.log("Processing ticket (page change):", ticket);
        console.log("Ticket price (page change):", ticket.price);
        console.log("Ticket cost (page change):", ticket.cost);
        return {
          airline: ticket.airlineName || ticket.airline || "",
          price: ticket.price || ticket.cost || 0,
          departure: ticket.departureTime,
          arrival: ticket.arrivalTime,
          duration: ticket.duration,
          stops: ticket.stops,
          origin: ticket.origin,
          destination: ticket.destination,
          roundTrip: ticket.roundTrip,
          baggage: ticket.baggage,
          travelClass: ticket.travelClass,
        };
      });
      setTickets(tickets);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      setTickets([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    navigate("/order");
  };

  const handleOrderComplete = (newOrderId: string, details?: any) => {
    setOrderId(newOrderId);
    setOrderDetails(details);
    navigate("/confirmation");
  };

  const handleBackToSearch = () => {
    setSelectedTicket(null);
    setOrderId(null);
    setOrderDetails(null);
    // Clear stored session ID
    localStorage.removeItem("stripeSessionId");
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage onSearch={handleSearch} />} />
      <Route path="/stripe-demo" element={<StripeDemo />} />
      <Route
        path="/results"
        element={
          <ResultsPage
            loading={loading}
            tickets={tickets}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onBookTicket={handleBookTicket}
            error={error}
          />
        }
      />
      <Route
        path="/order"
        element={
          selectedTicket ? (
            <OrderForm
              ticket={selectedTicket}
              onOrderComplete={handleOrderComplete}
              onBack={() => navigate("/results")}
            />
          ) : (
            <div>Redirecting...</div>
          )
        }
      />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route
        path="/confirmation"
        element={
          orderId ? (
            <OrderConfirmationPage
              orderId={orderId}
              orderDetails={orderDetails}
              onBackToSearch={handleBackToSearch}
            />
          ) : (
            <div>Redirecting...</div>
          )
        }
      />
    </Routes>
  );
}

export default App;
