import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
} from "@mui/material";

export interface TicketInfo {
  airline: string;
  price: number;
  departure: number[];
  arrival: number[];
  duration?: string;
  stops: number;
}

function formatTimeRange(departure: number[], arrival: number[]): string {
  if (
    !Array.isArray(departure) ||
    !Array.isArray(arrival) ||
    departure.length < 5 ||
    arrival.length < 5
  )
    return "";

  const pad = (n: number) => n.toString().padStart(2, "0");
  const depStr = `${pad(departure[3])}:${pad(departure[4])}`;
  const arrStr = `${pad(arrival[3])}:${pad(arrival[4])}`;

  // Simple day difference: arrival[2] - departure[2]
  const dayDelta = arrival[2] - departure[2];

  return `${depStr} → ${arrStr}${dayDelta > 0 ? ` +${dayDelta}` : ""}`;
}

function calculateDuration(departure: number[], arrival: number[]): string {
  if (
    !Array.isArray(departure) ||
    !Array.isArray(arrival) ||
    departure.length < 5 ||
    arrival.length < 5
  )
    return "";

  const depDate = new Date(
    departure[0],
    departure[1] - 1,
    departure[2],
    departure[3],
    departure[4]
  );
  const arrDate = new Date(
    arrival[0],
    arrival[1] - 1,
    arrival[2],
    arrival[3],
    arrival[4]
  );

  const diffMs = arrDate.getTime() - depDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffHours}h ${diffMinutes}m`;
}

interface TicketResultCardProps {
  ticket: any;
  onBookTicket: (ticket: any) => void;
}

const TicketResultCard: React.FC<TicketResultCardProps> = ({
  ticket,
  onBookTicket,
}) => {
  return (
    <Card
      sx={{ mb: 2, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left Section: Airline ID and Times */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {ticket.airline}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTimeRange(ticket.departure, ticket.arrival)}
            </Typography>
          </Box>

          {/* Middle Section: Duration and Stops */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {calculateDuration(ticket.departure, ticket.arrival)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ticket.stops === 0
                ? "Nonstop"
                : `${ticket.stops} stop${ticket.stops > 1 ? "s" : ""}`}
            </Typography>
          </Box>

          {/* Right Section: Price and Booking Button */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 1,
              flex: 1,
            }}
          >
            <Typography
              variant="h5"
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              ${ticket.price}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => onBookTicket(ticket)}
            >
              Book
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketResultCard;
