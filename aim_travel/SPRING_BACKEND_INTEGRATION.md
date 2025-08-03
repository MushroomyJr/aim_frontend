# Spring Backend Integration for Stripe Checkout

This guide shows you how to integrate your React frontend with a Spring backend for Stripe checkout functionality.

## Required Spring Backend Endpoints

Your Spring backend needs to implement the following endpoints:

### 1. Create Checkout Session Endpoint

**Endpoint:** `POST /api/v1/stripe/create-checkout-session`

**Request Body:**

```json
{
  "orderId": "order_1234567890",
  "userEmail": "user@example.com",
  "amount": 45000,
  "currency": "usd",
  "description": "Flight from JFK to LAX - American Airlines"
}
```

**Response:**

```json
{
  "id": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_...",
  "payment_status": "unpaid",
  "customer_email": "user@example.com"
}
```

### 2. Verify Payment Endpoint

**Endpoint:** `GET /api/v1/stripe/verify-payment/{sessionId}`

**Response:**

```json
{
  "type": "payment_success",
  "orderId": "order_1234567890",
  "sessionId": "cs_test_...",
  "amount": 45000,
  "status": "paid"
}
```

### 3. WebSocket Server

Your Spring backend should also run a WebSocket server on the same port (8080) to handle real-time payment status updates.

## Spring Boot Implementation Example

Here's a basic Spring Boot implementation:

### Dependencies (pom.xml)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>com.stripe</groupId>
        <artifactId>stripe-java</artifactId>
        <version>24.0.0</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-cors</artifactId>
    </dependency>
</dependencies>
```

### Application Properties (application.properties)

```properties
server.port=8080
stripe.secret.key=sk_test_your_secret_key_here
stripe.publishable.key=pk_test_your_publishable_key_here
```

### Controller Example

```java
@RestController
@RequestMapping("/api/v1/stripe")
@CrossOrigin(origins = "http://localhost:5173")
public class StripeController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, Object>> createCheckoutSession(@RequestBody CreateCheckoutSessionRequest request) {
        try {
            Stripe.apiKey = stripeSecretKey;

            List<Object> lineItems = new ArrayList<>();
            Map<String, Object> lineItem = new HashMap<>();
            lineItem.put("price_data", Map.of(
                "currency", request.getCurrency(),
                "product_data", Map.of("name", request.getDescription()),
                "unit_amount", request.getAmount()
            ));
            lineItem.put("quantity", 1);
            lineItems.add(lineItem);

            Map<String, Object> params = new HashMap<>();
            params.put("line_items", lineItems);
            params.put("mode", "payment");
            params.put("success_url", "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}");
            params.put("cancel_url", "http://localhost:5173/payment-cancel");
            params.put("customer_email", request.getUserEmail());

            Session session = Session.create(params);

            Map<String, Object> response = new HashMap<>();
            response.put("id", session.getId());
            response.put("url", session.getUrl());
            response.put("payment_status", session.getPaymentStatus());
            response.put("customer_email", request.getUserEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify-payment/{sessionId}")
    public ResponseEntity<Map<String, Object>> verifyPayment(@PathVariable String sessionId) {
        try {
            Stripe.apiKey = stripeSecretKey;
            Session session = Session.retrieve(sessionId);

            Map<String, Object> response = new HashMap<>();
            response.put("type", "payment_success");
            response.put("orderId", "order_" + System.currentTimeMillis());
            response.put("sessionId", sessionId);
            response.put("amount", session.getAmountTotal());
            response.put("status", session.getPaymentStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}
```

### WebSocket Configuration

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new PaymentWebSocketHandler(), "/socket.io/")
            .setAllowedOrigins("http://localhost:5173");
    }
}
```

### WebSocket Handler

```java
@Component
public class PaymentWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = session.getId();
        sessions.put(sessionId, session);
        System.out.println("WebSocket connected: " + sessionId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = session.getId();
        sessions.remove(sessionId);
        System.out.println("WebSocket disconnected: " + sessionId);
    }

    public void sendPaymentUpdate(String sessionId, String message) {
        WebSocketSession webSocketSession = sessions.get(sessionId);
        if (webSocketSession != null && webSocketSession.isOpen()) {
            try {
                webSocketSession.sendMessage(new TextMessage(message));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

## Environment Variables

Make sure to set your Stripe keys in your Spring application:

```properties
stripe.secret.key=sk_test_your_actual_secret_key
stripe.publishable.key=pk_test_your_actual_publishable_key
```

## Testing

1. Start your Spring backend on port 8080
2. Start your React frontend on port 5173
3. Try the Stripe checkout demo
4. Use Stripe test cards for testing:
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits

## CORS Configuration

Make sure your Spring backend allows CORS from your React frontend:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```
