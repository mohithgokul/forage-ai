import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function Dodec() {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    mesh.current.rotation.x += 0.004;
    mesh.current.rotation.y += 0.006;
  });
  return (
    <mesh ref={mesh}>
      <dodecahedronGeometry args={[1.4, 0]} />
      <meshStandardMaterial color="#7C3AED" wireframe emissive="#A855F7" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function DashboardScene() {
  return (
    <div className="glass-card" style={{ width: 280, height: 280, padding: 0, overflow: "hidden" }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#A855F7" />
        <Dodec />
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.4} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
