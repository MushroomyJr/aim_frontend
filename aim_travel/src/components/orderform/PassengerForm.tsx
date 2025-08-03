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
import PersonIcon from "@mui/icons-material/Person";
import FlightIcon from "@mui/icons-material/Flight";
import {
  createTicketWithPayment,
  type CreateTicketRequest,
} from "../../services/ticketService";

interface PassengerFormProps {
  ticket: any;
  onPaymentSessionCreated: (paymentSession: any) => void;
  onBack: () => void;
}

const PassengerForm: React.FC<PassengerFormProps> = ({
  ticket,
  onPaymentSessionCreated,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passengerName, setPassengerName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!passengerName.trim()) {
      setError("Passenger name is required");
      setLoading(false);
      return;
    }

    if (!dateOfBirth) {
      setError("Date of birth is required");
      setLoading(false);
      return;
    }

    try {
      // Format date of birth to YYYY-MM-DD
      const dobString = dateOfBirth.toISOString().split("T")[0];

      // Format departure and arrival times
      const formatDateTime = (dateArray: number[]) => {
        if (!Array.isArray(dateArray) || dateArray.length < 5) {
          return new Date().toISOString();
        }
        const [year, month, day, hour, minute] = dateArray;
        return `${year}-${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}T${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}:00`;
      };

      const ticketData: CreateTicketRequest = {
        passenger: passengerName.trim(),
        dob: dobString,
        email: email.trim() || null, // Optional for guest users
        origin: ticket.origin || "JFK",
        destination: ticket.destination || "LAX",
        roundTrip: ticket.roundTrip || false,
        departureTime: formatDateTime(ticket.departure),
        arrivalTime: formatDateTime(ticket.arrival),
        returnDepartureTime: ticket.returnDeparture
          ? formatDateTime(ticket.returnDeparture)
          : null,
        returnArrivalTime: ticket.returnArrival
          ? formatDateTime(ticket.returnArrival)
          : null,
        airline: ticket.airline || "American Airlines",
        cost: ticket.price || ticket.cost || 450.0,
        stops: ticket.stops || 0,
        baggage: "1 checked bag",
        travelClass: "Economy",
      };

      console.log("Creating ticket with payment session:", ticketData);

      const paymentSession = await createTicketWithPayment(ticketData);
      console.log("Payment session created:", paymentSession);

      onPaymentSessionCreated(paymentSession);
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      setError(err.message || "Failed to create ticket. Please try again.");
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
              Passenger Information
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
                  <strong>Price:</strong> ${ticket.price || ticket.cost}
                </Typography>
                <Typography variant="body1">
                  <strong>Route:</strong> {ticket.origin || "JFK"} →{" "}
                  {ticket.destination || "LAX"}
                </Typography>
                <Typography variant="body1">
                  <strong>Type:</strong>{" "}
                  {ticket.roundTrip ? "Round Trip" : "One Way"}
                </Typography>
              </Card>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Passenger Information
                </Typography>

                <TextField
                  fullWidth
                  label="Passenger Name"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  required
                  helperText="Enter the passenger's full name as it appears on their ID"
                  sx={{ mb: 2 }}
                />

                <DatePicker
                  label="Date of Birth"
                  value={dateOfBirth}
                  onChange={(newValue) => setDateOfBirth(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: "Required for booking",
                      sx: { mb: 2 },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Email Address (Optional)"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    disabled={loading || !passengerName.trim() || !dateOfBirth}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <PaymentIcon />
                    }
                  >
                    {loading ? "Creating Ticket..." : "Proceed to Payment"}
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

export default PassengerForm;
