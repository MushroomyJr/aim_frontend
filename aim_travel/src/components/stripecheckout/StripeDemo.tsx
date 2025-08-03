import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
} from "@mui/material";
import { CreditCard, Flight, CheckCircle } from "@mui/icons-material";
import StripeCheckout from "./StripeCheckout";

const StripeDemo: React.FC = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string>("");

  // Mock flight ticket data
  const mockTicket = {
    airline: "American Airlines",
    price: 299.99,
    origin: "JFK",
    destination: "LAX",
    departure: "2024-01-15T10:00:00Z",
    arrival: "2024-01-15T13:30:00Z",
    duration: "3h 30m",
    stops: 0,
    roundTrip: false,
  };

  const handlePaymentSuccess = (orderId: string) => {
    setCompletedOrderId(orderId);
    setOrderCompleted(true);
    setShowCheckout(false);
  };

  const handleBack = () => {
    setShowCheckout(false);
  };

  if (orderCompleted) {
    return (
      <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Booking Confirmed!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your payment was successful and your booking has been confirmed.
              </Typography>
              <Chip
                label={`Order ID: ${completedOrderId}`}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                You will receive a confirmation email shortly.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (showCheckout) {
    return (
      <StripeCheckout
        ticket={mockTicket}
        onPaymentSuccess={handlePaymentSuccess}
        onBack={handleBack}
      />
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Stripe Checkout Demo
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This is a demo of the Stripe checkout integration. The payment flow
        includes:
        <ul>
          <li>Secure payment processing with Stripe</li>
          <li>Real-time payment status updates via WebSocket</li>
          <li>Automatic order creation after successful payment</li>
          <li>Booking confirmation after payment completion</li>
        </ul>
      </Alert>

      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Flight Details
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Flight sx={{ mr: 1 }} />
            <Typography variant="body1">
              {mockTicket.origin} → {mockTicket.destination}
            </Typography>
          </Box>
          <Typography variant="body1">
            <strong>Airline:</strong> {mockTicket.airline}
          </Typography>
          <Typography variant="body1">
            <strong>Price:</strong> ${mockTicket.price}
          </Typography>
          <Typography variant="body1">
            <strong>Duration:</strong> {mockTicket.duration}
          </Typography>
          <Typography variant="body1">
            <strong>Stops:</strong> {mockTicket.stops}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<CreditCard />}
          onClick={() => setShowCheckout(true)}
          sx={{ px: 4, py: 1.5 }}
        >
          Start Stripe Checkout Demo
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Testing Instructions:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Use Stripe test card: <strong>4242 4242 4242 4242</strong>
          <br />
          • Any future expiry date
          <br />
          • Any 3-digit CVC
          <br />• Any billing address
        </Typography>
      </Box>
    </Box>
  );
};

export default StripeDemo;
