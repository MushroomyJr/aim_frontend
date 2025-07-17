import React, { useState } from 'react';
import {
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    InputAdornment
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowForward from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { searchFlights } from '../../services/flightService';

const passengerOptions = [1, 2, 3, 4, 5, 6];

const FlightSearchForm: React.FC = () => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState<Date | null>(null);
    const [returnDate, setReturnDate] = useState<Date | null>(null);
    const [passengers, setPassengers] = useState(1);
    const [roundTrip, setRoundTrip] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await searchFlights({
                origin,
                destination,
                departureDate,
                returnDate,
                passengers,
                roundTrip
            });
            console.log('Flight search result:', result);
        } catch (error) {
            console.error('Error searching flights:', error);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <form onSubmit={handleSubmit}>
                <Box
                    sx={{
                        maxWidth: 600,
                        margin: 'auto',
                        padding: { xs: 2, sm: 4 },
                        background: '#fff',
                        borderRadius: 4,
                        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
                        mt: 6
                    }}
                >
                    <Typography variant="h4" align="center" gutterBottom>
                        Book Your Flight
                    </Typography>
                    {/* Row 1: Origin -> Arrow -> Destination -> Round Trip */}
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Grid item xs={4}>
                            <TextField
                                value={origin}
                                onChange={e => setOrigin(e.target.value)}
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
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                value={destination}
                                onChange={e => setDestination(e.target.value)}
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
                        </Grid>
                        <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={roundTrip}
                                        onChange={e => setRoundTrip(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Round Trip"
                                sx={{ ml: 1 }}
                            />
                        </Grid>
                    </Grid>

                    {/* Row 2: Departure, (Return), Passengers */}
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Grid item xs={roundTrip ? 4 : 6}>
                            <DatePicker
                                label="Departure Date"
                                value={departureDate}
                                onChange={setDepartureDate}
                                renderInput={(params: any) => <TextField {...params} fullWidth required />}
                            />
                        </Grid>
                        {roundTrip && (
                            <Grid item xs={4}>
                                <DatePicker
                                    label="Return Date"
                                    value={returnDate}
                                    onChange={setReturnDate}
                                    renderInput={(params: any) => <TextField {...params} fullWidth required={roundTrip} />}
                                />
                            </Grid>
                        )}
                        <Grid item xs={roundTrip ? 4 : 6}>
                            <FormControl fullWidth>
                                <InputLabel id="passenger-label"><PersonIcon /></InputLabel>
                                <Select
                                    labelId="passenger-label"
                                    value={passengers}
                                    label="Passengers"
                                    onChange={e => setPassengers(Number(e.target.value))}
                                >
                                    {passengerOptions.map(opt => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Search Button */}
                    <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}>
                        Search Flights
                    </Button>
                </Box>
            </form>
        </LocalizationProvider>
    );
};

export default FlightSearchForm; 