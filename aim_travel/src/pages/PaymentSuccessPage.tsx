import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import EmailIcon from "@mui/icons-material/Email";
import {
  updatePaymentStatus,
  type OrderDetails,
} from "../services/ticketService";

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failed" | "pending"
  >("pending");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found in URL");
      setLoading(false);
      return;
    }

    const handlePaymentSuccess = async () => {
      try {
        console.log("Updating payment status for session:", sessionId);
        const result = await updatePaymentStatus(sessionId, "paid");

        if (result.success) {
          setOrderDetails(result);
          setPaymentStatus("success");
        } else {
          setError(result.message || "Failed to update payment status");
          setPaymentStatus("failed");
        }
      } catch (error: any) {
        console.error("Error updating payment status:", error);
        setError("Failed to update payment status. Please contact support.");
        setPaymentStatus("failed");
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId]);

  const handleBackToSearch = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Processing your payment...</Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we confirm your payment status.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error && paymentStatus === "failed") {
    return (
      <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" color="error" gutterBottom>
            Payment Failed
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={handleBackToSearch} variant="contained">
            Back to Search
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Payment Successful!
        </Typography>

        {orderDetails && (
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Order Number: {orderDetails.orderNumber}
          </Typography>
        )}
        <Chip label="PAID" color="success" sx={{ mb: 2 }} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PaymentIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Payment Details</Typography>
          </Box>
          <Typography variant="body1" gutterBottom>
            <strong>Status:</strong> Your payment has been processed
            successfully!
          </Typography>

          {orderDetails && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Order Number:</strong> {orderDetails.orderNumber}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Itinerary Number:</strong>{" "}
                {orderDetails.itineraryNumber}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Passenger:</strong> {orderDetails.passengerName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Flight:</strong> {orderDetails.origin} →{" "}
                {orderDetails.destination}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Airline:</strong> {orderDetails.airline}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Amount:</strong> ${orderDetails.cost}
              </Typography>
            </>
          )}
          <Typography variant="body2" color="text.secondary">
            Paid on {new Date().toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <EmailIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Next Steps</Typography>
          </Box>
          <Typography variant="body1" gutterBottom>
            • A confirmation email has been sent to your email address
          </Typography>
          <Typography variant="body1" gutterBottom>
            • Please check your email for detailed flight information
          </Typography>
          <Typography variant="body1" gutterBottom>
            • Keep your Order ID ({orderDetails?.orderNumber}) for reference
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Thank you for your payment!
        </Typography>
        <Button onClick={handleBackToSearch} variant="contained" sx={{ mt: 2 }}>
          Book Another Flight
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentSuccessPage;
