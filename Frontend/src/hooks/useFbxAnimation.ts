import { useEffect, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import { VRM, VRMHumanBoneName } from "@pixiv/three-vrm";

const FBX_TO_VRM: Record<string, VRMHumanBoneName> = {
  Hips: VRMHumanBoneName.Hips,
  Spine: VRMHumanBoneName.Spine,
  Chest: VRMHumanBoneName.Chest,
  UpperChest: VRMHumanBoneName.UpperChest,
  Neck: VRMHumanBoneName.Neck,
  Head: VRMHumanBoneName.Head,
  LeftEye: VRMHumanBoneName.LeftEye,
  RightEye: VRMHumanBoneName.RightEye,
  Jaw: VRMHumanBoneName.Jaw,

  // Standard VRM naming
  LeftUpperLeg: VRMHumanBoneName.LeftUpperLeg,
  LeftLowerLeg: VRMHumanBoneName.LeftLowerLeg,
  LeftUpperArm: VRMHumanBoneName.LeftUpperArm,
  LeftLowerArm: VRMHumanBoneName.LeftLowerArm,
  RightUpperLeg: VRMHumanBoneName.RightUpperLeg,
  RightLowerLeg: VRMHumanBoneName.RightLowerLeg,
  RightUpperArm: VRMHumanBoneName.RightUpperArm,
  RightLowerArm: VRMHumanBoneName.RightLowerArm,

  // Common FBX / Mixamo naming aliases
  LeftUpLeg: VRMHumanBoneName.LeftUpperLeg,
  LeftLeg: VRMHumanBoneName.LeftLowerLeg,
  LeftArm: VRMHumanBoneName.LeftUpperArm,
  LeftForeArm: VRMHumanBoneName.LeftLowerArm,
  RightUpLeg: VRMHumanBoneName.RightUpperLeg,
  RightLeg: VRMHumanBoneName.RightLowerLeg,
  RightArm: VRMHumanBoneName.RightUpperArm,
  RightForeArm: VRMHumanBoneName.RightLowerArm,

  LeftFoot: VRMHumanBoneName.LeftFoot,
  LeftToes: VRMHumanBoneName.LeftToes,
  LeftToe: VRMHumanBoneName.LeftToes,
  RightFoot: VRMHumanBoneName.RightFoot,
  RightToes: VRMHumanBoneName.RightToes,
  RightToe: VRMHumanBoneName.RightToes,

  LeftShoulder: VRMHumanBoneName.LeftShoulder,
  LeftHand: VRMHumanBoneName.LeftHand,
  RightShoulder: VRMHumanBoneName.RightShoulder,
  RightHand: VRMHumanBoneName.RightHand,

  // FBX finger naming → VRM proximal joints
  LeftHandThumb: VRMHumanBoneName.LeftThumbProximal,
  LeftHandIndex: VRMHumanBoneName.LeftIndexProximal,
  LeftHandMiddle: VRMHumanBoneName.LeftMiddleProximal,
  LeftHandRing: VRMHumanBoneName.LeftRingProximal,
  RightHandThumb: VRMHumanBoneName.RightThumbProximal,
  RightHandIndex: VRMHumanBoneName.RightIndexProximal,
  RightHandMiddle: VRMHumanBoneName.RightMiddleProximal,
  RightHandRing: VRMHumanBoneName.RightRingProximal,

  // Full finger skeleton (proximal/distal)
  LeftThumbProximal: VRMHumanBoneName.LeftThumbProximal,
  LeftThumbDistal: VRMHumanBoneName.LeftThumbDistal,
  LeftIndexProximal: VRMHumanBoneName.LeftIndexProximal,
  LeftIndexDistal: VRMHumanBoneName.LeftIndexDistal,
  LeftMiddleProximal: VRMHumanBoneName.LeftMiddleProximal,
  LeftMiddleDistal: VRMHumanBoneName.LeftMiddleDistal,
  LeftRingProximal: VRMHumanBoneName.LeftRingProximal,
  LeftRingDistal: VRMHumanBoneName.LeftRingDistal,
  LeftLittleProximal: VRMHumanBoneName.LeftLittleProximal,
  LeftLittleDistal: VRMHumanBoneName.LeftLittleDistal,
  RightThumbProximal: VRMHumanBoneName.RightThumbProximal,
  RightThumbDistal: VRMHumanBoneName.RightThumbDistal,
  RightIndexProximal: VRMHumanBoneName.RightIndexProximal,
  RightIndexDistal: VRMHumanBoneName.RightIndexDistal,
  RightMiddleProximal: VRMHumanBoneName.RightMiddleProximal,
  RightMiddleDistal: VRMHumanBoneName.RightMiddleDistal,
  RightRingProximal: VRMHumanBoneName.RightRingProximal,
  RightRingDistal: VRMHumanBoneName.RightRingDistal,
  RightLittleProximal: VRMHumanBoneName.RightLittleProximal,
  RightLittleDistal: VRMHumanBoneName.RightLittleDistal,
};

function stripMixamoPrefix(name: string): string {
  const idx = name.indexOf(":");
  return idx >= 0 ? name.substring(idx + 1) : name;
}

function remapTrack(track: THREE.KeyframeTrack, vrm: VRM): THREE.KeyframeTrack | null {
  const dotIdx = track.name.indexOf(".");
  if (dotIdx === -1) return null;

  const boneName = stripMixamoPrefix(track.name.substring(0, dotIdx));
  const property = track.name.substring(dotIdx);

  const vrmBoneName = FBX_TO_VRM[boneName];
  if (!vrmBoneName) return null;

  const boneNode = vrm.humanoid?.getRawBoneNode(vrmBoneName);
  if (!boneNode) return null;

  const newName = boneNode.name + property;

  if (track instanceof THREE.QuaternionKeyframeTrack) {
    return new THREE.QuaternionKeyframeTrack(newName, track.times, track.values);
  }
  if (track instanceof THREE.VectorKeyframeTrack) {
    return new THREE.VectorKeyframeTrack(newName, track.times, track.values);
  }
  if (track instanceof THREE.NumberKeyframeTrack) {
    return new THREE.NumberKeyframeTrack(newName, track.times, track.values);
  }
  const cloned = track.clone();
  (cloned as any).name = newName;
  return cloned;
}

export function useFbxAnimation(fbxPath: string, vrm: VRM | null) {
  const [clip, setClip] = useState<THREE.AnimationClip | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!vrm) return;
    setClip(null);
    setError(false);

    const loader = new FBXLoader();
    loader.load(
      fbxPath,
      (fbx) => {
        const clips = fbx.animations;
        if (!clips || clips.length === 0) {
          setError(true);
          return;
        }

        const src = clips[0];
        const remapped: THREE.KeyframeTrack[] = [];

        for (const track of src.tracks) {
          const r = remapTrack(track, vrm);
          if (r) remapped.push(r);
        }

        if (remapped.length === 0) {
          setError(true);
          return;
        }

        setClip(new THREE.AnimationClip(src.name, src.duration, remapped));
      },
      undefined,
      () => setError(true),
    );
  }, [fbxPath, vrm]);

  return { clip, error };
}
