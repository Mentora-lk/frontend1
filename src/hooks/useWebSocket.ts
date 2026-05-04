import { useEffect, useRef, useState } from "react";
import { messagingService, Message } from "@/services/messagingService";

export function useWebSocket(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<"connected" | "disconnected" | "error">("disconnected");

  useEffect(() => {
    messagingService.connect(
      conversationId,
      (msg) => setMessages((prev) => [...prev, msg]),
      (s) => setStatus(s)
    );

    return () => messagingService.disconnect();
  }, [conversationId]);

  const sendMessage = (content: string, senderId: string) => {
    messagingService.sendMessage(content, senderId);
  };

  return { messages, status, sendMessage };
}