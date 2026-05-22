import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useAppStore } from "@/stores/app";
import { ROOMS } from "@/config/rooms";

function ProceduralRoom({ colors }: { colors: { floor: string; wall: string; accent: string; fog: string } }) {
  const floorColor = useMemo(() => new THREE.Color(colors.floor), [colors]);
  const wallColor = useMemo(() => new THREE.Color(colors.wall), [colors]);
  const accentColor = useMemo(() => new THREE.Color(colors.accent), [colors]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 3, -5]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[-5, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[5, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.01, -4.9]}>
        <boxGeometry args={[8, 0.02, 0.02]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
      </mesh>
      <mesh position={[-4.9, 0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8, 0.02, 0.02]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
      </mesh>
      <mesh position={[4.9, 0.01, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[8, 0.02, 0.02]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.5, -3]}>
        <boxGeometry args={[3, 0.05, 1]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.5} />
      </mesh>
      {[[-1.4, 0.25, -3.4], [1.4, 0.25, -3.4], [-1.4, 0.25, -2.6], [1.4, 0.25, -2.6]].map(
        (pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
            <meshStandardMaterial color="#2a2a3e" />
          </mesh>
        ),
      )}
      <mesh position={[0, 1.0, -3.3]}>
        <boxGeometry args={[1.5, 0.8, 0.03]} />
        <meshStandardMaterial color="#111122" emissive={accentColor} emissiveIntensity={0.1} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

function GltfRoom({ modelPath, scale, position }: { modelPath: string; scale?: number; position?: [number, number, number] }) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <group position={position ?? [0, 0, 0]} scale={scale ?? 1}>
      <primitive object={clonedScene} />
    </group>
  );
}

export function Room() {
  const { roomModelId } = useAppStore();
  const config = ROOMS.find((r) => r.id === roomModelId) ?? ROOMS[0];

  if (config.type === "gltf" && config.modelPath) {
    return <GltfRoom modelPath={config.modelPath} scale={config.scale} position={config.position} />;
  }

  return <ProceduralRoom colors={config.colors!} />;
}
