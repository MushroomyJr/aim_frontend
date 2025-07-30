import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlightIcon from "@mui/icons-material/Flight";
import EmailIcon from "@mui/icons-material/Email";

interface OrderConfirmationPageProps {
  orderId: string;
  onBackToSearch: () => void;
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  onBackToSearch,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Order #{orderId}
        </Typography>
        <Chip label="CONFIRMED" color="success" sx={{ mb: 2 }} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FlightIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Flight Details</Typography>
          </Box>
          <Typography variant="body1" gutterBottom>
            <strong>Status:</strong> Your flight has been successfully booked!
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Order ID:</strong> {orderId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Booked on {new Date().toLocaleDateString()}
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
            • Keep your order ID ({orderId}) for reference
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Thank you for choosing our service!
        </Typography>
        <Button onClick={onBackToSearch} variant="contained" sx={{ mt: 2 }}>
          Book Another Flight
        </Button>
      </Box>
    </Box>
  );
};

export default OrderConfirmationPage;
