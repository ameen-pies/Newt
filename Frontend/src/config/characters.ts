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
  // ─────────────────────────────────────────────────
  // ★ Add your custom 3D character models below:
  //
  // 1. Place your .glb/.gltf file in:
  //      public/models/characters/<your-model>.glb
  //
  // 2. Add an entry like this:
  // {
  //   id: "my-character",
  //   name: "My Character",
  //   type: "gltf",
  //   modelPath: "/models/characters/my-character.glb",
  //   scale: 0.8,
  //   position: [0, 0.8, 0],
  //   description: "My custom 3D character",
  // },
  // ─────────────────────────────────────────────────
];
