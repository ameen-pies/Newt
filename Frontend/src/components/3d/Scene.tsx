import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { Room } from "./Room";

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      shadows
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#0a0a0f" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#6366f1" />
      <pointLight position={[-3, 2, -2]} intensity={0.3} color="#818cf8" />
      <pointLight position={[3, 2, -2]} intensity={0.3} color="#4f46e5" />
      <directionalLight
        position={[2, 5, 3]}
        intensity={0.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Environment */}
      <fog attach="fog" args={["#050510", 5, 15]} />

      {/* Scene objects */}
      <Room />
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
