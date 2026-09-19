import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { LaneIndex, LANE_POSITIONS, ObstacleType } from '../../types/game';

interface TrafficManagerProps {
  playerBoxRef: React.MutableRefObject<THREE.Box3>;
}

interface ObstacleData {
  id: number;
  type: ObstacleType;
  lane: LaneIndex;
  z: number;
  speedOffset: number; // Civilian car forward driving speed
  color: string;
  passed: boolean;
  box: THREE.Box3;
}

const VEHICLE_COLORS = ['#ec4899', '#eab308', '#8b5cf6', '#10b981', '#f97316'];

export const TrafficManager: React.FC<TrafficManagerProps> = ({ playerBoxRef }) => {
  const status = useGameStore((state) => state.status);
  const triggerCrash = useGameStore((state) => state.triggerCrash);
  const addScore = useGameStore((state) => state.addScore);
  const meshRefs = useRef<Map<number, THREE.Group>>(new Map());

  // Pool of obstacles
  const obstacles = useRef<ObstacleData[]>([]);

  // Initialize pool
  useEffect(() => {
    const lanes: LaneIndex[] = [-1, 0, 1];
    const initialPool: ObstacleData[] = [];

    for (let i = 0; i < 7; i++) {
      const lane = lanes[i % 3];
      const z = -40 - i * 26 - Math.random() * 10;
      const type: ObstacleType = i % 4 === 0 ? 'truck' : i % 4 === 3 ? 'barrier' : 'sedan';
      const color = VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)];

      initialPool.push({
        id: i,
        type,
        lane,
        z,
        speedOffset: type === 'barrier' ? 0 : type === 'truck' ? 10 : 18,
        color,
        passed: false,
        box: new THREE.Box3(),
      });
    }
    obstacles.current = initialPool;
  }, []);

  // Reset obstacles when game starts
  useEffect(() => {
    if (status === 'PLAYING') {
      const lanes: LaneIndex[] = [-1, 0, 1];
      obstacles.current.forEach((obs, i) => {
        obs.z = -45 - i * 28 - Math.random() * 8;
        obs.lane = lanes[(i + Math.floor(Math.random() * 2)) % 3];
        obs.passed = false;
      });
    }
  }, [status]);

  useFrame((_, delta) => {
    if (status !== 'PLAYING') return;

    const currentSpeed = useGameStore.getState().speed;
    const playerBox = playerBoxRef.current;

    // Track recently used lanes at spawn distances to avoid impossible walls
    let furthestZ = -50;
    obstacles.current.forEach((obs) => {
      if (obs.z < furthestZ) furthestZ = obs.z;
    });

    obstacles.current.forEach((obs) => {
      // Relative movement: moving backward toward player
      const relativeSpeed = Math.max(8, currentSpeed - obs.speedOffset);
      obs.z += relativeSpeed * delta;

      // Update mesh position
      const group = meshRefs.current.get(obs.id);
      if (group) {
        group.position.set(LANE_POSITIONS[obs.lane], 0.35, obs.z);

        // Update bounding box
        obs.box.setFromObject(group);
        // Apply forgiving padding
        obs.box.expandByScalar(-0.16);

        // Check AABB Collision with player
        if (playerBox.intersectsBox(obs.box)) {
          triggerCrash();
          return;
        }

        // Near-miss reward check
        if (!obs.passed && obs.z > 0 && obs.z < 3.0) {
          obs.passed = true;
          addScore(100);
        }
      }

      // Recycle obstacle when it passes behind the camera
      if (obs.z > 20) {
        const lanes: LaneIndex[] = [-1, 0, 1];
        // Ensure not blocking same lane/distance as other recently spawned obstacles
        obs.lane = lanes[Math.floor(Math.random() * lanes.length)];
        obs.z = Math.min(furthestZ - 26 - Math.random() * 14, -140);
        obs.passed = false;
        furthestZ = obs.z;

        // Randomize vehicle type and color
        const rand = Math.random();
        if (rand < 0.25) {
          obs.type = 'barrier';
          obs.speedOffset = 0;
          obs.color = '#ef4444';
        } else if (rand < 0.55) {
          obs.type = 'truck';
          obs.speedOffset = 10;
          obs.color = VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)];
        } else {
          obs.type = 'sedan';
          obs.speedOffset = 18 + Math.random() * 8;
          obs.color = VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)];
        }
      }
    });
  });

  return (
    <group>
      {obstacles.current.map((obs) => (
        <group
          key={obs.id}
          ref={(el) => {
            if (el) meshRefs.current.set(obs.id, el);
            else meshRefs.current.delete(obs.id);
          }}
          position={[LANE_POSITIONS[obs.lane], 0.35, obs.z]}
        >
          {obs.type === 'sedan' && (
            <group>
              {/* Civilian Sedan Body */}
              <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[1.4, 0.42, 2.9]} />
                <meshStandardMaterial color={obs.color} roughness={0.3} metalness={0.7} />
              </mesh>
              {/* Cabin */}
              <mesh position={[0, 0.5, -0.2]}>
                <boxGeometry args={[1.15, 0.34, 1.4]} />
                <meshStandardMaterial color="#0f172a" roughness={0.1} />
              </mesh>
              {/* Red Tail lights facing player */}
              <mesh position={[0, 0.25, 1.46]}>
                <boxGeometry args={[1.2, 0.1, 0.05]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
              </mesh>
              {/* Front headlights */}
              <mesh position={[0, 0.22, -1.46]}>
                <boxGeometry args={[1.1, 0.08, 0.05]} />
                <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
              </mesh>
              {/* Wheels */}
              {[-0.75, 0.75].map((x, xi) =>
                [-0.85, 0.85].map((z, zi) => (
                  <mesh key={`${xi}-${zi}`} position={[x, 0.08, z]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.26, 0.26, 0.2, 12]} />
                    <meshStandardMaterial color="#020617" />
                  </mesh>
                ))
              )}
            </group>
          )}

          {obs.type === 'truck' && (
            <group>
              {/* Truck Trailer */}
              <mesh position={[0, 0.9, 0.4]} castShadow>
                <boxGeometry args={[1.7, 1.45, 4.4]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </mesh>
              {/* Trailer Accent Line */}
              <mesh position={[0, 0.9, 0.4]}>
                <boxGeometry args={[1.72, 0.15, 4.42]} />
                <meshStandardMaterial color={obs.color} emissive={obs.color} emissiveIntensity={0.8} />
              </mesh>
              {/* Truck Cab */}
              <mesh position={[0, 0.6, -2.1]} castShadow>
                <boxGeometry args={[1.65, 1.0, 1.2]} />
                <meshStandardMaterial color={obs.color} roughness={0.3} metalness={0.6} />
              </mesh>
              {/* Cab Windshield */}
              <mesh position={[0, 0.78, -2.71]}>
                <boxGeometry args={[1.35, 0.4, 0.05]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Massive Rear Hazard Tail Lights facing player */}
              <mesh position={[-0.6, 0.35, 2.62]}>
                <boxGeometry args={[0.3, 0.2, 0.05]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
              </mesh>
              <mesh position={[0.6, 0.35, 2.62]}>
                <boxGeometry args={[0.3, 0.2, 0.05]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
              </mesh>
              {/* Amber clearance lights top rear */}
              <mesh position={[0, 1.6, 2.62]}>
                <boxGeometry args={[1.2, 0.08, 0.05]} />
                <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.5} />
              </mesh>
            </group>
          )}

          {obs.type === 'barrier' && (
            <group>
              {/* Cyber Roadblock Barrier Base */}
              <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[2.0, 0.65, 0.45]} />
                <meshStandardMaterial color="#dc2626" roughness={0.4} />
              </mesh>
              {/* Diagonal Warning Hazard Stripes */}
              <mesh position={[0, 0.35, 0.01]}>
                <boxGeometry args={[1.8, 0.4, 0.48]} />
                <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.2} />
              </mesh>
              {/* Pulsing Strobe Hazard Beacons */}
              <mesh position={[-0.75, 0.76, 0]}>
                <sphereGeometry args={[0.12, 10, 10]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.5} />
              </mesh>
              <mesh position={[0.75, 0.76, 0]}>
                <sphereGeometry args={[0.12, 10, 10]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.5} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
};
