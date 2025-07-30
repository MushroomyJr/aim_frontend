import React, { useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  InputAdornment,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ArrowForward from "@mui/icons-material/ArrowForward";
import PersonIcon from "@mui/icons-material/Person";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { searchFlights } from "../../services/flightService";

const passengerOptions = [1, 2, 3, 4, 5, 6];

interface FlightSearchFormProps {
  onSearch: (params: {
    origin: string;
    destination: string;
    departureDate: Date | null;
    returnDate: Date | null;
    passengers: number;
    roundTrip: boolean;
  }) => void;
}

const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ onSearch }) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [roundTrip, setRoundTrip] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      roundTrip,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            maxWidth: 600,
            margin: "auto",
            padding: { xs: 2, sm: 4 },
            background: "#fff",
            borderRadius: 4,
            boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
            mt: 6,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Book Your Flight
          </Typography>
          {/* Row 1: Origin -> Arrow -> Destination -> Round Trip */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                fullWidth
                required
                placeholder="Origin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlightTakeoffIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                fullWidth
                required
                placeholder="Destination"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlightLandIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={roundTrip}
                    onChange={(e) => setRoundTrip(e.target.checked)}
                    color="primary"
                  />
                }
                label="Round Trip"
                sx={{ ml: 1 }}
              />
            </Box>
          </Box>

          {/* Row 2: Departure, (Return), Passengers */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
            <Box sx={{ flex: roundTrip ? 1 : 2 }}>
              <DatePicker
                label="Departure Date"
                value={departureDate}
                minDate={new Date()}
                onChange={setDepartureDate}
                slotProps={{
                  textField: { fullWidth: true, required: true },
                }}
              />
            </Box>
            {roundTrip && (
              <Box sx={{ flex: 1 }}>
                <DatePicker
                  label="Return Date"
                  value={returnDate}
                  onChange={setReturnDate}
                  minDate={departureDate ?? undefined}
                  slotProps={{
                    textField: { fullWidth: true, required: roundTrip },
                  }}
                />
              </Box>
            )}
            <Box sx={{ flex: roundTrip ? 1 : 2 }}>
              <FormControl fullWidth>
                <InputLabel id="passenger-label">
                  <PersonIcon />
                </InputLabel>
                <Select
                  labelId="passenger-label"
                  value={passengers}
                  label="Passengers"
                  onChange={(e) => setPassengers(Number(e.target.value))}
                >
                  {passengerOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Search Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
          >
            Search Flights
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
};

export default FlightSearchForm;
