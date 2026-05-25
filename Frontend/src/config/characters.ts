import { LUCY_BONE_MAP } from "./bone-maps/lucy";
import { PINKDRESS_BONE_MAP } from "./bone-maps/pinkdress";
import { OFFICE_WORKER_BONE_MAP } from "./bone-maps/office-worker";

export interface CharacterConfig {
  id: string;
  name: string;
  type: "procedural" | "gltf" | "vrm" | "fbx";
  modelPath?: string;
  description: string;
  scale?: number;
  position?: [number, number, number];
  animationPath?: string;
  texturePath?: string;
  boneMap?: Record<string, string>;
  rotation?: [number, number, number];
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
    id: "lucy",
    name: "Lucy",
    type: "fbx",
    modelPath: "/models/characters/lucy.fbx",
    scale: 1.0,
    position: [0, 1, 0],
    texturePath: "/textures/lucy/",
    animationPath: "/animations/idle.fbx",
    boneMap: LUCY_BONE_MAP,
    rotation: [-Math.PI / 2, 0, 0],
    description: "Lucy (Female Base FBX)",
  },
  {
    id: "pinkdress",
    name: "Pink Dress",
    type: "fbx",
    modelPath: "/models/characters/pinkdress.fbx",
    scale: 0.01,
    position: [0, 1, 0],
    texturePath: "/textures/pinkdress/",
    animationPath: "/animations/idle.fbx",
    boneMap: PINKDRESS_BONE_MAP,
    rotation: [Math.PI / 2, 0, 0],
    description: "Pink Dress (Daz3D)",
  },
  {
    id: "office-worker",
    name: "Office Worker",
    type: "fbx",
    modelPath: "/models/characters/office-worker.fbx",
    scale: 0.01,
    position: [0, 1, 0],
    texturePath: "/textures/office-worker/",
    animationPath: "/animations/idle.fbx",
    boneMap: OFFICE_WORKER_BONE_MAP,
    rotation: [0, 0, 0],
    description: "Female Office Worker (CC3)",
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
