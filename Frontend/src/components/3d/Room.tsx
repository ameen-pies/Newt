import { useMemo } from "react";
import * as THREE from "three";
import { useAppStore } from "@/stores/app";

const ROOM_STYLES = {
  cyberpunk: {
    floor: "#0a0a1a",
    wall: "#0f0f23",
    accent: "#6366f1",
    fog: "#050510",
  },
  minimalist: {
    floor: "#1a1a1a",
    wall: "#111111",
    accent: "#333333",
    fog: "#0a0a0a",
  },
  cozy: {
    floor: "#2d1f0e",
    wall: "#1a120a",
    accent: "#c4956a",
    fog: "#0d0805",
  },
};

export function Room() {
  const { roomStyle } = useAppStore();
  const style = ROOM_STYLES[roomStyle as keyof typeof ROOM_STYLES] || ROOM_STYLES.cyberpunk;

  const floorColor = useMemo(() => new THREE.Color(style.floor), [style]);
  const wallColor = useMemo(() => new THREE.Color(style.wall), [style]);
  const accentColor = useMemo(() => new THREE.Color(style.accent), [style]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 3, -5]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-5, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh position={[5, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Accent strips — neon lines */}
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

      {/* Desk */}
      <mesh position={[0, 0.5, -3]}>
        <boxGeometry args={[3, 0.05, 1]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Desk legs */}
      {[[-1.4, 0.25, -3.4], [1.4, 0.25, -3.4], [-1.4, 0.25, -2.6], [1.4, 0.25, -2.6]].map(
        (pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
            <meshStandardMaterial color="#2a2a3e" />
          </mesh>
        )
      )}

      {/* Monitor on desk */}
      <mesh position={[0, 1.0, -3.3]}>
        <boxGeometry args={[1.5, 0.8, 0.03]} />
        <meshStandardMaterial
          color="#111122"
          emissive={accentColor}
          emissiveIntensity={0.1}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}
