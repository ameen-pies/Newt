import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/stores/app";
import { useWebSocket } from "@/hooks/useWebSocket";

export function ChatPanel() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isThinking, cognitiveState } = useAppStore();
  const { sendMessage } = useWebSocket();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 glass-strong flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-neuro-border">
        <h2 className="text-sm font-semibold text-neuro-accent">Newt</h2>
        <div className="flex gap-2 mt-1 text-xs text-neuro-muted">
          <span>mood: {cognitiveState.mood}</span>
          <span>curiosity: {(cognitiveState.curiosity * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-neuro-muted text-center mt-8">
            Say hello to your companion...
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-neuro-accent/20 text-neuro-text"
                  : "glass text-neuro-text"
              }`}
            >
              {msg.content}
              {msg.emotion && msg.emotion !== "neutral" && (
                <span className="ml-2 text-xs text-neuro-muted">
                  [{msg.emotion}]
                </span>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="glass rounded-lg px-3 py-2 text-sm text-neuro-muted">
              <span className="animate-pulse">thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-neuro-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to Newt..."
            className="flex-1 bg-neuro-glass border border-neuro-border rounded-lg px-3 py-2 text-sm text-neuro-text placeholder-neuro-muted outline-none focus:border-neuro-accent transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-3 py-2 bg-neuro-accent/20 border border-neuro-accent/40 rounded-lg text-sm text-neuro-accent hover:bg-neuro-accent/30 transition-colors disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
