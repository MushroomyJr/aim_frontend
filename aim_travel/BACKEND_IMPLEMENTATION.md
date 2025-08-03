# Backend Implementation for Stripe Checkout

This guide shows how to implement the backend endpoints needed for real Stripe checkout integration.

## Required Dependencies

```bash
npm install stripe express cors
```

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Backend Implementation (Node.js/Express)

### 1. Create Stripe Checkout Session Endpoint

```javascript
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Create Stripe checkout session
app.post("/api/v1/stripe/create-checkout-session", async (req, res) => {
  try {
    const { orderId, userEmail, amount, currency, description } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency || "usd",
            product_data: {
              name: description,
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment-cancelled`,
      customer_email: userEmail,
      metadata: {
        orderId: orderId,
        userEmail: userEmail,
      },
    });

    res.json({
      id: session.id,
      url: session.url,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment status
app.get("/api/v1/stripe/verify-payment/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      type:
        session.payment_status === "paid"
          ? "payment_success"
          : "payment_failed",
      orderId: session.metadata.orderId,
      sessionId: session.id,
      amount: session.amount_total,
      status: session.payment_status,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket server for real-time updates
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Webhook endpoint for Stripe events
app.post(
  "/api/v1/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Payment successful for session:", session.id);

        // Emit to connected WebSocket clients
        io.emit("payment_success", {
          type: "payment_success",
          orderId: session.metadata.orderId,
          sessionId: session.id,
          amount: session.amount_total,
          status: session.payment_status,
        });
        break;

      case "checkout.session.expired":
        const expiredSession = event.data.object;
        console.log("Payment expired for session:", expiredSession.id);

        io.emit("payment_failed", {
          type: "payment_failed",
          orderId: expiredSession.metadata.orderId,
          sessionId: expiredSession.id,
          amount: expiredSession.amount_total,
          status: expiredSession.payment_status,
        });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Frontend Updates

### Update stripeService.ts to use real backend

```typescript
// Create a Stripe checkout session
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<StripeCheckoutSession> {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/v1/stripe/create-checkout-session",
      request
    );
    return response.data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

// Redirect to Stripe checkout
export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error("Stripe failed to load");
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    throw error;
  }
}
```

### Update webSocketService.ts to use real WebSocket

```typescript
connect(userEmail: string, orderId: string) {
  // Disconnect existing connection if any
  this.disconnect();

  // Connect to the WebSocket server
  this.socket = io('http://localhost:8080', {
    query: {
      userEmail,
      orderId,
    },
  });

  // Set up event listeners
  this.socket.on('connect', () => {
    console.log('WebSocket connected');
    this.callbacks.onConnect?.();
  });

  this.socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
    this.callbacks.onDisconnect?.();
  });

  this.socket.on('payment_success', (data: PaymentWebSocketMessage) => {
    console.log('Payment success received:', data);
    this.callbacks.onPaymentSuccess?.(data);
  });

  this.socket.on('payment_failed', (data: PaymentWebSocketMessage) => {
    console.log('Payment failed received:', data);
    this.callbacks.onPaymentFailed?.(data);
  });

  this.socket.on('error', (error: any) => {
    console.error('WebSocket error:', error);
    this.callbacks.onError?.(error);
  });
}
```

## Testing

1. **Start the backend server** on port 8080
2. **Update frontend** to use real backend endpoints
3. **Test with Stripe test cards**:
   - Success: 4242 4242 4242 4242
   - Decline: 4000 0000 0000 0002
   - Requires authentication: 4000 0025 0000 3155

## Webhook Setup

1. **Install Stripe CLI** for local testing
2. **Forward webhooks** to your local server:
   ```bash
   stripe listen --forward-to localhost:8080/api/v1/stripe/webhook
   ```
3. **Copy the webhook secret** to your environment variables

## Production Deployment

1. **Set up webhook endpoint** on your production server
2. **Configure success/cancel URLs** to point to your domain
3. **Use production Stripe keys** instead of test keys
4. **Set up proper SSL** for webhook security
