import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

const SEGMENT_LENGTH = 50;
const NUM_SEGMENTS = 5;
const TOTAL_SPAN = SEGMENT_LENGTH * NUM_SEGMENTS; // 250

interface RoadSegmentProps {
  initialZ: number;
}

const RoadSegment: React.FC<RoadSegmentProps> = ({ initialZ }) => {
  const groupRef = useRef<THREE.Group>(null);
  const speed = useGameStore((state) => state.speed);
  const theme = useGameStore((state) => state.theme);

  const isLight = theme === 'light';

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Move backward (toward +Z) to simulate forward travel
    groupRef.current.position.z += speed * delta;

    // Seamless wrap when past the camera
    if (groupRef.current.position.z > 35) {
      groupRef.current.position.z -= TOTAL_SPAN;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, initialZ]}>
      {/* Road Asphalt Deck */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11.5, SEGMENT_LENGTH]} />
        <meshStandardMaterial
          color={isLight ? '#334155' : '#080c16'}
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* Road Shoulder Edges (White solid line) */}
      <mesh position={[-5.2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, SEGMENT_LENGTH]} />
        <meshBasicMaterial color={isLight ? '#ffffff' : '#06b6d4'} opacity={0.8} transparent />
      </mesh>
      <mesh position={[5.2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, SEGMENT_LENGTH]} />
        <meshBasicMaterial color={isLight ? '#ffffff' : '#06b6d4'} opacity={0.8} transparent />
      </mesh>

      {/* Center Lane Divider 1 (between Left & Center) */}
      {Array.from({ length: 10 }).map((_, idx) => (
        <mesh
          key={`dash1-${idx}`}
          position={[-1.65, 0.01, -SEGMENT_LENGTH / 2 + idx * 5 + 2.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.16, 2.8]} />
          <meshBasicMaterial
            color={isLight ? '#facc15' : '#06b6d4'}
            opacity={isLight ? 0.95 : 0.85}
            transparent
          />
        </mesh>
      ))}

      {/* Center Lane Divider 2 (between Center & Right) */}
      {Array.from({ length: 10 }).map((_, idx) => (
        <mesh
          key={`dash2-${idx}`}
          position={[1.65, 0.01, -SEGMENT_LENGTH / 2 + idx * 5 + 2.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.16, 2.8]} />
          <meshBasicMaterial
            color={isLight ? '#facc15' : '#06b6d4'}
            opacity={isLight ? 0.95 : 0.85}
            transparent
          />
        </mesh>
      ))}

      {/* Left Highway Barrier */}
      <mesh position={[-5.5, 0.35, 0]}>
        <boxGeometry args={[0.3, 0.7, SEGMENT_LENGTH]} />
        <meshStandardMaterial color={isLight ? '#64748b' : '#111827'} metalness={0.4} />
      </mesh>
      {/* Left Glow Strip / Reflector */}
      <mesh position={[-5.32, 0.45, 0]}>
        <boxGeometry args={[0.06, 0.1, SEGMENT_LENGTH]} />
        <meshBasicMaterial color={isLight ? '#f97316' : '#ec4899'} />
      </mesh>

      {/* Right Highway Barrier */}
      <mesh position={[5.5, 0.35, 0]}>
        <boxGeometry args={[0.3, 0.7, SEGMENT_LENGTH]} />
        <meshStandardMaterial color={isLight ? '#64748b' : '#111827'} metalness={0.4} />
      </mesh>
      {/* Right Glow Strip / Reflector */}
      <mesh position={[5.32, 0.45, 0]}>
        <boxGeometry args={[0.06, 0.1, SEGMENT_LENGTH]} />
        <meshBasicMaterial color={isLight ? '#f97316' : '#06b6d4'} />
      </mesh>

      {/* Overhead Highway Gantry Arch */}
      <group position={[0, 0, 0]}>
        <mesh position={[-5.6, 2.2, 0]}>
          <boxGeometry args={[0.35, 4.4, 0.35]} />
          <meshStandardMaterial color={isLight ? '#94a3b8' : '#0f172a'} />
        </mesh>
        <mesh position={[5.6, 2.2, 0]}>
          <boxGeometry args={[0.35, 4.4, 0.35]} />
          <meshStandardMaterial color={isLight ? '#94a3b8' : '#0f172a'} />
        </mesh>
        <mesh position={[0, 4.3, 0]}>
          <boxGeometry args={[11.55, 0.3, 0.35]} />
          <meshStandardMaterial color={isLight ? '#94a3b8' : '#0f172a'} />
        </mesh>
        {/* Overhead Sign or Neon Strip */}
        <mesh position={[0, 4.15, 0]}>
          <boxGeometry args={[10.2, 0.08, 0.08]} />
          <meshBasicMaterial color={isLight ? '#0284c7' : '#38bdf8'} />
        </mesh>
      </group>
    </group>
  );
};

export const Highway: React.FC = () => {
  return (
    <group>
      {Array.from({ length: NUM_SEGMENTS }).map((_, i) => (
        <RoadSegment key={i} initialZ={-i * SEGMENT_LENGTH + 25} />
      ))}
    </group>
  );
};
