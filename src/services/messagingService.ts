const WS_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") || "ws://localhost:5000";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export type MessageHandler = (message: Message) => void;
export type StatusHandler = (status: "connected" | "disconnected" | "error") => void;

export const messagingService = {
  socket: null as WebSocket | null,

  connect(conversationId: string, onMessage: MessageHandler, onStatus: StatusHandler) {
    const token = localStorage.getItem("token");
    const url = `${WS_BASE_URL}/ws/conversations/${conversationId}?token=${token}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("[WS] Connected");
      onStatus("connected");
    };

    this.socket.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        onMessage(message);
      } catch {
        console.warn("[WS] Could not parse message:", event.data);
      }
    };

    this.socket.onclose = () => {
      console.log("[WS] Disconnected");
      onStatus("disconnected");
    };

    this.socket.onerror = () => {
      console.error("[WS] Error");
      onStatus("error");
    };
  },

  sendMessage(content: string, senderId: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ content, senderId }));
    } else {
      console.warn("[WS] Socket not open");
    }
  },

  disconnect() {
    this.socket?.close();
    this.socket = null;
  },
};