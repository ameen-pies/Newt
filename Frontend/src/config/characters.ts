export interface CharacterConfig {
  id: string;
  name: string;
  type: "procedural" | "gltf" | "vrm" | "fbx";
  modelPath?: string;
  description: string;
  scale?: number;
  position?: [number, number, number];
  animationPath?: string;
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
    type: "fbx",
    modelPath: "/models/characters/bimo.fbx",
    scale: 0.015,
    position: [0, 0.8, 0],
    animationPath: "/animations/idle.fbx",
    description: "Bimo (FBX)",
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
