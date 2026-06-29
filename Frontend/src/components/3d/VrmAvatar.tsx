import { useEffect, useRef, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { useAppStore } from "@/stores/app";
import { useFbxAnimation } from "@/hooks/useFbxAnimation";

const mouseNDC = new THREE.Vector2();
type FollowState = "idle" | "glancing" | "following";

export function VrmAvatar({ modelPath, scale = 1, animationPath, onError }: { modelPath: string; scale?: number; animationPath?: string; onError?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const { isThinking } = useAppStore();
  const { camera, gl } = useThree();
  const [vrm, setVrm] = useState<any>(null);
  const [error, setError] = useState(false);
  const lookAtTarget = useRef(new THREE.Vector3(0, 2, 5));

  const followState = useRef<FollowState>("idle");
  const followStrength = useRef(0);
  const idleTimer = useRef(0);
  const glanceTimer = useRef(0);
  const nextBoredAt = useRef(3 + Math.random() * 5);
  const nextGlanceAt = useRef(8 + Math.random() * 12);
  const glanceDuration = useRef(0);
  const cameraDefault = useRef(new THREE.Vector3(0, 2, 5));

  const onMouseMove = useCallback((e: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }, [gl.domElement]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

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

    if (vrm.lookAt) {
      idleTimer.current += delta;

      switch (followState.current) {
        case "idle":
          followStrength.current += (0 - followStrength.current) * 0.02;
          if (idleTimer.current >= nextBoredAt.current) {
            followState.current = "following";
            nextBoredAt.current = idleTimer.current + 3 + Math.random() * 5;
          }
          break;
        case "following":
          followStrength.current += (0.35 - followStrength.current) * 0.015;
          glanceTimer.current += delta;
          if (glanceTimer.current >= nextGlanceAt.current) {
            followState.current = "glancing";
            glanceTimer.current = 0;
            nextGlanceAt.current = 5 + Math.random() * 8;
            glanceDuration.current = 0.5 + Math.random() * 1.5;
          }
          break;
        case "glancing":
          followStrength.current += (0.2 - followStrength.current) * 0.03;
          glanceTimer.current += delta;
          if (glanceTimer.current >= glanceDuration.current) {
            followState.current = "idle";
            glanceTimer.current = 0;
            idleTimer.current = 0;
          }
          break;
      }

      followStrength.current = THREE.MathUtils.clamp(followStrength.current, 0, 0.4);

      const cursorWorld = new THREE.Vector3(mouseNDC.x * 3, mouseNDC.y * 2 + 1, 0.5);
      lookAtTarget.current.copy(cameraDefault.current).lerp(cursorWorld, followStrength.current);
      vrm.lookAt.target = lookAtTarget.current;
    }

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
