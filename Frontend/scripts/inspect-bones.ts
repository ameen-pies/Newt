import { FBXLoader } from "three-stdlib";
import * as THREE from "three";

const loader = new FBXLoader();
loader.load(
  process.argv[2],
  (fbx) => {
    console.log("=== Bones in model ===");
    fbx.traverse((child) => {
      if (child.type === "Bone") {
        console.log(`Bone: ${child.name} (parent: ${child.parent?.name ?? "none"})`);
      }
    });

    console.log("\n=== All named objects ===");
    fbx.traverse((child) => {
      if (child.name && child.name !== "") {
        console.log(`${child.type}: ${child.name}`);
      }
    });

    if (fbx.animations.length > 0) {
      console.log("\n=== Animation track names ===");
      for (const clip of fbx.animations) {
        console.log(`Clip: ${clip.name}`);
        for (const track of clip.tracks) {
          console.log(`  Track: ${track.name}`);
        }
      }
    }
  },
  undefined,
  (err) => console.error("Load error:", err),
);
