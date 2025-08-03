# Stripe Integration Setup

This project now includes Stripe checkout integration with WebSocket support for real-time payment status updates.

## Environment Variables

Create a `.env` file in the `aim_travel` directory with the following variables:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Backend API URL
VITE_API_BASE_URL=http://localhost:8080
```

## Backend Requirements

Your backend needs to implement the following endpoints:

### 1. Create Stripe Checkout Session
```
POST /api/v1/stripe/create-checkout-session
```

Request body:
```json
{
  "orderId": "string",
  "userEmail": "string",
  "amount": number,
  "currency": "string",
  "description": "string"
}
```

Response:
```json
{
  "id": "cs_xxx",
  "url": "https://checkout.stripe.com/xxx",
  "payment_status": "unpaid",
  "customer_email": "user@example.com"
}
```

### 2. Verify Payment Status
```
GET /api/v1/stripe/verify-payment/{sessionId}
```

Response:
```json
{
  "type": "payment_success",
  "orderId": "string",
  "sessionId": "string",
  "amount": number,
  "status": "paid"
}
```

### 3. WebSocket Events

Your backend should emit the following WebSocket events:

- `payment_success`: When payment is successful
- `payment_failed`: When payment fails
- `payment_pending`: When payment is being processed

## Features

1. **Secure Payment Flow**: Users are redirected to Stripe's hosted checkout page
2. **Real-time Updates**: WebSocket connection provides instant payment status updates
3. **Payment Confirmation**: Automatic redirect to booking confirmation after successful payment
4. **Error Handling**: Comprehensive error handling for failed payments
5. **Fallback Option**: Users can still use the regular order flow if needed

## Usage

1. Users select a flight and click "Book Now"
2. They choose between "Secure Payment (Stripe)" or "Regular Order"
3. If Stripe is selected, they enter their email and click "Proceed to Payment"
4. They're redirected to Stripe's checkout page
5. After payment, they're automatically redirected back with a success confirmation
6. The booking confirmation page is shown

## Testing

For testing, use Stripe's test card numbers:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Requires authentication: 4000 0025 0000 3155 