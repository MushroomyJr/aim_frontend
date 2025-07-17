import React from "react";
import { Box, CircularProgress, Button, Typography } from "@mui/material";
import TicketResultCard from "../components/ticketresultcard/TicketResultCard";
import type { TicketInfo } from "../components/ticketresultcard/TicketResultCard";

interface ResultsPageProps {
  loading: boolean;
  tickets: TicketInfo[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  error?: string | null;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  loading,
  tickets,
  page,
  totalPages,
  onPageChange,
  error,
}) => {
  return (
    <Box sx={{ maxWidth: 700, margin: "auto", mt: 6 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error && (
            <Typography
              variant="h6"
              align="center"
              color="error"
              sx={{ my: 4 }}
            >
              {error}
            </Typography>
          )}
          {!error && tickets.length === 0 ? (
            <Typography variant="h6" align="center" sx={{ my: 4 }}>
              No results found.
            </Typography>
          ) : null}
          {!error &&
            tickets.map((ticket, idx) => (
              <TicketResultCard key={idx} ticket={ticket} />
            ))}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              sx={{ mr: 2 }}
            >
              Previous
            </Button>
            <Typography sx={{ mx: 2, alignSelf: "center" }}>
              Page {page} of {totalPages}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              sx={{ ml: 2 }}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ResultsPage;
