const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function sendChatMessage(message: string) {
  return apiFetch<{
    response: string;
    action: string;
    emotion: string;
  }>("/api/chat/message", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function sendAudio(audioBlob: Blob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.wav");

  const res = await fetch(`${API_URL}/api/sensory/audio`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Audio upload failed: ${res.status}`);
  return res.json();
}

export async function sendScreenFrame(imageBase64: string) {
  return apiFetch<{
    description: string;
    response: string;
    emotion: string;
  }>("/api/sensory/screen", {
    method: "POST",
    body: JSON.stringify({
      image_data: imageBase64,
      timestamp: Date.now() / 1000,
    }),
  });
}

export async function getMemoryStats() {
  return apiFetch<{ total_nodes: number; vectors_size: number }>(
    "/api/memory/stats"
  );
}

export async function getCognitiveState() {
  return apiFetch<{
    mood: string;
    curiosity: number;
    energy: number;
    focus: string;
  }>("/api/memory/cognitive-state");
}

export { API_URL };
