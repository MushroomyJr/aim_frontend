import React from "react";
import { Link } from "react-router-dom";
import { Button, Box, Typography } from "@mui/material";
import { CreditCard } from "@mui/icons-material";
import FlightSearchForm from "../components/flightsearchform/FlightSearchForm";

const HomePage: React.FC<{ onSearch: (params: any) => void }> = ({
  onSearch,
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0e7ff 0%, #fff 100%)",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" gutterBottom>
          AIM Travel
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Find your perfect flight
        </Typography>
        <Link to="/stripe-demo" style={{ textDecoration: "none" }}>
          <Button variant="outlined" startIcon={<CreditCard />} sx={{ mt: 2 }}>
            Try Stripe Checkout Demo
          </Button>
        </Link>
      </Box>
      <FlightSearchForm onSearch={onSearch} />
    </div>
  );
};

export default HomePage;
