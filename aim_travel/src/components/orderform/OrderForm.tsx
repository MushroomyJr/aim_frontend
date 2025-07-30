import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import PaymentIcon from "@mui/icons-material/Payment";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PersonIcon from "@mui/icons-material/Person";
import FlightIcon from "@mui/icons-material/Flight";
import {
  type OrderRequest,
  type FlightTicketRequest,
  createOrder,
  createFlightTicket,
} from "../../services/orderService";

interface OrderFormProps {
  ticket: any;
  onOrderComplete: (orderId: string) => void;
  onBack: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  ticket,
  onOrderComplete,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create flight ticket
      const flightTicketData: FlightTicketRequest = {
        origin: ticket.origin || "JFK",
        destination: ticket.destination || "LAX",
        roundTrip: ticket.roundTrip || false,
        departureTime: ticket.departure || new Date().toISOString(),
        arrivalTime: ticket.arrival || new Date().toISOString(),
        airline: ticket.airline || "American Airlines",
        cost: ticket.price || 450.0,
        stops: ticket.stops || 0,
        baggage: "1 checked bag",
        travelClass: "Economy",
      };

      const flightTicket = await createFlightTicket(
        flightTicketData,
        userEmail
      );
      console.log("Flight ticket created:", flightTicket);

      // Step 2: Create order with the flight ticket ID
      const itineraryNumber = `ITN${Date.now()}`;

      const orderData: OrderRequest = {
        userEmail: userEmail,
        flightTicketIds: [flightTicket.id],
        itineraryNumber: itineraryNumber,
      };

      const response = await createOrder(orderData);
      console.log("Order created:", response);
      onOrderComplete(response.orderId.toString());
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Complete Your Order
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Flight Details
              </Typography>
              <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body1">
                  <strong>Airline:</strong> {ticket.airline}
                </Typography>
                <Typography variant="body1">
                  <strong>Price:</strong> ${ticket.price}
                </Typography>
                <Typography variant="body1">
                  <strong>Departure:</strong> {ticket.departure}
                </Typography>
                <Typography variant="body1">
                  <strong>Arrival:</strong> {ticket.arrival}
                </Typography>
                <Typography variant="body1">
                  <strong>Duration:</strong> {ticket.duration}
                </Typography>
              </Card>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  helperText="We'll send your booking confirmation to this email"
                  sx={{ mb: 2 }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={onBack}
                    disabled={loading}
                  >
                    Back to Results
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !userEmail}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <PaymentIcon />
                    }
                  >
                    {loading ? "Creating Order..." : "Complete Order"}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default OrderForm;
