import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export const SynthwaveBackdrop: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const theme = useGameStore((state) => state.theme);

  const isLight = theme === 'light';

  useFrame((state) => {
    if (sunRef.current) {
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 1.5) * 0.02;
      sunRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group position={[0, 0, -160]}>
      {/* Sun (Golden in Light Mode, Neon Pink in Dark Mode) */}
      <mesh ref={sunRef} position={[0, 22, 0]}>
        <circleGeometry args={[isLight ? 22 : 26, 32]} />
        <meshBasicMaterial color={isLight ? '#f59e0b' : '#ec4899'} />
      </mesh>

      {/* Sun Glow Corona */}
      <mesh position={[0, 22, -1]}>
        <circleGeometry args={[isLight ? 32 : 36, 32]} />
        <meshBasicMaterial
          color={isLight ? '#fde68a' : '#f43f5e'}
          transparent
          opacity={isLight ? 0.35 : 0.45}
        />
      </mesh>

      {/* Distant Mountain / City Silhouettes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const width = 8 + (i % 5) * 4;
        const height = isLight ? 16 + ((i * 5) % 18) : 14 + ((i * 7) % 24);
        const x = -100 + i * 8.5;
        return (
          <mesh key={i} position={[x, height / 2 - 2, 5]}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial color={isLight ? '#64748b' : '#050814'} />
          </mesh>
        );
      })}

      {/* Horizon Ground Plane */}
      <mesh position={[0, -0.5, 60]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[260, 160]} />
        <meshBasicMaterial color={isLight ? '#94a3b8' : '#02040a'} />
      </mesh>
    </group>
  );
};
