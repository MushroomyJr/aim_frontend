const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Mock flight data
const mockFlights = [
  {
    id: "1",
    airline: "American Airlines",
    flightNumber: "AA123",
    origin: "JFK",
    destination: "LAX",
    departureTime: "2024-01-15T10:00:00Z",
    arrivalTime: "2024-01-15T13:30:00Z",
    price: 299.99,
    availableSeats: 150,
    aircraft: "Boeing 737",
    duration: "3h 30m"
  },
  {
    id: "2",
    airline: "Delta Airlines",
    flightNumber: "DL456",
    origin: "JFK",
    destination: "LAX",
    departureTime: "2024-01-15T14:00:00Z",
    arrivalTime: "2024-01-15T17:30:00Z",
    price: 349.99,
    availableSeats: 120,
    aircraft: "Airbus A320",
    duration: "3h 30m"
  },
  {
    id: "3",
    airline: "United Airlines",
    flightNumber: "UA789",
    origin: "JFK",
    destination: "LAX",
    departureTime: "2024-01-15T18:00:00Z",
    arrivalTime: "2024-01-15T21:30:00Z",
    price: 279.99,
    availableSeats: 180,
    aircraft: "Boeing 737",
    duration: "3h 30m"
  }
];

// Mock Stripe API
const mockStripe = {
  createCheckoutSession: async (request) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const sessionId = `cs_test_${Date.now()}`;
    return {
      id: sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}`,
      payment_status: "unpaid",
      customer_email: request.userEmail,
    };
  },

  verifyPayment: async (sessionId) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      type: "payment_success",
      orderId: `order_${Date.now()}`,
      sessionId: sessionId,
      amount: 45000,
      status: "paid",
    };
  },
};

// API Routes
app.post("/api/v1/tickets/search", async (req, res) => {
  try {
    console.log("Flight search request:", req.body);
    const { origin, destination, departureDate, returnDate, passengers, roundTrip } = req.body;
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Filter flights based on search criteria
    const filteredFlights = mockFlights.filter(flight => {
      const flightDate = new Date(flight.departureTime).toISOString().split('T')[0];
      return flight.origin === origin && 
             flight.destination === destination && 
             flightDate === departureDate &&
             flight.availableSeats >= passengers;
    });
    
    // If round trip, add return flights
    let returnFlights = [];
    if (roundTrip && returnDate) {
      returnFlights = mockFlights.filter(flight => {
        const flightDate = new Date(flight.departureTime).toISOString().split('T')[0];
        return flight.origin === destination && 
               flight.destination === origin && 
               flightDate === returnDate &&
               flight.availableSeats >= passengers;
      });
    }
    
    const response = {
      outboundFlights: filteredFlights,
      returnFlights: returnFlights,
      totalResults: filteredFlights.length + returnFlights.length
    };
    
    console.log(`Found ${response.totalResults} flights`);
    res.json(response);
  } catch (error) {
    console.error("Error searching flights:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/v1/stripe/create-checkout-session", async (req, res) => {
  try {
    console.log("Creating checkout session:", req.body);
    const session = await mockStripe.createCheckoutSession(req.body);
    res.json(session);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/v1/stripe/verify-payment/:sessionId", async (req, res) => {
  try {
    console.log("Verifying payment for session:", req.params.sessionId);
    const payment = await mockStripe.verifyPayment(req.params.sessionId);
    res.json(payment);
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Store user info from query params
  const { userEmail, orderId } = socket.handshake.query;
  socket.userEmail = userEmail;
  socket.orderId = orderId;

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Mock webhook endpoint to trigger payment success
app.post("/api/v1/stripe/mock-payment-success", (req, res) => {
  const { sessionId, orderId } = req.body;

  // Emit payment success to all connected clients
  io.emit("payment_success", {
    type: "payment_success",
    orderId: orderId || `order_${Date.now()}`,
    sessionId: sessionId,
    amount: 45000,
    status: "paid",
  });

  res.json({ message: "Payment success event emitted" });
});

// Mock webhook endpoint to trigger payment failure
app.post("/api/v1/stripe/mock-payment-failed", (req, res) => {
  const { sessionId, orderId } = req.body;

  // Emit payment failure to all connected clients
  io.emit("payment_failed", {
    type: "payment_failed",
    orderId: orderId || `order_${Date.now()}`,
    sessionId: sessionId,
    amount: 45000,
    status: "failed",
  });

  res.json({ message: "Payment failed event emitted" });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Test endpoints:`);
  console.log(`- POST /api/v1/tickets/search`);
  console.log(`- POST /api/v1/stripe/create-checkout-session`);
  console.log(`- GET /api/v1/stripe/verify-payment/:sessionId`);
  console.log(
    `- POST /api/v1/stripe/mock-payment-success (to trigger success)`
  );
  console.log(`- POST /api/v1/stripe/mock-payment-failed (to trigger failure)`);
});
