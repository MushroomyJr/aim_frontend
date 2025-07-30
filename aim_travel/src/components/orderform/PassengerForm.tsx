import React, { useState } from "react";
import {
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import type { PassengerInfo } from "../../services/orderService";

interface PassengerFormProps {
  passenger: PassengerInfo;
  index: number;
  onUpdate: (index: number, passenger: PassengerInfo) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const PassengerForm: React.FC<PassengerFormProps> = ({
  passenger,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const handleChange = (field: keyof PassengerInfo, value: string) => {
    const updatedPassenger = { ...passenger, [field]: value };
    onUpdate(index, updatedPassenger);
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6">Passenger {index + 1}</Typography>
          {canRemove && (
            <IconButton
              onClick={() => onRemove(index)}
              sx={{ ml: "auto" }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={passenger.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={passenger.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={passenger.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Passport Number (Optional)"
              value={passenger.passportNumber || ""}
              onChange={(e) => handleChange("passportNumber", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={passenger.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone (Optional)"
              value={passenger.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PassengerForm;
