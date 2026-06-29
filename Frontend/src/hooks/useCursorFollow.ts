import { useRef, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const mouseNDC = new THREE.Vector2();
const worldDir = new THREE.Vector3();
const headWorldPos = new THREE.Vector3();

type FollowState = "idle" | "glancing" | "following";

export function useCursorFollow(
  headRef: React.RefObject<THREE.Object3D | null>,
  options?: { idleWeight?: number; followWeight?: number; glancingWeight?: number }
) {
  const { camera, gl } = useThree();
  const state = useRef<FollowState>("idle");
  const followStrength = useRef(0);
  const idleTimer = useRef(0);
  const glanceTimer = useRef(0);
  const nextBoredAt = useRef(3 + Math.random() * 5);
  const nextGlanceAt = useRef(8 + Math.random() * 12);
  const glanceDuration = useRef(0);

  const idleWeight = options?.idleWeight ?? 0.15;
  const followWeight = options?.followWeight ?? 0.35;
  const glancingWeight = options?.glancingWeight ?? 0.2;

  const onMouseMove = useCallback((e: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }, [gl.domElement]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  useFrame((_, delta) => {
    if (!headRef.current) return;

    const t = idleTimer.current + delta;
    idleTimer.current = t;

    switch (state.current) {
      case "idle": {
        followStrength.current += (0 - followStrength.current) * 0.02;
        if (t >= nextBoredAt.current) {
          state.current = "following";
          nextBoredAt.current = t + 3 + Math.random() * 5;
        }
        break;
      }
      case "following": {
        followStrength.current += (followWeight - followStrength.current) * 0.015;
        glanceTimer.current += delta;
        if (glanceTimer.current >= nextGlanceAt.current) {
          state.current = "glancing";
          glanceTimer.current = 0;
          nextGlanceAt.current = 5 + Math.random() * 8;
          glanceDuration.current = 0.5 + Math.random() * 1.5;
        }
        break;
      }
      case "glancing": {
        followStrength.current += (glancingWeight - followStrength.current) * 0.03;
        glanceTimer.current += delta;
        if (glanceTimer.current >= glanceDuration.current) {
          state.current = "idle";
          glanceTimer.current = 0;
          idleTimer.current = 0;
        }
        break;
      }
    }

    followStrength.current = THREE.MathUtils.clamp(followStrength.current, 0, followWeight + 0.05);

    if (followStrength.current < 0.001) return;

    headRef.current.getWorldPosition(headWorldPos);
    worldDir.set(mouseNDC.x * 3, mouseNDC.y * 2 + 1, 0.5).sub(headWorldPos).normalize();

    const yaw = Math.atan2(worldDir.x, worldDir.z);
    const pitch = Math.asin(THREE.MathUtils.clamp(worldDir.y, -0.5, 0.5));

    const targetQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(pitch * followStrength.current, yaw * followStrength.current, 0)
    );

    headRef.current.quaternion.slerp(targetQuat, 0.02 + followStrength.current * 0.03);
  });
}
