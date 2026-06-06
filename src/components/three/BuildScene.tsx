import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const STEP_COLORS = ["#7C3AED", "#06B6D4", "#F43F5E", "#F59E0B", "#A855F7", "#22D3EE"];

function CoreSphere({ progress, done }: { progress: number; done: boolean }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y += 0.005;
    inner.current.rotation.y -= 0.008;
    const burst = done ? 1 + Math.sin(t * 4) * 0.08 : 1;
    mesh.current.scale.setScalar(burst);
  });
  const color = done ? "#F59E0B" : progress > 0.5 ? "#7C3AED" : "#06B6D4";
  return (
    <group>
      <mesh ref={mesh}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={inner} scale={0.85}>
        <sphereGeometry args={[2, 24, 24]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15 + progress * 0.35}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function Satellites({ completed }: { completed: number }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const phase = (i / 6) * Math.PI * 2;
      const r = 3.5;
      child.position.x = Math.cos(t * 0.4 + phase) * r;
      child.position.z = Math.sin(t * 0.4 + phase) * r;
      child.position.y = Math.sin(t * 0.6 + phase) * 0.5;
      child.rotation.x += 0.02;
      child.rotation.y += 0.02;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 6 }).map((_, i) => {
        const isDone = i < completed;
        const color = STEP_COLORS[i];
        return (
          <mesh key={i}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial
              color={isDone ? color : "#3D3D5C"}
              wireframe={!isDone}
              emissive={isDone ? color : "#000"}
              emissiveIntensity={isDone ? 0.8 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function BuildScene({
  totalSteps,
  completed,
}: {
  totalSteps: number;
  completed: number;
}) {
  const progress = completed / totalSteps;
  const done = completed >= totalSteps;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.3} />
        <pointLight position={[4, 4, 4]} intensity={2} color="#A855F7" />
        <pointLight position={[-4, -4, 4]} intensity={1.5} color="#22D3EE" />
        <CoreSphere progress={progress} done={done} />
        <Satellites completed={completed} />
        <EffectComposer>
          <Bloom intensity={2.5} luminanceThreshold={0.5} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
