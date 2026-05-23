export interface CharacterConfig {
  id: string;
  name: string;
  type: "procedural" | "gltf" | "vrm";
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
    id: "bimo",
    name: "Bimo",
    type: "vrm",
    modelPath: "/models/characters/bimo.vrm",
    scale: 1.2,
    position: [0, 0.8, 0],
    description: "Custom VRM character",
  },
  // ─────────────────────────────────────────────────
  // ★ To add a custom character:
  //   1. Export your model as .glb or .vrm from your 3D tool (Blender, etc.)
  //      ⚠ Renaming .max/.obj/.fbx to .glb does NOT work — use File > Export
  //   2. Place the file in public/models/characters/
  //   3. Add an entry below:
  // {
  //   id: "my-character",
  //   name: "My Character",
  //   type: "gltf",       // "gltf" for .glb/.gltf, "vrm" for .vrm files
  //   modelPath: "/models/characters/my-character.glb",
  //   scale: 0.8,
  //   position: [0, 0.8, 0],
  //   description: "Description",
  // },
  // ─────────────────────────────────────────────────
];
