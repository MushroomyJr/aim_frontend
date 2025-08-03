import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Payment, CheckCircle, Error } from "@mui/icons-material";
import {
  createCheckoutSession,
  redirectToCheckout,
} from "../../services/stripeService";
import { webSocketService } from "../../services/webSocketService";
import type {
  CreateCheckoutSessionRequest,
  PaymentWebSocketMessage,
} from "../../types/stripe";
import {
  createFlightTicket,
  createOrderWithStripe,
} from "../../services/orderService";
import type {
  FlightTicketRequest,
  OrderRequest,
} from "../../services/orderService";

interface StripeCheckoutProps {
  ticket: any;
  onPaymentSuccess: (orderId: string) => void;
  onBack: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  ticket,
  onPaymentSuccess,
  onBack,
}) => {
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed" | null
  >(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [flightTicketId, setFlightTicketId] = useState<number | null>(null);
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false);

  useEffect(() => {
    // Set up WebSocket callbacks
    webSocketService.setCallbacks({
      onPaymentSuccess: async (data: PaymentWebSocketMessage) => {
        setPaymentStatus("success");
        setShowPaymentDialog(true);
        setShowPaymentProcessing(false);

        try {
          // Create the order in our system after successful payment
          if (flightTicketId) {
            const itineraryNumber = `ITN${Date.now()}`;
            const orderData: OrderRequest = {
              userEmail: userEmail,
              flightTicketIds: [flightTicketId],
              itineraryNumber: itineraryNumber,
            };

            const order = await createOrderWithStripe(
              orderData,
              data.sessionId
            );
            setOrderId(order.orderId.toString());

            // Disconnect WebSocket after successful payment
            setTimeout(() => {
              webSocketService.disconnect();
              onPaymentSuccess(order.orderId.toString());
            }, 2000);
          }
        } catch (error) {
          console.error("Error creating order after payment:", error);
          setError(
            "Payment successful but order creation failed. Please contact support."
          );
        }
      },
      onPaymentFailed: (data: PaymentWebSocketMessage) => {
        setPaymentStatus("failed");
        setShowPaymentDialog(true);
        setError("Payment failed. Please try again.");
        webSocketService.disconnect();
      },
      onPaymentPending: (data: PaymentWebSocketMessage) => {
        setPaymentStatus("pending");
        console.log("Payment is pending...");
      },
      onError: (error: any) => {
        setError("Connection error. Please try again.");
        webSocketService.disconnect();
      },
    });

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [onPaymentSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create flight ticket first
      const flightTicketData: FlightTicketRequest = {
        origin: ticket.origin || "JFK",
        destination: ticket.destination || "LAX",
        roundTrip: ticket.roundTrip || false,
        departureTime: ticket.departure || new Date().toISOString(),
        arrivalTime: ticket.arrival || new Date().toISOString(),
        airline: ticket.airline || "American Airlines",
        //TODO: maybe remove ticket.cost and use ticket.price only
        cost: ticket.price || ticket.cost || 450.0,
        stops: ticket.stops || 0,
        baggage: "1 checked bag",
        travelClass: "Economy",
      };

      const flightTicket = await createFlightTicket(
        flightTicketData,
        userEmail
      );
      setFlightTicketId(flightTicket.id);

      // Step 2: Create checkout session request
      console.log("StripeCheckout - ticket:", ticket);
      console.log("StripeCheckout - ticket.price:", ticket.price);
      console.log("StripeCheckout - ticket.cost:", ticket.cost);

      const checkoutRequest: CreateCheckoutSessionRequest = {
        orderId: `order_${Date.now()}`,
        amount: Math.round((ticket.price || ticket.cost || 0) * 100), // Convert to cents
        currency: "usd",
        description: `Flight from ${ticket.origin} to ${ticket.destination} - ${ticket.airline}`,
      };

      // Step 3: Create Stripe checkout session
      const session = await createCheckoutSession(checkoutRequest);
      setOrderId(session.id);

      // Step 4: Connect to WebSocket for payment status updates
      webSocketService.connect(userEmail, session.id);

      // Step 5: Show payment processing dialog
      setShowPaymentProcessing(true);

      // Step 6: Redirect to Stripe checkout
      await redirectToCheckout(session.id);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create checkout session. Please try again."
      );
      webSocketService.disconnect();
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    if (paymentStatus === "success") {
      onPaymentSuccess(orderId || "");
    }
  };

  const getPaymentStatusIcon = () => {
    switch (paymentStatus) {
      case "success":
        return <CheckCircle color="success" sx={{ fontSize: 60 }} />;
      case "failed":
        return <Error color="error" sx={{ fontSize: 60 }} />;
      default:
        return <CircularProgress size={60} />;
    }
  };

  const getPaymentStatusText = () => {
    switch (paymentStatus) {
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed";
      default:
        return "Processing Payment...";
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Secure Payment
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
                <Button variant="outlined" onClick={onBack} disabled={loading}>
                  Back to Results
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !userEmail}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Payment />
                  }
                >
                  {loading ? "Creating Checkout..." : "Proceed to Payment"}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Payment Status Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={handlePaymentDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle align="center">{getPaymentStatusText()}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              py: 2,
            }}
          >
            {getPaymentStatusIcon()}
            <Typography variant="body1" align="center">
              {paymentStatus === "success"
                ? "Your payment was successful! You will receive a confirmation email shortly."
                : paymentStatus === "failed"
                ? "Your payment was not successful. Please try again."
                : "Please wait while we process your payment..."}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handlePaymentDialogClose}
            variant="contained"
            color={paymentStatus === "success" ? "success" : "primary"}
          >
            {paymentStatus === "success" ? "Continue" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Processing Dialog */}
      <Dialog
        open={showPaymentProcessing}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle align="center">Processing Payment</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              py: 2,
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" align="center">
              Payment in Progress
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary">
              Please complete your payment in the new window that opened.
              <br />
              <br />
              <strong>Test Card:</strong> 4242 4242 4242 4242
              <br />
              <strong>Any future expiry date</strong>
              <br />
              <strong>Any 3-digit CVC</strong>
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              After completing payment, you'll be redirected back here
              automatically.
            </Alert>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StripeCheckout;
