import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { useAppStore } from "@/stores/app";
import { useFbxAnimation } from "@/hooks/useFbxAnimation";

export function VrmAvatar({ modelPath, scale = 1, animationPath, onError }: { modelPath: string; scale?: number; animationPath?: string; onError?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const { isThinking } = useAppStore();
  const [vrm, setVrm] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setVrm(null);
    setError(false);
    mixerRef.current = null;
    const loader = new GLTFLoader();
    loader.register((parser: any) => new VRMLoaderPlugin(parser) as any);
    loader.load(
      modelPath,
      (gltf) => {
        const loadedVrm = (gltf as any).userData.vrm;
        if (loadedVrm) {
          VRMUtils.combineSkeletons(gltf.scene);
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

  const { clip, error: animError } = useFbxAnimation(animationPath ?? "", animationPath ? vrm : null);

  useEffect(() => {
    if (!vrm || !clip) return;
    const mixer = new THREE.AnimationMixer(vrm.scene);
    const action = mixer.clipAction(clip);
    action.play();
    mixerRef.current = mixer;
    return () => { mixer.stopAllAction(); mixerRef.current = null; };
  }, [vrm, clip]);

  useFrame((state, delta) => {
    if (!groupRef.current || !vrm) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    vrm.update(t);
    mixerRef.current?.update(delta);
  });

  if (error) return null;
  if (!vrm) return null;

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={vrm.scene} />
    </group>
  );
}
