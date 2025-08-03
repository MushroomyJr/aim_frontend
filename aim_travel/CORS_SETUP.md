# CORS Setup for WebSocket Connection

## Current Issue

The application is experiencing CORS (Cross-Origin Resource Sharing) errors when trying to connect to the WebSocket server at `http://localhost:8080` from the React app running at `http://localhost:5173`.

## Error Details

```
Access to XMLHttpRequest at 'http://localhost:8080/socket.io/?userEmail=&orderId=cs_test_...'
from origin 'http://localhost:5173' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solutions

### Option 1: Configure CORS on Backend (Recommended)

If you have control over the backend server, add CORS headers to allow requests from your frontend:

#### For Spring Boot (Java):

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
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

#### For Node.js/Express:

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

### Option 2: Use a Proxy in Development

Add a proxy configuration to your Vite config to forward WebSocket requests:

```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:8080",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
```

Then update the WebSocket service to use relative URLs:

```typescript
// webSocketService.ts
this.socket = io("/", {
  // Use relative URL instead of absolute
  query: {
    userEmail,
    orderId,
  },
});
```

### Option 3: Disable CORS in Development (Not Recommended for Production)

For development only, you can disable CORS checks in your browser or use a browser extension.

## Current Implementation

The `PaymentSuccessPage` component has been updated to work without WebSocket connection for now, showing a success message when Stripe redirects back to the application. This provides a working user experience while the WebSocket infrastructure is being set up.

## Next Steps

1. **For Development**: Use Option 2 (proxy) for immediate testing
2. **For Production**: Implement proper CORS configuration on your backend
3. **For WebSocket**: Ensure your backend has a Socket.IO server running on port 8080

## Testing the Payment Flow

The current implementation will:

1. Show a loading state for 2 seconds
2. Display a success message with the session ID
3. Allow users to navigate back to search

This provides a complete payment flow experience even without the WebSocket connection.
