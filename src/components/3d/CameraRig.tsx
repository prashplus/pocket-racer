import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { LANE_POSITIONS } from '../../types/game';

export const CameraRig: React.FC = () => {
  const { camera } = useThree();
  const perspectiveCamera = camera as THREE.PerspectiveCamera;

  const lane = useGameStore((state) => state.lane);
  const isBoosting = useGameStore((state) => state.isBoosting);
  const status = useGameStore((state) => state.status);
  const trauma = useGameStore((state) => state.trauma);
  const tick = useGameStore((state) => state.tick);

  const currentCamX = useRef(0);
  const currentFov = useRef(62);

  useFrame((_, delta) => {
    // Tick game simulation loop
    tick(delta);

    const targetX = LANE_POSITIONS[lane] * 0.92; // Follow car directly into lane
    currentCamX.current = THREE.MathUtils.lerp(currentCamX.current, targetX, delta * 8);

    // Dynamic FOV warp on boost
    const targetFov = isBoosting ? 76 : 62;
    currentFov.current = THREE.MathUtils.lerp(currentFov.current, targetFov, delta * 8);
    perspectiveCamera.fov = currentFov.current;
    perspectiveCamera.updateProjectionMatrix();

    // Camera shake (trauma squared for non-linear impactful feel)
    const shake = trauma * trauma;
    const shakeX = (Math.random() - 0.5) * shake * 1.5;
    const shakeY = (Math.random() - 0.5) * shake * 1.5;
    const shakeRoll = (Math.random() - 0.5) * shake * 0.08;

    // Crash camera behavior: pull back slightly or drop
    const baseZ = status === 'GAMEOVER' ? 7.0 : 6.2;
    const baseY = status === 'GAMEOVER' ? 3.6 : 3.2;

    camera.position.x = currentCamX.current + shakeX;
    camera.position.y = baseY + shakeY;
    camera.position.z = baseZ;

    camera.lookAt(currentCamX.current * 0.92, 1.1, -16);
    camera.rotation.z += shakeRoll;
  });

  return null;
};
