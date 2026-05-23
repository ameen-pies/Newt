import { useEffect, useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
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
    <group ref={groupRef} position={[position?.[0] ?? 0, 0, position?.[2] ?? 0]} scale={scale ?? 1}>
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
    return <VrmAvatar modelPath={config.modelPath} scale={config.scale} onError={() => setLoadFailed(true)} />;
  }

  if (config.type === "gltf" && config.modelPath) {
    return <GltfAvatar modelPath={config.modelPath} scale={config.scale} position={config.position} onError={() => setLoadFailed(true)} />;
  }

  return <ProceduralAvatar />;
}
