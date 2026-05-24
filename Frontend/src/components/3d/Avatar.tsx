import { useEffect, useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader, FBXLoader } from "three-stdlib";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { useAppStore } from "@/stores/app";
import { CHARACTERS } from "@/config/characters";
import { VrmAvatar } from "./VrmAvatar";

function ProceduralAvatar() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const { cognitiveState, isThinking } = useAppStore();

  const bodyColor = useMemo(() => new THREE.Color("#2a2a3e"), []);
  const accentColor = useMemo(() => new THREE.Color("#6366f1"), []);
  const eyeColor = useMemo(() => new THREE.Color("#818cf8"), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.05 + 1.0;

    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
      headRef.current.rotation.x = Math.sin(t * 0.5) * 0.05;
      if (isThinking) {
        headRef.current.rotation.z = Math.sin(t * 2) * 0.1;
      }
    }

    if (leftEyeRef.current && rightEyeRef.current) {
      const blink = Math.sin(t * 0.5) > 0.95 ? 0.1 : 1.0;
      leftEyeRef.current.scale.y = blink;
      rightEyeRef.current.scale.y = blink;
    }
  });

  const moodIntensity = useMemo(() => {
    const moodMap: Record<string, number> = {
      excited: 0.5, amused: 0.4, curious: 0.3,
      neutral: 0.1, sympathetic: 0.2,
    };
    return moodMap[cognitiveState.mood] || 0.1;
  }, [cognitiveState.mood]);

  return (
    <group ref={groupRef} position={[0, 1.0, 0]}>
      <mesh position={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color={bodyColor} emissive={accentColor} emissiveIntensity={moodIntensity} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh ref={headRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={bodyColor} emissive={accentColor} emissiveIntensity={moodIntensity} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh ref={leftEyeRef} position={[-0.08, 0.55, 0.22]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.08, 0.55, 0.22]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isThinking ? 1.5 : 0.5} />
      </mesh>
    </group>
  );
}

function GltfAvatar({ modelPath, scale, position, onError }: { modelPath: string; scale?: number; position?: [number, number, number]; onError?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setScene(null);
    setError(false);
    const loader = new GLTFLoader();
    loader.register((parser: any) => new VRMLoaderPlugin(parser) as any);
    loader.load(
      modelPath,
      (gltf) => { setScene(gltf.scene); },
      undefined,
      () => { setError(true); onError?.(); },
    );
  }, [modelPath]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.05 + (position?.[1] ?? 0);
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
  });

  if (error) return null;
  if (!scene) return null;

  return (
    <group ref={groupRef} position={[position?.[0] ?? 0, position?.[1] ?? 0, position?.[2] ?? 0]} scale={scale ?? 1}>
      <primitive object={scene} />
    </group>
  );
}

