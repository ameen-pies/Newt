export interface RoomConfig {
  id: string;
  name: string;
  type: "procedural" | "gltf";
  modelPath?: string;
  description: string;
  scale?: number;
  position?: [number, number, number];
  colors?: {
    floor: string;
    wall: string;
    accent: string;
    fog: string;
  };
}

export const ROOMS: RoomConfig[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    type: "procedural",
    description: "Neon-lit cyberpunk environment",
    colors: {
      floor: "#0a0a1a",
      wall: "#0f0f23",
      accent: "#6366f1",
      fog: "#050510",
    },
  },
  {
    id: "minimalist",
    name: "Minimalist",
    type: "procedural",
    description: "Clean minimalist space",
    colors: {
      floor: "#1a1a1a",
      wall: "#111111",
      accent: "#333333",
      fog: "#0a0a0a",
    },
  },
  {
    id: "cozy",
    name: "Cozy",
    type: "procedural",
    description: "Warm cozy environment",
    colors: {
      floor: "#2d1f0e",
      wall: "#1a120a",
      accent: "#c4956a",
      fog: "#0d0805",
    },
  },
  {
    id: "livingroom",
    name: "Living Room",
    type: "gltf",
    modelPath: "/models/rooms/livingroom.glb",
    scale: 0.5,
    position: [0, -0.5, 0],
    description: "Wabisabi living room",
  },
  // ─────────────────────────────────────────────────
  // ★ To add a custom room:
  //   1. Export your model as .glb from your 3D tool (Blender, 3ds Max, etc.)
  //      ⚠ Renaming .max/.obj/.fbx to .glb does NOT work — use File > Export
  //   2. Place the file in public/models/rooms/
  //   3. Add an entry below:
  // {
  //   id: "my-room",
  //   name: "My Room",
  //   type: "gltf",
  //   modelPath: "/models/rooms/my-room.glb",
  //   scale: 1,
  //   position: [0, 0, 0],
  //   description: "Description",
  // },
  // ─────────────────────────────────────────────────
];
