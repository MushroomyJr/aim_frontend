const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

// Mock Stripe for demo purposes
// In production, you would use: const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mockStripe = {
  checkout: {
    sessions: {
      create: async (params) => {
        // Simulate Stripe session creation
        return {
          id: `cs_test_${Date.now()}`,
          url: `https://checkout.stripe.com/pay/cs_test_${Date.now()}#fidkdWxOYHwnPydkYjV0WnA1TjE0PW1PTVdTPXZ1YrVybRhnTnhEbj1oVzFUbkpHQklWUnVXU2c2T2E4XFxrcVBadT11V2pAdURhd3d1UmNJaDdkYmcpd2djZv1tMm5fMEd3fGd2dklnfslad2l9Z2NxdmEpyJQ9JSSU9PQ`,
          payment_status: 'unpaid',
          customer_email: params.customer_email,
          amount_total: params.line_items[0].price_data.unit_amount,
          metadata: params.metadata
        };
      },
      retrieve: async (sessionId) => {
        // Simulate retrieving a session
        return {
          id: sessionId,
          payment_status: 'paid',
          amount_total: 29999,
          metadata: {
            orderId: 'mock_order_123',
            userEmail: 'test@example.com'
          }
        };
      }
    }
  },
  webhooks: {
    constructEvent: (body, sig, secret) => {
      // Mock webhook event construction
      return {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_mock',
            payment_status: 'paid',
            amount_total: 29999,
            metadata: {
              orderId: 'mock_order_123',
              userEmail: 'test@example.com'
            }
          }
        }
      };
    }
  }
};

const app = express();
app.use(cors());
app.use(express.json());

// Create Stripe checkout session
app.post('/api/v1/stripe/create-checkout-session', async (req, res) => {
  try {
    const { orderId, userEmail, amount, currency, description } = req.body;

    const session = await mockStripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: description,
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
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
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment status
app.get('/api/v1/stripe/verify-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await mockStripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      type: session.payment_status === 'paid' ? 'payment_success' : 'payment_failed',
      orderId: session.metadata.orderId,
      sessionId: session.id,
      amount: session.amount_total,
      status: session.payment_status,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket server for real-time updates
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Mock webhook endpoint for testing
app.post('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Simulate webhook event
    const event = mockStripe.webhooks.constructEvent(req.body, 'mock_sig', 'mock_secret');
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment successful for session:', session.id);
        
        // Emit to connected WebSocket clients
        io.emit('payment_success', {
          type: 'payment_success',
          orderId: session.metadata.orderId,
          sessionId: session.id,
          amount: session.amount_total,
          status: session.payment_status,
        });
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Mock endpoint to trigger payment success (for testing)
app.post('/api/v1/stripe/mock-payment-success', (req, res) => {
  const { sessionId } = req.body;
  
  io.emit('payment_success', {
    type: 'payment_success',
    orderId: 'mock_order_123',
    sessionId: sessionId || 'cs_test_mock',
    amount: 29999,
    status: 'paid'
  });
  
  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Mock Stripe server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Test endpoints:`);
  console.log(`- POST /api/v1/stripe/create-checkout-session`);
  console.log(`- GET /api/v1/stripe/verify-payment/:sessionId`);
  console.log(`- POST /api/v1/stripe/mock-payment-success (to trigger success)`);
}); 