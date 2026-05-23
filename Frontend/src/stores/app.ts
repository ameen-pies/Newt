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

export interface ClonedVoice {
  id: string;
  name: string;
  filePath: string;
}

interface AppState {
  // Setup
  isSetup: boolean;
  avatar: AvatarConfig;
  voicePersona: string;
  roomStyle: string;

  // Modular asset selections
  characterId: string;
  roomModelId: string;

  // Custom cloned voices
  customVoices: ClonedVoice[];

  // Chat
  messages: ChatMessage[];
  isThinking: boolean;

  // Cognitive
  cognitiveState: CognitiveState;

  // Dev / testing
  testAnimation: string | null;

  // Sensors
  isListening: boolean;
  isScreenSharing: boolean;

  // WebSocket
  wsConnected: boolean;

  // Actions
  setSetup: (
    avatar: AvatarConfig,
    voice: string,
    room: string,
    characterId?: string,
    roomModelId?: string
  ) => void;
  addMessage: (msg: ChatMessage) => void;
  setThinking: (v: boolean) => void;
  setCognitiveState: (state: CognitiveState) => void;
  setListening: (v: boolean) => void;
  setScreenSharing: (v: boolean) => void;
  setWsConnected: (v: boolean) => void;
  addCustomVoice: (voice: ClonedVoice) => void;
  setCharacterId: (id: string) => void;
  setRoomModelId: (id: string) => void;
  setTestAnimation: (path: string | null) => void;
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
  characterId: "newt-default",
  roomModelId: "cyberpunk",
  customVoices: [],
  messages: [],
  isThinking: false,
  cognitiveState: {
    mood: "neutral",
    curiosity: 0.5,
    energy: 0.8,
    focus: "idle",
    active_thought: null,
  },
  testAnimation: null,
  isListening: false,
  isScreenSharing: false,
  wsConnected: false,

  setSetup: (avatar, voice, room, characterId, roomModelId) =>
    set({
      isSetup: true,
      avatar,
      voicePersona: voice,
      roomStyle: room,
      characterId: characterId ?? "newt-default",
      roomModelId: roomModelId ?? "cyberpunk",
    }),

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setThinking: (v) => set({ isThinking: v }),
  setCognitiveState: (cognitiveState) => set({ cognitiveState }),
  setListening: (v) => set({ isListening: v }),
  setScreenSharing: (v) => set({ isScreenSharing: v }),
  setWsConnected: (v) => set({ wsConnected: v }),
  addCustomVoice: (voice) =>
    set((state) => ({ customVoices: [...state.customVoices, voice] })),
  setCharacterId: (id) => set({ characterId: id }),
  setRoomModelId: (id) => set({ roomModelId: id }),
  setTestAnimation: (path) => set({ testAnimation: path }),
}));
