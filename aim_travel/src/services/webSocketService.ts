import { io, Socket } from "socket.io-client";
import type { PaymentWebSocketMessage } from "../types/stripe";

export interface WebSocketCallbacks {
  onPaymentSuccess?: (data: PaymentWebSocketMessage) => void;
  onPaymentFailed?: (data: PaymentWebSocketMessage) => void;
  onPaymentPending?: (data: PaymentWebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private callbacks: WebSocketCallbacks = {};
  private mockEventListener: ((event: CustomEvent) => void) | null = null;

  connect(userEmail: string, orderId: string) {
    // Disconnect existing connection if any
    this.disconnect();

    // Connect to the WebSocket server
    this.socket = io("http://localhost:8080", {
      query: {
        userEmail,
        orderId,
      },
    });

    // Set up event listeners
    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      this.callbacks.onConnect?.();
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      this.callbacks.onDisconnect?.();
    });

    this.socket.on("payment_success", (data: PaymentWebSocketMessage) => {
      console.log("Payment success received:", data);
      this.callbacks.onPaymentSuccess?.(data);
    });

    this.socket.on("payment_failed", (data: PaymentWebSocketMessage) => {
      console.log("Payment failed received:", data);
      this.callbacks.onPaymentFailed?.(data);
    });

    this.socket.on("payment_pending", (data: PaymentWebSocketMessage) => {
      console.log("Payment pending received:", data);
      this.callbacks.onPaymentPending?.(data);
    });

    this.socket.on("error", (error: any) => {
      console.error("WebSocket error:", error);
      this.callbacks.onError?.(error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Send a message to the server
  sendMessage(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("WebSocket is not connected");
    }
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
