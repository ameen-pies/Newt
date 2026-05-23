import { useEffect, useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader, FBXLoader } from "three-stdlib";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { useAppStore } from "@/stores/app";
import { CHARACTERS } from "@/config/characters";
import { VrmAvatar } from "./VrmAvatar";

const STANDARD_TO_J_BIP: Record<string, string> = {
  Hips: "J_Bip_C_Hips",
  Spine: "J_Bip_C_Spine",
  Spine1: "J_Bip_C_Chest",
  Spine2: "J_Bip_C_UpperChest",
  Neck: "J_Bip_C_Neck",
  Head: "J_Bip_C_Head",
  // Left arm
  LeftShoulder: "J_Bip_L_Shoulder",
  LeftArm: "J_Bip_L_UpperArm",
  LeftForeArm: "J_Bip_L_LowerArm",
  LeftHand: "J_Bip_L_Hand",
  // Left leg
  LeftUpLeg: "J_Bip_L_UpperLeg",
  LeftLeg: "J_Bip_L_LowerLeg",
  LeftFoot: "J_Bip_L_Foot",
  LeftToeBase: "J_Bip_L_ToeBase",
  // Right arm
  RightShoulder: "J_Bip_R_Shoulder",
  RightArm: "J_Bip_R_UpperArm",
  RightForeArm: "J_Bip_R_LowerArm",
  RightHand: "J_Bip_R_Hand",
  // Right leg
  RightUpLeg: "J_Bip_R_UpperLeg",
  RightLeg: "J_Bip_R_LowerLeg",
  RightFoot: "J_Bip_R_Foot",
  RightToeBase: "J_Bip_R_ToeBase",
  // Left fingers
  LeftHandThumb1: "J_Bip_L_Thumb1",
  LeftHandThumb2: "J_Bip_L_Thumb2",
  LeftHandThumb3: "J_Bip_L_Thumb3",
  LeftHandIndex1: "J_Bip_L_Index1",
  LeftHandIndex2: "J_Bip_L_Index2",
  LeftHandIndex3: "J_Bip_L_Index3",
  LeftHandMiddle1: "J_Bip_L_Middle1",
  LeftHandMiddle2: "J_Bip_L_Middle2",
  LeftHandMiddle3: "J_Bip_L_Middle3",
  LeftHandRing1: "J_Bip_L_Ring1",
  LeftHandRing2: "J_Bip_L_Ring2",
  LeftHandRing3: "J_Bip_L_Ring3",
  LeftHandPinky1: "J_Bip_L_Little1",
  LeftHandPinky2: "J_Bip_L_Little2",
  LeftHandPinky3: "J_Bip_L_Little3",
  // Right fingers
  RightHandThumb1: "J_Bip_R_Thumb1",
  RightHandThumb2: "J_Bip_R_Thumb2",
  RightHandThumb3: "J_Bip_R_Thumb3",
  RightHandIndex1: "J_Bip_R_Index1",
  RightHandIndex2: "J_Bip_R_Index2",
  RightHandIndex3: "J_Bip_R_Index3",
  RightHandMiddle1: "J_Bip_R_Middle1",
  RightHandMiddle2: "J_Bip_R_Middle2",
  RightHandMiddle3: "J_Bip_R_Middle3",
  RightHandRing1: "J_Bip_R_Ring1",
  RightHandRing2: "J_Bip_R_Ring2",
  RightHandRing3: "J_Bip_R_Ring3",
  RightHandPinky1: "J_Bip_R_Little1",
  RightHandPinky2: "J_Bip_R_Little2",
  RightHandPinky3: "J_Bip_R_Little3",
};

function remapMixamoTracks(clip: THREE.AnimationClip): THREE.AnimationClip {
  const tracks = clip.tracks.flatMap((track) => {
    const match = track.name.match(/^(?:mixamorig:?)([^.]+)\.(.+)$/);
    if (!match) return [track];
    const bone = match[1];
    const prop = match[2];
    const jBip = STANDARD_TO_J_BIP[bone];
    if (!jBip) return [track];
    if (jBip === "J_Bip_C_Hips" && prop === "position") return [];
    const newName = `${jBip}.${prop}`;
    const ctor = track.constructor as new (name: string, times: Float32Array, values: Float32Array, interpolation?: number) => THREE.KeyframeTrack;
    return [new ctor(newName, track.times, track.values)];
  });
  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

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

function FbxAvatar({ modelPath, scale, position, animationPath, onError }: { modelPath: string; scale?: number; position?: [number, number, number]; animationPath?: string; onError?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setScene(null);
    setError(false);
    mixerRef.current = null;
    const loader = new FBXLoader();
    loader.load(
      modelPath,
      (fbx) => {
        setScene(fbx);
        const bones: string[] = [];
        fbx.traverse((child) => { if ((child as THREE.Bone).isBone) bones.push(child.name); });
        if (bones.length) console.log(`[FbxAvatar] Model bones (${modelPath}):`, bones.slice(0, 50).join(", "));
        if (!animationPath && fbx.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(fbx);
          mixer.clipAction(fbx.animations[0]).play();
          mixerRef.current = mixer;
        }
      },
      undefined,
      () => { setError(true); onError?.(); },
    );
  }, [modelPath]);

  useEffect(() => {
    if (!scene || !animationPath) return;
    setError(false);
    mixerRef.current = null;
    const animLoader = new FBXLoader();
    animLoader.load(
      animationPath,
      (animFbx) => {
        if (animFbx.animations.length === 0) return;
        const clip = remapMixamoTracks(animFbx.animations[0]);
        const mixer = new THREE.AnimationMixer(scene);
        mixer.clipAction(clip).play();
        mixerRef.current = mixer;
      },
      undefined,
      () => { setError(true); onError?.(); },
    );
    return () => { mixerRef.current?.stopAllAction(); mixerRef.current = null; };
  }, [scene, animationPath]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = performance.now() / 1000;
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.05 + (position?.[1] ?? 0);
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    mixerRef.current?.update(delta);
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
    return <VrmAvatar modelPath={config.modelPath} scale={config.scale} animationPath={config.animationPath} onError={() => setLoadFailed(true)} />;
  }

  if (config.type === "gltf" && config.modelPath) {
    return <GltfAvatar modelPath={config.modelPath} scale={config.scale} position={config.position} onError={() => setLoadFailed(true)} />;
  }

  if (config.type === "fbx" && config.modelPath) {
    return <FbxAvatar modelPath={config.modelPath} scale={config.scale} position={config.position} animationPath={config.animationPath} onError={() => setLoadFailed(true)} />;
  }

  return <ProceduralAvatar />;
}
