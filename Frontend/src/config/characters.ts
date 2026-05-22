export interface CharacterConfig {
  id: string;
  name: string;
  type: "procedural" | "gltf";
  modelPath?: string;
  description: string;
  scale?: number;
  position?: [number, number, number];
  procedural?: {
    bodyColor: string;
    accentColor: string;
    eyeColor: string;
  };
}

export const CHARACTERS: CharacterConfig[] = [
  {
    id: "newt-default",
    name: "Newt (Default)",
    type: "procedural",
    description: "Default digital companion",
    procedural: {
      bodyColor: "#2a2a3e",
      accentColor: "#6366f1",
      eyeColor: "#818cf8",
    },
  },
  {
    id: "vroid-avatar",
    name: "VRoid Avatar",
    type: "gltf",
    modelPath: "/models/characters/vroid-avatar.glb",
    scale: 0.8,
    position: [0, 0.8, 0],
    description: "Imported VRoid model",
  },
  // ─────────────────────────────────────────────────
  // ★ Add more custom characters below:
  // {
  //   id: "my-character",
  //   name: "My Character",
  //   type: "gltf",
  //   modelPath: "/models/characters/my-character.glb",
  //   scale: 0.8,
  //   position: [0, 0.8, 0],
  //   description: "Description",
  // },
  // ─────────────────────────────────────────────────
];
