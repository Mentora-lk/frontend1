"use client";

import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { messages, status, sendMessage } = useWebSocket(params.conversationId);
  const [input, setInput] = useState("");

  // Replace this with the real logged-in user ID from your auth context
  const senderId = localStorage.getItem("userId") || "unknown";

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim(), senderId);
    setInput("");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <p>Status: <strong>{status}</strong></p>

      <div style={{ border: "1px solid #ccc", height: 300, overflowY: "auto", padding: "0.5rem", marginBottom: "1rem" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{msg.senderId}:</strong> {msg.content}
            <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>{msg.timestamp}</span>
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message..."
        style={{ width: "80%", padding: "0.5rem" }}
      />
      <button onClick={handleSend} style={{ marginLeft: 8, padding: "0.5rem 1rem" }}>
        Send
      </button>
    </div>
  );
}