function FbxAvatar({ modelPath, scale, position, animationPath, texturePath, boneMap, rotation, onError }: { modelPath: string; scale?: number; position?: [number, number, number]; animationPath?: string; texturePath?: string; boneMap?: Record<string, string>; rotation?: [number, number, number]; onError?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [error, setError] = useState(false);
  const testAnimation = useAppStore((s) => s.testAnimation);
  const resolvedAnimation = testAnimation ?? animationPath;

  useEffect(() => {
    setScene(null);
    setError(false);
    mixerRef.current = null;
    const loader = new FBXLoader();
    loader.load(
      modelPath,
      (fbx) => {
        const textureLoader = new THREE.TextureLoader();
        const texBase = texturePath ?? "/textures/";

        // Match material name to texture prefix
        function getTexturePrefix(name: string): string | null {
          const lower = (name || "").toLowerCase();
          if (lower.includes("skin_body") || (lower.includes("body") && lower.includes("skin"))) return "m_body";
          if (lower.includes("skin_head")) return "m_body_head";
          if (lower.includes("skin_arm")) return "m_body_arm";
          if (lower.includes("skin_leg")) return "m_body_leg";
          if (lower.includes("clothes") || lower.includes("armor") || lower.includes("dress") || lower.includes("heels")) return "m_clothes";
          if (lower.includes("hair_extra")) return "m_hair_extra";
          if (lower.includes("scalp")) return "m_hair_scalp";
          if (lower.includes("polytail") || lower.includes("hair")) return "m_hair";
          if (lower.includes("eyelash")) return "m_eyelash";
          if (lower.includes("cornea")) return "m_eyes";
          if (lower.includes("eye_occlusion")) return "m_eyes";
          if (lower.includes("eye")) return "m_eyes";
          if (lower.includes("nails")) return "m_nails";
          if (lower.includes("teeth") || lower.includes("tongue") || lower.includes("mouth")) return "m_mouth";
          return null;
        }

        fbx.traverse((child) => {
          if (child.type !== "SkinnedMesh") return;
          const mesh = child as THREE.SkinnedMesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

          for (let i = 0; i < materials.length; i++) {
            const mat = materials[i];
            if (!mat) continue;
            const prefix = getTexturePrefix(mat.name || mesh.name);

            // Convert to StandardMaterial
            let standardMat: THREE.MeshStandardMaterial;
            if (mat instanceof THREE.MeshStandardMaterial) {
              standardMat = mat;
            } else {
              standardMat = new THREE.MeshStandardMaterial();
              if (mat instanceof THREE.MeshPhongMaterial) {
                standardMat.color.copy(mat.color);
                standardMat.emissive.copy(mat.emissive);
                standardMat.emissiveIntensity = mat.emissiveIntensity;
                standardMat.opacity = mat.opacity;
                standardMat.transparent = mat.transparent;
              } else {
                standardMat.color.set(0xffffff);
              }
              if (Array.isArray(mesh.material)) {
                mesh.material[i] = standardMat;
              } else {
                mesh.material = standardMat;
              }
            }

            if (prefix) {
              // Load diffuse
              textureLoader.load(texBase + prefix + "_diffuse.png", (tex) => {
                standardMat.map = tex;
                standardMat.color.set(0xffffff);
                standardMat.needsUpdate = true;
              });
              // Load normal map
              textureLoader.load(texBase + prefix + "_normal.png", (tex) => {
                standardMat.normalMap = tex;
                standardMat.needsUpdate = true;
              });
              // Load roughness map
              textureLoader.load(texBase + prefix + "_roughness.png", (tex) => {
                standardMat.roughnessMap = tex;
                standardMat.needsUpdate = true;
              });
            }

            standardMat.metalness = 0;
            standardMat.roughness = 1;
            standardMat.envMapIntensity = 0;
          }
        });

        // Log bone names for bone map creation
        const boneNames: string[] = [];
        fbx.traverse((child) => {
          if (child.type === "Bone") boneNames.push(child.name);
        });
        console.log(`[Avatar] Bone names for ${modelPath}:`, boneNames);

        setScene(fbx);
      },
      undefined,
      () => { setError(true); onError?.(); },
    );
  }, [modelPath]);

  useEffect(() => {
    if (!scene || !resolvedAnimation) return;
    setError(false);
    mixerRef.current = null;

    const animLoader = new FBXLoader();
    animLoader.load(
      resolvedAnimation,
      (animFbx) => {
        if (animFbx.animations.length === 0) return;
        const clip = animFbx.animations[0].clone();
        // Drop position/scale tracks — Mixamo Hips.position moves model off-screen
        clip.tracks = clip.tracks.filter((track) => track.name.endsWith(".quaternion"));
        for (const track of clip.tracks) {
          // Strip mixamorig: prefix first
          track.name = track.name.replace(/^mixamorig:?/i, "");
          // Apply bone map if available: remap animation bone names to model bone names
          if (boneMap) {
            // Track name format: "BoneName.quaternion"
            const dotIdx = track.name.indexOf(".");
            const boneName = dotIdx > -1 ? track.name.substring(0, dotIdx) : track.name;
            const suffix = dotIdx > -1 ? track.name.substring(dotIdx) : "";
            if (boneMap[boneName]) {
              const mapped = boneMap[boneName];
              track.name = mapped + suffix;
              // CC3 finger bones: Mixamo curls around X, CC3 curls around Z
              // Swap x↔z quaternion components to redirect curl from sideways to forward
              const isFinger = /Thumb|Index|Mid|Ring|Pinky/.test(mapped);
              if (isFinger && mapped.startsWith("CC_Base_")) {
                const isLeft = /CC_Base_L_/.test(mapped);
                const vals = (track as THREE.QuaternionKeyframeTrack).values;
                for (let i = 0; i < vals.length; i += 4) {
                  const ox = vals[i];
                  const oz = vals[i + 2];
                  if (isLeft) {
                    vals[i] = oz;        // x = old z
                    vals[i + 2] = -ox;   // z = -old x
                  } else {
                    vals[i] = -oz;       // x = -old z
                    vals[i + 2] = ox;    // z = old x
                  }
                }
              }
            }
          }
        }
        try {
          const mixer = new THREE.AnimationMixer(scene);
          mixer.clipAction(clip).play();
          mixerRef.current = mixer;
        } catch { }
      },
      undefined,
      () => { },
    );
    return () => { mixerRef.current?.stopAllAction(); mixerRef.current = null; };
  }, [scene, resolvedAnimation]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  if (error) return null;
  if (!scene) return null;

  return (
    <group ref={groupRef} position={[position?.[0] ?? 0, position?.[1] ?? 0, position?.[2] ?? 0]} rotation={rotation ?? [0, 0, 0]} scale={scale ?? 1}>
      <primitive object={scene} />
    </group>
  );
}

export function Avatar() {
  const { characterId } = useAppStore();
  const config = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0];
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => { setLoadFailed(false); }, [characterId]);

  if (loadFailed || config.type === "procedural") {
    return <ProceduralAvatar />;
  }

  if (config.type === "vrm" && config.modelPath) {
    return <VrmAvatar modelPath={config.modelPath} scale={config.scale} animationPath={config.animationPath} onError={() => setLoadFailed(true)} />;
  }

  if (config.type === "gltf" && config.modelPath) {
    return <GltfAvatar modelPath={config.modelPath} scale={config.scale} position={config.position} onError={() => setLoadFailed(true)} />;
  }

  if (config.type === "fbx" && config.modelPath) {
    return <FbxAvatar modelPath={config.modelPath} scale={config.scale} position={config.position} animationPath={config.animationPath} texturePath={config.texturePath} boneMap={config.boneMap} rotation={config.rotation} onError={() => setLoadFailed(true)} />;
  }

  return <ProceduralAvatar />;
}