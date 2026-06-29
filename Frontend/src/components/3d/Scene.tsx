import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        target={[0, 1.2, 0]}
      />
    </Canvas>
  );
}
