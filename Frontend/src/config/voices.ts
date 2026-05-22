export interface VoiceConfig {
  id: string;
  name: string;
  persona: string;
  type: "builtin" | "cloned";
  description: string;
}

export const BUILTIN_VOICES: VoiceConfig[] = [
  {
    id: "deep",
    name: "Deep",
    persona: "deep",
    type: "builtin",
    description: "Deep, authoritative voice",
  },
  {
    id: "sarcastic",
    name: "Sarcastic",
    persona: "sarcastic",
    type: "builtin",
    description: "Sarcastic, dry, playful",
  },
  {
    id: "soft",
    name: "Soft",
    persona: "soft",
    type: "builtin",
    description: "Soft, gentle, warm",
  },
  {
    id: "dynamic",
    name: "Dynamic",
    persona: "dynamic",
    type: "builtin",
    description: "Energetic, expressive, natural",
  },
  // ─────────────────────────────────────────────────
  // ★ Add your custom voices below:
  //
  // {
  //   id: "my-voice",
  //   name: "My Voice",
  //   persona: "custom",
  //   type: "builtin",
  //   description: "My custom voice persona",
  // },
  // ─────────────────────────────────────────────────
];
