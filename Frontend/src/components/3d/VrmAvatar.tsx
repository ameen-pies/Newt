import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { useAppStore } from "@/stores/app";

export function VrmAvatar({ modelPath, scale = 1, onError }: { modelPath: string; scale?: number; onError?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { isThinking } = useAppStore();
  const [vrm, setVrm] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setVrm(null);
    setError(false);
    const loader = new GLTFLoader();
    loader.register((parser: any) => new VRMLoaderPlugin(parser) as any);
    loader.load(
      modelPath,
      (gltf) => {
        const loadedVrm = (gltf as any).userData.vrm;
        if (loadedVrm) {
          VRMUtils.removeUnnecessaryJoints(gltf.scene);
          setVrm(loadedVrm);
        } else {
          setError(true);
          onError?.();
        }
      },
      undefined,
      () => { setError(true); onError?.(); },
    );
  }, [modelPath]);

  useFrame((state) => {
    if (!groupRef.current || !vrm) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    vrm.update(t);
  });

  if (error) return null;
  if (!vrm) return null;

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={vrm.scene} />
    </group>
  );
}
