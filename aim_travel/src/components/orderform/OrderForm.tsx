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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import PaymentIcon from "@mui/icons-material/Payment";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PersonIcon from "@mui/icons-material/Person";
import FlightIcon from "@mui/icons-material/Flight";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import {
  type OrderRequest,
  type FlightTicketRequest,
  createOrder,
  createFlightTicket,
} from "../../services/orderService";
import StripeCheckout from "../stripecheckout";
import PassengerForm from "./PassengerForm";

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
  const [paymentMethod, setPaymentMethod] = useState<"regular" | "stripe">(
    "stripe"
  );
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [showPassengerForm, setShowPassengerForm] = useState(true);

  const handlePaymentSessionCreated = (session: any) => {
    console.log("Payment session created:", session);
    setPaymentSession(session);
    setShowPassengerForm(false);
  };

  const handleRedirectToPayment = () => {
    if (paymentSession?.paymentSessionUrl) {
      // Store session ID for later use
      localStorage.setItem("stripeSessionId", paymentSession.paymentSessionId);

      // Redirect to Stripe checkout
      window.location.href = paymentSession.paymentSessionUrl;
    }
  };

  // Show passenger form first
  if (showPassengerForm) {
    return (
      <PassengerForm
        ticket={ticket}
        onPaymentSessionCreated={handlePaymentSessionCreated}
        onBack={onBack}
      />
    );
  }

  // Show payment confirmation
  if (paymentSession) {
    return (
      <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Payment Confirmation
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
              <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body1">
                  <strong>Order Number:</strong> {paymentSession.orderNumber}
                </Typography>
                <Typography variant="body1">
                  <strong>Passenger:</strong> {paymentSession.passengerName}
                </Typography>
                <Typography variant="body1">
                  <strong>Flight:</strong> {paymentSession.origin} →{" "}
                  {paymentSession.destination}
                </Typography>
                <Typography variant="body1">
                  <strong>Airline:</strong> {paymentSession.airline}
                </Typography>
                <Typography variant="body1">
                  <strong>Amount:</strong> ${paymentSession.cost}
                </Typography>
              </Card>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body1" gutterBottom>
                Ready to proceed to secure payment?
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleRedirectToPayment}
                startIcon={<PaymentIcon />}
                sx={{ mt: 2 }}
              >
                Proceed to Payment
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return null; // This should never be reached
};

export default OrderForm;
