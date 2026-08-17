import { io, Socket } from "socket.io-client";

// The REST base URL includes the trailing /api (see src/lib/api.ts); the
// Socket.io server is mounted on the same origin/port but not under /api.
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

let socket: Socket | null = null;

/**
 * Thin wrapper around a single shared Socket.io connection, authenticated
 * with the same JWT used for REST calls (see src/lib/api.ts). The backend
 * (`src/socket.js` in the backend repo) auto-joins every connected socket to
 * a `user:<id>` room, so this connection alone is enough to receive
 * `new_message` / `typing` / `stop_typing` / `messages_read` /
 * `new_notification` events for the current user without any extra "join" call.
 */
export const messagingSocket = {
  connect(): Socket | null {
    if (typeof window === "undefined") return null;
    if (socket?.connected) return socket;

    const token = localStorage.getItem("token");
    if (!token) return null;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    return socket;
  },

  getSocket(): Socket | null {
    return socket;
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  },

  emitTyping(toUserId: number | string) {
    socket?.emit("typing", { to: toUserId });
  },

  emitStopTyping(toUserId: number | string) {
    socket?.emit("stop_typing", { to: toUserId });
  },
};
