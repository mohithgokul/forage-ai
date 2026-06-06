import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function useMouse() {
  const ref = useRef({ x: 0, y: 0 });
  useFrame(({ pointer }) => {
    ref.current.x = pointer.x;
    ref.current.y = pointer.y;
  });
  return ref;
}

function TorusKnot() {
  const mesh = useRef<THREE.Mesh>(null!);
  const mouse = useMouse();
  useFrame(() => {
    mesh.current.rotation.x += 0.003;
    mesh.current.rotation.y += 0.005;
    mesh.current.rotation.z += 0.002;
    const tx = mouse.current.x * 0.4;
    const ty = -mouse.current.y * 0.4;
    mesh.current.rotation.y += (tx - mesh.current.rotation.y * 0.02) * 0.01;
    mesh.current.rotation.x += (ty - mesh.current.rotation.x * 0.02) * 0.01;
  });
  return (
    <mesh ref={mesh} position={[-3.5, 0.5, -2]}>
      <torusKnotGeometry args={[2.2, 0.35, 200, 20]} />
      <meshStandardMaterial
        color="#7C3AED"
        metalness={0.9}
        roughness={0.1}
        emissive="#A855F7"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

function Ico() {
  const wire = useRef<THREE.Mesh>(null!);
  const solid = useRef<THREE.Mesh>(null!);
  const mouse = useMouse();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    wire.current.rotation.y += 0.008;
    solid.current.rotation.y = wire.current.rotation.y;
    const y = -0.3 + Math.sin(t * 0.8) * 0.3;
    wire.current.position.y = y;
    solid.current.position.y = y;
    const tx = mouse.current.x * 0.25;
    wire.current.rotation.x += (tx - wire.current.rotation.x) * 0.04;
    solid.current.rotation.x = wire.current.rotation.x;
  });
  return (
    <group>
      <mesh ref={wire} position={[3.8, -0.3, -1.5]}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#06B6D4" wireframe />
      </mesh>
      <mesh ref={solid} position={[3.8, -0.3, -1.5]} scale={0.96}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#06B6D4" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function Octa() {
  const mesh = useRef<THREE.Mesh>(null!);
  const mouse = useMouse();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y += 0.02;
    mesh.current.position.y = 2.8 + Math.sin(t * 1.2) * 0.4;
    const tx = mouse.current.x * 0.6;
    const ty = -mouse.current.y * 0.6;
    mesh.current.rotation.z += (tx - mesh.current.rotation.z) * 0.04;
    mesh.current.rotation.x += (ty - mesh.current.rotation.x) * 0.04;
  });
  return (
    <mesh ref={mesh} position={[2.2, 2.8, -3]}>
      <octahedronGeometry args={[0.9]} />
      <meshStandardMaterial color="#F43F5E" metalness={1} roughness={0} />
    </mesh>
  );
}

function Particles() {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 800;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => {
    const arr: { p: THREE.Vector3; v: THREE.Vector3; c: THREE.Color }[] = [];
    const colors = ["#7C3AED", "#06B6D4", "#F43F5E"];
    for (let i = 0; i < COUNT; i++) {
      const r = 8 * Math.cbrt(Math.random());
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      arr.push({
        p: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ),
        v: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003,
        ),
        c: new THREE.Color(colors[i % 3]),
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    for (let i = 0; i < COUNT; i++) {
      const d = data[i];
      d.p.add(d.v);
      if (d.p.length() > 9) d.v.multiplyScalar(-1);
      dummy.position.copy(d.p);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      mesh.current.setColorAt(i, d.c);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[0.025, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.6} />
    </instancedMesh>
  );
}

function Rings() {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    r1.current.rotation.z += 0.001;
    r2.current.rotation.z -= 0.0015;
  });
  return (
    <group position={[0, 0, -5]} rotation={[-0.3, 0, 0]}>
      <mesh ref={r1}>
        <torusGeometry args={[4.5, 0.02, 8, 120]} />
        <meshBasicMaterial color="#A855F7" />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[3.8, 0.015, 8, 120]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>
    </group>
  );
}

function Scene() {
  const { gl } = useThree();
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[4, 6, 4]} intensity={2} color="#A855F7" />
      <pointLight position={[-4, -4, 3]} intensity={1.5} color="#22D3EE" />
      <pointLight position={[0, 0, 6]} intensity={0.8} color="#ffffff" />
      <Rings />
      <TorusKnot />
      <Ico />
      <Octa />
      <Particles />
      <EffectComposer>
        <Bloom intensity={1.8} luminanceThreshold={0.6} luminanceSmoothing={0.9} />
      </EffectComposer>
    </>
  );
}

export default function AuthScene() {
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
        <Scene />
      </Canvas>
    </div>
  );
}
