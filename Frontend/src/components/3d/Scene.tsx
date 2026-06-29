import { Canvas } from "@react-three/fiber";
import { Avatar } from "./Avatar";

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#6366f1" />
      <pointLight position={[-3, 2, -2]} intensity={0.5} color="#818cf8" />
      <pointLight position={[3, 2, -2]} intensity={0.5} color="#4f46e5" />
      <directionalLight
        position={[2, 5, 3]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={["#6366f1", "#0a0a1a", 0.4]} />

      {/* Scene objects */}
      <Avatar />
    </Canvas>
  );
}
