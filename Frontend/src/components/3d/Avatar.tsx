import { useEffect, useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader, FBXLoader } from "three-stdlib";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { useAppStore } from "@/stores/app";
import { CHARACTERS } from "@/config/characters";
import { VrmAvatar } from "./VrmAvatar";
import { useCursorFollow } from "@/hooks/useCursorFollow";

function ProceduralAvatar() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const { cognitiveState, isThinking } = useAppStore();
  const { camera } = useThree();
  const headTargetQuat = useMemo(() => new THREE.Quaternion(), []);

  useCursorFollow(headRef);

  const bodyColor = useMemo(() => new THREE.Color("#2a2a3e"), []);
  const accentColor = useMemo(() => new THREE.Color("#6366f1"), []);
  const eyeColor = useMemo(() => new THREE.Color("#818cf8"), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.05 + 1.0;

    if (headRef.current) {
      const headWorldPos = new THREE.Vector3();
      headRef.current.getWorldPosition(headWorldPos);
      const dir = new THREE.Vector3().subVectors(camera.position, headWorldPos).normalize();
      const yaw = Math.atan2(dir.x, dir.z);
      const pitch = Math.asin(THREE.MathUtils.clamp(dir.y, -0.5, 0.5));
      headTargetQuat.setFromEuler(new THREE.Euler(pitch * 0.6, yaw * 0.5, isThinking ? Math.sin(t * 2) * 0.1 : 0));
      headRef.current.quaternion.slerp(headTargetQuat, 0.05);
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
  const innerRef = useRef<THREE.Group>(null);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [error, setError] = useState(false);
  const { camera } = useThree();
  const targetQuat = useMemo(() => new THREE.Quaternion(), []);

  useCursorFollow(innerRef, { followWeight: 0.25 });

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

    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const dir = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
    const yaw = Math.atan2(dir.x, dir.z);
    targetQuat.setFromEuler(new THREE.Euler(0, yaw, 0));
    groupRef.current.quaternion.slerp(targetQuat, 0.03);
  });

  if (error) return null;
  if (!scene) return null;

  return (
    <group ref={groupRef} position={[position?.[0] ?? 0, position?.[1] ?? 0, position?.[2] ?? 0]} scale={scale ?? 1}>
      <group ref={innerRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

function FbxAvatar({ modelPath, scale, position, animationPath, texturePath, boneMap, rotation, onError }: { modelPath: string; scale?: number; position?: [number, number, number]; animationPath?: string; texturePath?: string; boneMap?: Record<string, string>; rotation?: [number, number, number]; onError?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [error, setError] = useState(false);
  const testAnimation = useAppStore((s) => s.testAnimation);
  const resolvedAnimation = testAnimation ?? animationPath;
  const { camera } = useThree();
  const targetQuat = useMemo(() => new THREE.Quaternion(), []);
  const staticRotation = useMemo(() => {
    if (rotation) return new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2]));
    return new THREE.Quaternion();
  }, [rotation]);

  useCursorFollow(innerRef, { followWeight: 0.25 });

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
          return "m_body";
        }

        fbx.traverse((child) => {
          if (child.type !== "SkinnedMesh") return;
          const mesh = child as THREE.SkinnedMesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

          for (let i = 0; i < materials.length; i++) {
            const mat = materials[i];
            if (!mat) continue;
            const prefix = getTexturePrefix(mat.name || mesh.name);

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
              textureLoader.load(texBase + prefix + "_diffuse.png", (tex) => {
                standardMat.map = tex;
                standardMat.color.set(0xffffff);
                standardMat.needsUpdate = true;
              });
              textureLoader.load(texBase + prefix + "_normal.png", (tex) => {
                standardMat.normalMap = tex;
                standardMat.needsUpdate = true;
              });
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

        const boneNames: string[] = [];
        fbx.traverse((child) => {
          if (child.type === "Bone") boneNames.push(child.name);
        });
        console.log(`[Avatar] Bone names for ${modelPath}:`, boneNames);

        const materialNames: string[] = [];
        fbx.traverse((child) => {
          if (child.type !== "SkinnedMesh") return;
          const mesh = child as THREE.SkinnedMesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of materials) {
            if (mat) materialNames.push(mat.name || mesh.name);
          }
        });
        console.log(`[Avatar] Material names for ${modelPath}:`, [...new Set(materialNames)]);

        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        console.log(`[Avatar] ${modelPath} — center: (${center.x.toFixed(1)}, ${center.y.toFixed(1)}, ${center.z.toFixed(1)}) size: (${size.x.toFixed(1)}, ${size.y.toFixed(1)}, ${size.z.toFixed(1)})`);

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
        clip.tracks = clip.tracks.filter((track) => track.name.endsWith(".quaternion"));
        for (const track of clip.tracks) {
          track.name = track.name.replace(/^mixamorig:?/i, "");
          if (boneMap) {
            const dotIdx = track.name.indexOf(".");
            const boneName = dotIdx > -1 ? track.name.substring(0, dotIdx) : track.name;
            const suffix = dotIdx > -1 ? track.name.substring(dotIdx) : "";
            if (boneMap[boneName]) {
              const mapped = boneMap[boneName];
              track.name = mapped + suffix;
              const isFinger = /Thumb|Index|Mid|Ring|Pinky/.test(mapped);
              if (isFinger && mapped.startsWith("CC_Base_")) {
                const isLeft = /CC_Base_L_/.test(mapped);
                const vals = (track as THREE.QuaternionKeyframeTrack).values;
                for (let i = 0; i < vals.length; i += 4) {
                  const ox = vals[i];
                  const oz = vals[i + 2];
                  if (isLeft) {
                    vals[i] = oz;
                    vals[i + 2] = -ox;
                  } else {
                    vals[i] = -oz;
                    vals[i + 2] = ox;
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

    if (!groupRef.current) return;
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const dir = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
    const yaw = Math.atan2(dir.x, dir.z);
    targetQuat.copy(staticRotation);
    targetQuat.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)));
    groupRef.current.quaternion.slerp(targetQuat, 0.03);
  });

  if (error) return null;
  if (!scene) return null;

  return (
    <group ref={groupRef} position={[position?.[0] ?? 0, position?.[1] ?? 0, position?.[2] ?? 0]} scale={scale ?? 1}>
      <group ref={innerRef} rotation={rotation ?? [0, 0, 0]}>
        <primitive object={scene} />
      </group>
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