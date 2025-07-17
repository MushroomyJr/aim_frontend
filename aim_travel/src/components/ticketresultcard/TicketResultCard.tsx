import React from 'react';
import { Card, CardContent, Typography, Button, Grid } from '@mui/material';

export interface TicketInfo {
    airline: string;
    price: number;
    departure: string;
    arrival: string;
    duration: string;
}

const TicketResultCard: React.FC<{ ticket: TicketInfo }> = ({ ticket }) => {
    return (
        <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={8}>
                        <Typography variant="h6">{ticket.airline}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {ticket.departure} → {ticket.arrival} | {ticket.duration}
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h6" color="primary">
                            ${ticket.price}
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Button variant="contained" color="primary" fullWidth>
                            Book
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default TicketResultCard; 