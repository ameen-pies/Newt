import type { BoneMap } from "./index";

/**
 * Lucy (colourly_female_base.fbx) bone names.
 * Names have no dots or separators: ShoulderL, ArmL, Spine001, etc.
 * Maps Mixamo bone names (after prefix strip) → Lucy bone names.
 */
export const LUCY_BONE_MAP: BoneMap = {
  // Spine
  "Spine": "Spine001",

  // Left side
  "LeftShoulder": "ShoulderL",
  "LeftArm": "ArmL",
  "LeftForeArm": "ForeArmL",
  "LeftHand": "HandL",
  "LeftHandThumb1": "HandThumb1L",
  "LeftHandThumb2": "HandThumb2L",
  "LeftHandThumb3": "HandThumb3L",
  "LeftHandThumb4": "HandThumb3L",
  "LeftHandIndex1": "HandIndex1L",
  "LeftHandIndex2": "HandIndex2L",
  "LeftHandIndex3": "HandIndex3L",
  "LeftHandIndex4": "HandIndex3L",
  "LeftHandMiddle1": "HandMiddle1L",
  "LeftHandMiddle2": "HandMiddle2L",
  "LeftHandMiddle3": "HandMiddle3L",
  "LeftHandMiddle4": "HandMiddle3L",
  "LeftHandRing1": "HandRing1L",
  "LeftHandRing2": "HandRing2L",
  "LeftHandRing3": "HandRing3L",
  "LeftHandRing4": "HandRing3L",
  "LeftHandPinky1": "HandPinky1L",
  "LeftHandPinky2": "HandPinky2L",
  "LeftHandPinky3": "HandPinky3L",
  "LeftHandPinky4": "HandPinky3L",
  "LeftUpLeg": "UpLegL",
  "LeftLeg": "LegL",
  "LeftFoot": "FootL",
  "LeftToeBase": "ToeBaseL",

  // Right side
  "RightShoulder": "ShoulderR",
  "RightArm": "ArmR",
  "RightForeArm": "ForeArmR",
  "RightHand": "HandR",
  "RightHandThumb1": "HandThumb1R",
  "RightHandThumb2": "HandThumb2R",
  "RightHandThumb3": "HandThumb3R",
  "RightHandThumb4": "HandThumb3R",
  "RightHandIndex1": "HandIndex1R",
  "RightHandIndex2": "HandIndex2R",
  "RightHandIndex3": "HandIndex3R",
  "RightHandIndex4": "HandIndex3R",
  "RightHandMiddle1": "HandMiddle1R",
  "RightHandMiddle2": "HandMiddle2R",
  "RightHandMiddle3": "HandMiddle3R",
  "RightHandMiddle4": "HandMiddle3R",
  "RightHandRing1": "HandRing1R",
  "RightHandRing2": "HandRing2R",
  "RightHandRing3": "HandRing3R",
  "RightHandRing4": "HandRing3R",
  "RightHandPinky1": "HandPinky1R",
  "RightHandPinky2": "HandPinky2R",
  "RightHandPinky3": "HandPinky3R",
  "RightHandPinky4": "HandPinky3R",
  "RightUpLeg": "UpLegR",
  "RightLeg": "LegR",
  "RightFoot": "FootR",
  "RightToeBase": "ToeBaseR",
};
