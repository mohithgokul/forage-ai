import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function Helix() {
  const group = useRef<THREE.Group>(null!);
  useFrame(() => {
    group.current.rotation.z += 0.004;
  });

  const { curveA, curveB, beadsA, beadsB } = useMemo(() => {
    const ptsA: THREE.Vector3[] = [];
    const ptsB: THREE.Vector3[] = [];
    const beadsA: THREE.Vector3[] = [];
    const beadsB: THREE.Vector3[] = [];
    const len = 12;
    const turns = 4;
    const radius = 0.7;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const angle = t * Math.PI * 2 * turns;
      const z = (t - 0.5) * len;
      ptsA.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z));
      ptsB.push(
        new THREE.Vector3(
          Math.cos(angle + Math.PI) * radius,
          Math.sin(angle + Math.PI) * radius,
          z,
        ),
      );
    }
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      const angle = t * Math.PI * 2 * turns;
      const z = (t - 0.5) * len;
      beadsA.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z));
      beadsB.push(
        new THREE.Vector3(
          Math.cos(angle + Math.PI) * radius,
          Math.sin(angle + Math.PI) * radius,
          z,
        ),
      );
    }
    return {
      curveA: new THREE.CatmullRomCurve3(ptsA),
      curveB: new THREE.CatmullRomCurve3(ptsB),
      beadsA,
      beadsB,
    };
  }, []);

  return (
    <group ref={group} position={[1.5, 0, -3]}>
      <mesh>
        <tubeGeometry args={[curveA, 200, 0.06, 8, false]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={0.5}
          roughness={0.3}
        />
      </mesh>
      <mesh>
        <tubeGeometry args={[curveB, 200, 0.06, 8, false]} />
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#06B6D4"
          emissiveIntensity={0.5}
          roughness={0.3}
        />
      </mesh>
      {beadsA.map((p, i) => (
        <mesh key={`a${i}`} position={p}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {beadsB.map((p, i) => (
        <mesh key={`b${i}`} position={p}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Cluster() {
  const group = useRef<THREE.Group>(null!);
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current.position.x = 4.5 + Math.sin(t * 0.3) * 0.4;
    group.current.position.y = -2 + Math.cos(t * 0.25) * 0.3;
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.rotation.x += 0.005 + i * 0.001;
      m.rotation.y += 0.007 - i * 0.0005;
    });
  });
  const items = [
    {
      geo: <boxGeometry args={[0.4, 0.4, 0.4]} />,
      mat: <meshStandardMaterial color="#7C3AED" metalness={0.9} roughness={0.1} />,
      pos: [0.6, 0.3, 0],
    },
    {
      geo: <boxGeometry args={[0.4, 0.4, 0.4]} />,
      mat: <meshStandardMaterial color="#A855F7" metalness={0.9} roughness={0.1} />,
      pos: [-0.5, -0.4, 0.3],
    },
    {
      geo: <octahedronGeometry args={[0.35]} />,
      mat: <meshStandardMaterial color="#06B6D4" wireframe />,
      pos: [0.2, -0.6, -0.2],
    },
    {
      geo: <octahedronGeometry args={[0.35]} />,
      mat: <meshStandardMaterial color="#22D3EE" wireframe />,
      pos: [-0.6, 0.5, -0.3],
    },
    {
      geo: <tetrahedronGeometry args={[0.45]} />,
      mat: <meshStandardMaterial color="#F43F5E" roughness={0} metalness={0.8} />,
      pos: [0.7, -0.2, 0.5],
    },
    {
      geo: <tetrahedronGeometry args={[0.45]} />,
      mat: <meshStandardMaterial color="#FB7185" roughness={0} metalness={0.8} />,
      pos: [-0.3, 0.6, 0.4],
    },
  ];
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={it.pos as [number, number, number]}
        >
          {it.geo}
          {it.mat}
        </mesh>
      ))}
    </group>
  );
}

function Dome() {
  return (
    <mesh>
      <sphereGeometry args={[7, 32, 32]} />
      <meshStandardMaterial
        color="#05050F"
        side={THREE.BackSide}
        emissive="#0C0035"
        emissiveIntensity={1}
      />
    </mesh>
  );
}

function Grid() {
  return (
    <gridHelper
      args={[30, 30, "#ffffff", "#ffffff"]}
      position={[0, -4, 0]}
      material-opacity={0.06}
      material-transparent
    />
  );
}

function Drift() {
  const { camera } = useThree();
  useFrame((state) => {
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.8;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function LandingScene() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#A855F7" />
        <pointLight position={[-5, -3, 4]} intensity={1} color="#22D3EE" />
        <Dome />
        <Grid />
        <Helix />
        <Cluster />
        <Drift />
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.5} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
