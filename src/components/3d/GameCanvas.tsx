import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { CameraRig } from './CameraRig';
import { Highway } from './Highway';
import { PlayerCar } from './PlayerCar';
import { TrafficManager } from './TrafficManager';
import { Collectibles } from './Collectibles';
import { ParticleSystem } from './ParticleSystem';
import { SynthwaveBackdrop } from './SynthwaveBackdrop';

export const GameCanvas: React.FC = () => {
  const theme = useGameStore((state) => state.theme);
  const playerBoxRef = useRef<THREE.Box3>(new THREE.Box3());

  const isLight = theme === 'light';

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3.5, 6.4], fov: 62 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Dynamic Fog for Day / Night */}
        <fog
          attach="fog"
          args={[isLight ? '#93c5fd' : '#040714', isLight ? 35 : 25, isLight ? 130 : 95]}
        />

        {/* Dynamic Sky Ambient & Directional Sun */}
        <ambientLight intensity={isLight ? 1.3 : 0.8} color={isLight ? '#ffffff' : '#1e1b4b'} />
        <directionalLight
          position={isLight ? [15, 30, 10] : [10, 20, 10]}
          intensity={isLight ? 2.6 : 1.5}
          color={isLight ? '#fffbeb' : '#e0e7ff'}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={70}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />

        {/* Follow Camera Key Light (Illuminates player car's rear, spoiler, and rims) */}
        <directionalLight
          position={[2, 10, 12]}
          intensity={isLight ? 1.8 : 1.4}
          color={isLight ? '#ffffff' : '#c7d2fe'}
        />
        <pointLight
          position={[0, 3.5, 6]}
          intensity={isLight ? 1.0 : 2.2}
          color={isLight ? '#ffffff' : '#38bdf8'}
          distance={16}
        />

        {/* Scene Accent Lighting */}
        {isLight ? (
          <hemisphereLight args={['#bae6fd', '#334155', 0.8]} />
        ) : (
          <>
            <pointLight position={[-4, 3, -10]} color="#ec4899" intensity={2.0} distance={25} />
            <pointLight position={[4, 3, -10]} color="#06b6d4" intensity={2.0} distance={25} />
          </>
        )}

        {/* 3D Scene Elements */}
        <CameraRig />
        <SynthwaveBackdrop />
        <Highway />
        <TrafficManager playerBoxRef={playerBoxRef} />
        <Collectibles playerBoxRef={playerBoxRef} />
        <PlayerCar playerBoxRef={playerBoxRef} />
        <ParticleSystem />
      </Canvas>
    </div>
  );
};
