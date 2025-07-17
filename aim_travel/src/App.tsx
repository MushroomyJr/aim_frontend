import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import { searchFlights } from './services/flightService';
import type { TicketInfo } from './components/ticketresultcard/TicketResultCard';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);
  const navigate = useNavigate();

  const handleSearch = async (params: any) => {
    console.log('Searching...', params);
    setLoading(true);
    setPage(1);
    setLastSearchParams(params);
    try {
      const result = await searchFlights({ ...params, page: 1 });
      // If result.tickets is an array of raw backend objects:
      const tickets = (result.tickets || []).map((ticket: any) => ({
        airline: ticket.airlineName || ticket.airline || '',
        price: ticket.price,
        departure: ticket.departureTime,
        arrival: ticket.arrivalTime,
        duration: ticket.duration,
      }));
      setTickets(tickets);
      setTotalPages(result.totalPages || 1);
      console.log('Navigating to results');
      navigate('/results');
    } catch (error) {
      setTickets([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (!lastSearchParams) return;
    setLoading(true);
    setPage(newPage);
    try {
      const result = await searchFlights({ ...lastSearchParams, page: newPage });
      const tickets = (result.tickets || []).map((ticket: any) => ({
        airline: ticket.airlineName || ticket.airline || '',
        price: ticket.price,
        departure: ticket.departureTime,
        arrival: ticket.arrivalTime,
        duration: ticket.duration,
      }));
      setTickets(tickets);
      setTotalPages(result.totalPages || 1);
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
      <Route path="/results" element={<ResultsPage loading={loading} tickets={tickets} page={page} totalPages={totalPages} onPageChange={handlePageChange} />} />
    </Routes>
  );
}

export default App;
