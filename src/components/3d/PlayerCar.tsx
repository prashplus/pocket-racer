import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { LANE_POSITIONS } from '../../types/game';

interface PlayerCarProps {
  playerBoxRef: React.MutableRefObject<THREE.Box3>;
}

export const PlayerCar: React.FC<PlayerCarProps> = ({ playerBoxRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyMeshRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<(THREE.Group | null)[]>([]);
  const flameLeftRef = useRef<THREE.Mesh>(null);
  const flameRightRef = useRef<THREE.Mesh>(null);

  // Read store values
  const lane = useGameStore((state) => state.lane);
  const speed = useGameStore((state) => state.speed);
  const isBoosting = useGameStore((state) => state.isBoosting);
  const status = useGameStore((state) => state.status);
  const theme = useGameStore((state) => state.theme);

  // Dynamic animation trackers
  const wheelRotation = useRef(0);
  const currentRoll = useRef(0);
  const currentSteerAngle = useRef(0);
  const currentPitch = useRef(0);

  // Materials & Colors based on theme/styling
  const paintColor = theme === 'light' ? '#e11d48' : '#06b6d4'; // Crimson Red in daylight, Cyber Cyan in night
  const paintSecondary = '#0f172a'; // Carbon fiber black
  const caliperColor = '#ef4444';

  useFrame((_, delta) => {
    if (!groupRef.current || !bodyMeshRef.current) return;

    const targetX = LANE_POSITIONS[lane];
    const prevX = groupRef.current.position.x;

    // Smooth horizontal position interpolation
    groupRef.current.position.x = THREE.MathUtils.lerp(prevX, targetX, delta * 12);

    // Calculate lateral velocity for banking & wheel steering
    const lateralVelocity = (groupRef.current.position.x - prevX) / Math.max(delta, 0.001);
    
    // Body roll into the turn
    const targetRoll = -lateralVelocity * 0.055;
    currentRoll.current = THREE.MathUtils.lerp(currentRoll.current, targetRoll, delta * 14);
    bodyMeshRef.current.rotation.z = currentRoll.current;

    // Body pitch (squat on boost, slight dive on brake)
    const targetPitch = isBoosting ? -0.04 : 0;
    currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, targetPitch, delta * 10);
    bodyMeshRef.current.rotation.x = currentPitch.current;

    // Front wheel steer angle
    const targetSteer = -lateralVelocity * 0.08;
    currentSteerAngle.current = THREE.MathUtils.lerp(currentSteerAngle.current, targetSteer, delta * 15);

    // Dynamic wheel spin and steering
    wheelRotation.current -= (speed * delta * 2.6);
    wheelsRef.current.forEach((wheelGroup, index) => {
      if (wheelGroup) {
        // Spin the wheel rim & tire
        const rimMesh = wheelGroup.children[0];
        if (rimMesh) {
          rimMesh.rotation.x = wheelRotation.current;
        }
        // Steer front wheels (indices 0 and 1)
        if (index === 0 || index === 1) {
          wheelGroup.rotation.y = currentSteerAngle.current;
        }
      }
    });

    // Nitro exhaust flame flicker
    if (flameLeftRef.current && flameRightRef.current) {
      if (isBoosting) {
        const flicker = 1.0 + Math.random() * 0.45;
        flameLeftRef.current.scale.set(1, 1, flicker * 2.6);
        flameRightRef.current.scale.set(1, 1, flicker * 2.6);
        flameLeftRef.current.visible = true;
        flameRightRef.current.visible = true;
      } else {
        flameLeftRef.current.visible = false;
        flameRightRef.current.visible = false;
      }
    }

    // Update player AABB bounding box for collision detection
    if (status === 'PLAYING') {
      playerBoxRef.current.setFromObject(groupRef.current);
      playerBoxRef.current.expandByScalar(-0.16); // 16% inner padding
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.22, 0]}>
      {/* Tiltable Car Body Group */}
      <group ref={bodyMeshRef}>
        {/* Lower Main Monocoque Chassis */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.68, 0.28, 3.6]} />
          <meshStandardMaterial
            color={paintColor}
            metalness={0.88}
            roughness={0.16}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Sculpted Hood / Front Frunk with aerodynamic rake */}
        <mesh position={[0, 0.32, -1.15]} rotation={[0.16, 0, 0]} castShadow>
          <boxGeometry args={[1.56, 0.22, 1.4]} />
          <meshStandardMaterial color={paintColor} metalness={0.88} roughness={0.16} />
        </mesh>

        {/* Front Aero Hood Vent Indent */}
        <mesh position={[0, 0.43, -1.1]}>
          <boxGeometry args={[0.7, 0.04, 0.6]} />
          <meshStandardMaterial color="#020617" roughness={0.6} />
        </mesh>

        {/* Front Bumper & Low Carbon Splitter */}
        <mesh position={[0, 0.11, -1.82]} castShadow>
          <boxGeometry args={[1.72, 0.08, 0.35]} />
          <meshStandardMaterial color={paintSecondary} roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Front Canards / Splitter Winglets */}
        <mesh position={[-0.88, 0.16, -1.75]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.04, 0.16, 0.25]} />
          <meshStandardMaterial color={paintSecondary} />
        </mesh>
        <mesh position={[0.88, 0.16, -1.75]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.04, 0.16, 0.25]} />
          <meshStandardMaterial color={paintSecondary} />
        </mesh>

        {/* Front Honeycomb Air Intakes */}
        <mesh position={[0, 0.2, -1.81]}>
          <boxGeometry args={[1.3, 0.14, 0.05]} />
          <meshBasicMaterial color="#020617" />
        </mesh>

        {/* Greenhouse Cabin / Cockpit Roof (Curved, Aerodynamic) */}
        <mesh position={[0, 0.54, -0.1]} castShadow>
          <boxGeometry args={[1.22, 0.38, 1.7]} />
          <meshStandardMaterial
            color="#090d16"
            roughness={0.05}
            metalness={0.95}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Raked Windshield Front Slope */}
        <mesh position={[0, 0.52, -0.92]} rotation={[0.54, 0, 0]}>
          <planeGeometry args={[1.18, 0.65]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Sloped Rear Engine Cover & Rear Glass */}
        <mesh position={[0, 0.5, 0.82]} rotation={[-0.42, 0, 0]}>
          <planeGeometry args={[1.18, 0.75]} />
          <meshStandardMaterial color="#0b1120" roughness={0.15} metalness={0.8} />
        </mesh>

        {/* Rear Engine Louver Vents */}
        {[-0.2, 0.1, 0.4].map((zOffset, i) => (
          <mesh key={`louver-${i}`} position={[0, 0.49, 0.55 + zOffset]}>
            <boxGeometry args={[0.85, 0.02, 0.08]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
        ))}

        {/* Side Air Scoop Intakes (Behind doors for engine cooling) */}
        <mesh position={[-0.86, 0.3, 0.35]} rotation={[0, -0.25, 0]}>
          <boxGeometry args={[0.12, 0.22, 0.7]} />
          <meshStandardMaterial color="#020617" roughness={0.5} />
        </mesh>
        <mesh position={[0.86, 0.3, 0.35]} rotation={[0, 0.25, 0]}>
          <boxGeometry args={[0.12, 0.22, 0.7]} />
          <meshStandardMaterial color="#020617" roughness={0.5} />
        </mesh>

        {/* Carbon Fiber Side Skirts */}
        <mesh position={[-0.86, 0.11, 0]}>
          <boxGeometry args={[0.08, 0.06, 2.8]} />
          <meshStandardMaterial color={paintSecondary} roughness={0.4} />
        </mesh>
        <mesh position={[0.86, 0.11, 0]}>
          <boxGeometry args={[0.08, 0.06, 2.8]} />
          <meshStandardMaterial color={paintSecondary} roughness={0.4} />
        </mesh>

        {/* Sleek Aerodynamic Wing Mirrors */}
        <group position={[-0.78, 0.54, -0.65]}>
          <mesh rotation={[0, -0.3, 0]}>
            <boxGeometry args={[0.22, 0.08, 0.12]} />
            <meshStandardMaterial color={paintColor} metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0.04, 0, 0.05]}>
            <planeGeometry args={[0.16, 0.06]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.99} roughness={0.05} />
          </mesh>
        </group>
        <group position={[0.78, 0.54, -0.65]}>
          <mesh rotation={[0, 0.3, 0]}>
            <boxGeometry args={[0.22, 0.08, 0.12]} />
            <meshStandardMaterial color={paintColor} metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[-0.04, 0, 0.05]}>
            <planeGeometry args={[0.16, 0.06]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.99} roughness={0.05} />
          </mesh>
        </group>

        {/* GT Racing Rear Wing on Carbon Struts */}
        <group position={[0, 0.62, 1.62]}>
          {/* Main Airfoil Wing with Downforce Endplates */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[1.82, 0.04, 0.38]} />
            <meshStandardMaterial color={paintSecondary} metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Left Wing Endplate */}
          <mesh position={[-0.91, 0.24, 0]}>
            <boxGeometry args={[0.03, 0.16, 0.42]} />
            <meshStandardMaterial color={paintColor} metalness={0.8} />
          </mesh>
          {/* Right Wing Endplate */}
          <mesh position={[0.91, 0.24, 0]}>
            <boxGeometry args={[0.03, 0.16, 0.42]} />
            <meshStandardMaterial color={paintColor} metalness={0.8} />
          </mesh>
          {/* Swan-Neck Carbon Uprights */}
          <mesh position={[-0.45, 0.08, -0.05]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.05, 0.3, 0.08]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0.45, 0.08, -0.05]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.05, 0.3, 0.08]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
        </group>

        {/* Quad Projector LED Headlights */}
        {[-0.62, -0.42, 0.42, 0.62].map((xPos, idx) => (
          <group key={`headlight-${idx}`} position={[xPos, 0.32, -1.82]}>
            <mesh>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#67e8f9"
                emissiveIntensity={theme === 'light' ? 1.5 : 4.0}
              />
            </mesh>
          </group>
        ))}

        {/* Forward Headlight Beam Spotlights */}
        <spotLight
          position={[0, 0.4, -1.5]}
          target-position={[0, 0, -28]}
          angle={0.48}
          penumbra={0.7}
          intensity={theme === 'light' ? 3 : 10}
          color="#a5f3fc"
          distance={40}
        />

        {/* Full-Width Rear LED Cyber Lightbar (Curved edges) */}
        <mesh position={[0, 0.34, 1.81]}>
          <boxGeometry args={[1.56, 0.08, 0.04]} />
          <meshStandardMaterial
            color="#ff0055"
            emissive="#ff0055"
            emissiveIntensity={isBoosting ? 5.0 : 3.5}
          />
        </mesh>

        {/* Rear Aggressive Aerodynamic Diffuser */}
        <group position={[0, 0.12, 1.76]}>
          <mesh>
            <boxGeometry args={[1.65, 0.1, 0.28]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          {/* Vertical Diffuser Strakes / Fins */}
          {[-0.55, -0.2, 0.2, 0.55].map((xStrafe, idx) => (
            <mesh key={`strafe-${idx}`} position={[xStrafe, -0.02, 0]}>
              <boxGeometry args={[0.03, 0.12, 0.32]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          ))}
        </group>

        {/* Quad Titanium Exhaust Tips (Center-Exit Supercar Style) */}
        {[-0.22, -0.07, 0.07, 0.22].map((xPipe, idx) => (
          <group key={`exhaust-${idx}`} position={[xPipe, 0.24, 1.84]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 0.08, 12]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <ringGeometry args={[0.035, 0.055, 12]} />
              <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1} />
            </mesh>
          </group>
        ))}

        {/* Dual Nitro Exhaust Flames */}
        <mesh ref={flameLeftRef} position={[-0.15, 0.24, 2.1]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <coneGeometry args={[0.13, 0.85, 10]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
        <mesh ref={flameRightRef} position={[0.15, 0.24, 2.1]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <coneGeometry args={[0.13, 0.85, 10]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>

        {/* Underglow Neon (active at night / dark mode) */}
        {theme === 'dark' && (
          <pointLight position={[0, 0.05, 0]} color="#06b6d4" intensity={2.5} distance={4} />
        )}
      </group>

      {/* Realistic 4-Wheel Assembly with Tires, Rims, Rotors, and Calipers */}
      {[
        [-0.88, 0.14, -1.15, 0, 0.32, 0.24], // Front Left
        [0.88, 0.14, -1.15, 1, 0.32, 0.24],  // Front Right
        [-0.91, 0.15, 1.15, 2, 0.34, 0.28],  // Rear Left (Wider rear tires)
        [0.91, 0.15, 1.15, 3, 0.34, 0.28],   // Rear Right
      ].map(([x, y, z, index, radius, width]) => {
        const isRightSide = x > 0;
        return (
          <group
            key={index}
            ref={(el) => {
              wheelsRef.current[index] = el;
            }}
            position={[x, y, z]}
          >
            {/* Rotating Wheel Mesh Group (Tire + Rim) */}
            <group rotation={[0, 0, Math.PI / 2]}>
              {/* Rubber Performance Tire with Rounded Shoulder */}
              <mesh castShadow>
                <cylinderGeometry args={[radius, radius, width, 24]} />
                <meshStandardMaterial color="#171717" roughness={0.8} />
              </mesh>

              {/* Alloy Rim Wheel Face */}
              <mesh position={[0, isRightSide ? width / 2 + 0.005 : -width / 2 - 0.005, 0]}>
                <cylinderGeometry args={[radius * 0.72, radius * 0.72, 0.02, 18]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
              </mesh>

              {/* Multi-Spoke Star Design */}
              {Array.from({ length: 5 }).map((_, spokeIdx) => (
                <mesh
                  key={spokeIdx}
                  position={[0, isRightSide ? width / 2 + 0.01 : -width / 2 - 0.01, 0]}
                  rotation={[0, (spokeIdx * Math.PI) / 2.5, 0]}
                >
                  <boxGeometry args={[radius * 1.3, 0.01, 0.045]} />
                  <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
                </mesh>
              ))}

              {/* Center Wheel Hub / Lug Nut Cap */}
              <mesh position={[0, isRightSide ? width / 2 + 0.015 : -width / 2 - 0.015, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
                <meshStandardMaterial color={paintColor} metalness={0.9} />
              </mesh>
            </group>

            {/* Non-Rotating Brake Rotor (Drilled Steel Disc) */}
            <mesh position={[isRightSide ? -0.04 : 0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.65, radius * 0.65, 0.02, 18]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.25} />
            </mesh>

            {/* Red Brembo Performance Brake Caliper */}
            <mesh position={[isRightSide ? -0.04 : 0.04, radius * 0.35, 0]}>
              <boxGeometry args={[0.06, 0.14, 0.18]} />
              <meshStandardMaterial color={caliperColor} metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
