import { create } from "zustand";

export interface CognitiveState {
  mood: string;
  curiosity: number;
  energy: number;
  focus: string;
  active_thought: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  emotion?: string;
  timestamp: number;
}

export interface AvatarConfig {
  body_type: string;
  skin_color: string;
  hair_style: string;
  hair_color: string;
  outfit: string;
}

interface AppState {
  // Setup
  isSetup: boolean;
  avatar: AvatarConfig;
  voicePersona: string;
  roomStyle: string;

  // Chat
  messages: ChatMessage[];
  isThinking: boolean;

  // Cognitive
  cognitiveState: CognitiveState;

  // Sensors
  isListening: boolean;
  isScreenSharing: boolean;

  // WebSocket
  wsConnected: boolean;

  // Actions
  setSetup: (avatar: AvatarConfig, voice: string, room: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setThinking: (v: boolean) => void;
  setCognitiveState: (state: CognitiveState) => void;
  setListening: (v: boolean) => void;
  setScreenSharing: (v: boolean) => void;
  setWsConnected: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSetup: false,
  avatar: {
    body_type: "default",
    skin_color: "#f5d0a9",
    hair_style: "short",
    hair_color: "#3b2f2f",
    outfit: "casual",
  },
  voicePersona: "dynamic",
  roomStyle: "cyberpunk",
  messages: [],
  isThinking: false,
  cognitiveState: {
    mood: "neutral",
    curiosity: 0.5,
    energy: 0.8,
    focus: "idle",
    active_thought: null,
  },
  isListening: false,
  isScreenSharing: false,
  wsConnected: false,

  setSetup: (avatar, voice, room) =>
    set({ isSetup: true, avatar, voicePersona: voice, roomStyle: room }),

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setThinking: (v) => set({ isThinking: v }),
  setCognitiveState: (cognitiveState) => set({ cognitiveState }),
  setListening: (v) => set({ isListening: v }),
  setScreenSharing: (v) => set({ isScreenSharing: v }),
  setWsConnected: (v) => set({ wsConnected: v }),
}));
