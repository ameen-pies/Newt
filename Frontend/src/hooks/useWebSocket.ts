import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/stores/app";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const { setWsConnected, addMessage, setThinking, setCognitiveState } =
    useAppStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}/api/chat/ws`);

    ws.onopen = () => {
      setWsConnected(true);
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "response") {
          setThinking(false);
          addMessage({
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.content,
            emotion: data.emotion,
            timestamp: Date.now(),
          });

          if (data.cognitive_state) {
            setCognitiveState(data.cognitive_state);
          }

          // Play audio if available
          if (data.audio) {
            playAudio(data.audio);
          }
        } else if (data.type === "pong") {
          // heartbeat response
        }
      } catch (e) {
        console.error("WS message parse error:", e);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      reconnectRef.current = window.setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [setWsConnected, addMessage, setThinking, setCognitiveState]);

  const sendMessage = useCallback(
    (content: string) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) return;

      setThinking(true);
      addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
      });

      wsRef.current.send(JSON.stringify({ type: "text", content }));
    },
    [addMessage, setThinking]
  );

  const disconnect = useCallback(() => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
    }
    wsRef.current?.close();
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { sendMessage, connect, disconnect };
}

function playAudio(base64Audio: string) {
  try {
    const audioBytes = Uint8Array.from(atob(base64Audio), (c) =>
      c.charCodeAt(0)
    );
    const blob = new Blob([audioBytes], { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(() => {});
    audio.onended = () => URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Audio playback error:", e);
  }
}
