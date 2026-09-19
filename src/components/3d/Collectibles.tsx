import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { LaneIndex, LANE_POSITIONS } from '../../types/game';

interface CollectiblesProps {
  playerBoxRef: React.MutableRefObject<THREE.Box3>;
}

interface ItemData {
  id: number;
  lane: LaneIndex;
  z: number;
  type: 'coin' | 'nitro';
  collected: boolean;
  box: THREE.Box3;
}

export const Collectibles: React.FC<CollectiblesProps> = ({ playerBoxRef }) => {
  const status = useGameStore((state) => state.status);
  const collectCoin = useGameStore((state) => state.collectCoin);
  const collectNitro = useGameStore((state) => state.collectNitro);
  const meshRefs = useRef<Map<number, THREE.Group>>(new Map());

  const items = useRef<ItemData[]>([]);

  useEffect(() => {
    const lanes: LaneIndex[] = [-1, 0, 1];
    const initialItems: ItemData[] = [];

    for (let i = 0; i < 6; i++) {
      initialItems.push({
        id: i,
        lane: lanes[i % 3],
        z: -25 - i * 32 - Math.random() * 8,
        type: i % 3 === 0 ? 'nitro' : 'coin',
        collected: false,
        box: new THREE.Box3(),
      });
    }
    items.current = initialItems;
  }, []);

  useEffect(() => {
    if (status === 'PLAYING') {
      const lanes: LaneIndex[] = [-1, 0, 1];
      items.current.forEach((item, i) => {
        item.z = -25 - i * 32 - Math.random() * 8;
        item.lane = lanes[(i + 1) % 3];
        item.collected = false;
      });
    }
  }, [status]);

  useFrame((state, delta) => {
    if (status !== 'PLAYING') return;

    const currentSpeed = useGameStore.getState().speed;
    const playerBox = playerBoxRef.current;
    const time = state.clock.getElapsedTime();

    items.current.forEach((item) => {
      item.z += currentSpeed * delta;

      const group = meshRefs.current.get(item.id);
      if (group) {
        // Bobbing & rotating
        const bob = Math.sin(time * 4 + item.id) * 0.15 + 0.8;
        group.position.set(LANE_POSITIONS[item.lane], bob, item.z);
        group.rotation.y += delta * 3.5;

        // Collision check
        if (!item.collected) {
          item.box.setFromCenterAndSize(
            group.position,
            new THREE.Vector3(1.2, 1.2, 1.2)
          );

          if (playerBox.intersectsBox(item.box)) {
            item.collected = true;
            if (item.type === 'coin') {
              collectCoin();
            } else {
              collectNitro();
            }
          }
        }
      }

      // Recycle item
      if (item.z > 15) {
        const lanes: LaneIndex[] = [-1, 0, 1];
        item.lane = lanes[Math.floor(Math.random() * lanes.length)];
        item.z = -130 - Math.random() * 40;
        item.type = Math.random() < 0.35 ? 'nitro' : 'coin';
        item.collected = false;
      }
    });
  });

  return (
    <group>
      {items.current.map((item) => (
        <group
          key={item.id}
          ref={(el) => {
            if (el) meshRefs.current.set(item.id, el);
            else meshRefs.current.delete(item.id);
          }}
          position={[LANE_POSITIONS[item.lane], 0.8, item.z]}
          visible={!item.collected}
        >
          {item.type === 'coin' ? (
            <group>
              {/* Golden Rotating Coin */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.38, 0.38, 0.12, 16]} />
                <meshStandardMaterial
                  color="#eab308"
                  emissive="#ca8a04"
                  emissiveIntensity={1.4}
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
              {/* Coin Inner Star/Emboss */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.22, 0.04, 8, 16]} />
                <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={2} />
              </mesh>
            </group>
          ) : (
            <group>
              {/* Cyan Nitro Canister */}
              <mesh>
                <cylinderGeometry args={[0.26, 0.26, 0.75, 12]} />
                <meshStandardMaterial
                  color="#06b6d4"
                  emissive="#0891b2"
                  emissiveIntensity={2}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              {/* Top and Bottom Caps */}
              <mesh position={[0, 0.4, 0]}>
                <sphereGeometry args={[0.26, 12, 8]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
              </mesh>
              <mesh position={[0, -0.4, 0]}>
                <sphereGeometry args={[0.26, 12, 8]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
};
