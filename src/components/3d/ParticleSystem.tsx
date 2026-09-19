import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export const ParticleSystem: React.FC = () => {
  const status = useGameStore((state) => state.status);
  const speed = useGameStore((state) => state.speed);
  const isBoosting = useGameStore((state) => state.isBoosting);

  // Speed lines particles
  const count = 120;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 5 + 0.2;
      pos[i * 3 + 2] = -Math.random() * 80;
    }
    return pos;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  // Crash explosion particles
  const explosionCount = 60;
  const explosionVelocities = useMemo(() => {
    const vel = [];
    for (let i = 0; i < explosionCount; i++) {
      vel.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 18,
          Math.random() * 12 + 2,
          (Math.random() - 0.5) * 18
        )
      );
    }
    return vel;
  }, [explosionCount]);

  const explosionRef = useRef<THREE.Points>(null);
  const explosionActive = useRef(false);

  useFrame((_, delta) => {
    // Speed lines update
    if (pointsRef.current && status === 'PLAYING') {
      const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;
      const effectiveSpeed = speed * (isBoosting ? 2.5 : 1.4);

      for (let i = 0; i < count; i++) {
        array[i * 3 + 2] += effectiveSpeed * delta;
        if (array[i * 3 + 2] > 10) {
          array[i * 3 + 2] = -70 - Math.random() * 20;
          array[i * 3] = (Math.random() - 0.5) * 16;
          array[i * 3 + 1] = Math.random() * 5 + 0.2;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Explosion animation
    if (status === 'GAMEOVER') {
      if (!explosionActive.current && explosionRef.current) {
        explosionActive.current = true;
        const posAttr = explosionRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 0; i < explosionCount; i++) {
          array[i * 3] = 0;
          array[i * 3 + 1] = 0.5;
          array[i * 3 + 2] = 0;
        }
        posAttr.needsUpdate = true;
      }

      if (explosionRef.current) {
        const posAttr = explosionRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 0; i < explosionCount; i++) {
          const v = explosionVelocities[i];
          array[i * 3] += v.x * delta;
          array[i * 3 + 1] += v.y * delta;
          array[i * 3 + 2] += v.z * delta;
          v.y -= 25 * delta; // Gravity
        }
        posAttr.needsUpdate = true;
      }
    } else {
      explosionActive.current = false;
    }
  });

  return (
    <group>
      {/* Speed lines */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isBoosting ? 0.16 : 0.08}
          color={isBoosting ? '#38bdf8' : '#64748b'}
          transparent
          opacity={isBoosting ? 0.9 : 0.4}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Crash Explosion Sparks */}
      <points ref={explosionRef} visible={status === 'GAMEOVER'}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(explosionCount * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.35}
          color="#f97316"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
