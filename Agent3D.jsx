"use client";

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  MeshTransmissionMaterial, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  Float, 
  Sparkles
} from '@react-three/drei';

// --- Detect low-end devices ---
function useIsLowEnd() {
  const [isLowEnd, setIsLowEnd] = useState(false);
  useEffect(() => {
    // Check for mobile/tablet or low GPU hints
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent);
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
    const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    setIsLowEnd(isMobile || lowMemory || (lowCores && !navigator.gpu));
  }, []);
  return isLowEnd;
}

// --- IDLE: Subtle ambient sphere ---
function IdleScene({ simplified }) {
  const ref = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.x = t * 0.06;
      ref.current.rotation.y = t * 0.04;
    }
  });
  return (
    <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.3}>
      <mesh ref={ref} scale={1}>
        <sphereGeometry args={[1, simplified ? 32 : 64, simplified ? 32 : 64]} />
        {simplified ? (
          <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
        ) : (
          <MeshDistortMaterial color="#1a1a1a" envMapIntensity={0.3} clearcoat={1} clearcoatRoughness={0.4} metalness={0.4} roughness={0.6} distort={0.15} speed={1} />
        )}
      </mesh>
      <Sparkles count={simplified ? 6 : 12} scale={3} size={1.5} speed={0.2} opacity={0.2} color="#555" />
    </Float>
  );
}

// --- AGENT 1: Scout (small liquid drop) ---
function ScoutScene({ simplified }) {
  const ref = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ref.current) { ref.current.rotation.x = t * 0.2; ref.current.rotation.y = t * 0.3; }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} scale={1}>
        <sphereGeometry args={[1, simplified ? 32 : 64, simplified ? 32 : 64]} />
        {simplified ? (
          <meshStandardMaterial color="#d4914a" metalness={0.8} roughness={0.1} />
        ) : (
          <MeshDistortMaterial color="#d4914a" envMapIntensity={1.5} clearcoat={1} clearcoatRoughness={0} metalness={0.8} roughness={0.1} distort={0.35} speed={2.5} />
        )}
      </mesh>
      <Sparkles count={simplified ? 8 : 20} scale={3} size={2} speed={0.3} opacity={0.35} color="#d4914a" />
    </Float>
  );
}

// --- AGENT 2: Validation (torus knot) ---
function ValidationScene({ simplified }) {
  const ref = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ref.current) { ref.current.rotation.x = t * 0.35; ref.current.rotation.y = t * 0.15; }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.6}>
      <mesh ref={ref} scale={0.7}>
        <torusKnotGeometry args={[1, 0.35, simplified ? 64 : 128, simplified ? 32 : 64]} />
        {simplified ? (
          <meshStandardMaterial color="#2c4c3b" metalness={0.5} roughness={0.2} transparent opacity={0.8} />
        ) : (
          <MeshTransmissionMaterial transmission={1} roughness={0.1} thickness={1.5} ior={1.5} chromaticAberration={0.05} color="#2c4c3b" />
        )}
      </mesh>
    </Float>
  );
}

// --- AGENT 3: Script (wobble planes) ---
function ScriptScene({ simplified }) {
  const ref = useRef();
  useFrame((s) => { if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.25; });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={ref} scale={0.9}>
        <mesh rotation={[Math.PI / 5, Math.PI / 5, 0]}>
          <boxGeometry args={[1.8, 1.8, 0.12]} />
          {simplified ? (
            <meshStandardMaterial color="#fff" metalness={0.1} roughness={0.2} transparent opacity={0.85} />
          ) : (
            <MeshWobbleMaterial factor={0.35} speed={1.8} color="#fff" metalness={0.1} roughness={0.2} transparent opacity={0.85} />
          )}
        </mesh>
        <mesh position={[0.1, 0.1, 0.35]} rotation={[Math.PI / 5, Math.PI / 5, 0]}>
          <boxGeometry args={[1.3, 1.3, 0.06]} />
          {simplified ? (
            <meshStandardMaterial color="#d4914a" metalness={0.3} roughness={0.2} transparent opacity={0.8} />
          ) : (
            <MeshTransmissionMaterial transmission={0.9} thickness={0.4} roughness={0.1} color="#d4914a" />
          )}
        </mesh>
      </group>
      <Sparkles count={simplified ? 6 : 15} scale={3} size={1.5} color="#fff" />
    </Float>
  );
}

// --- AGENT 4: Hooks (orbiting orbs) ---
function HookScene({ simplified }) {
  const ref = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.z = t * 0.35;
      ref.current.children.forEach((c, i) => {
        if (i > 0) { c.position.x = Math.sin(t * 1.5 + i * 2.1) * 1.6; c.position.y = Math.cos(t * 1.5 + i * 2.1) * 1.6; }
      });
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.4}>
      <group ref={ref} scale={0.8}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1.2} />
          <pointLight color="#fff" intensity={1} distance={4} />
        </mesh>
        {[1, 2, 3].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.35, 32, 32]} />
            {simplified ? (
              <meshStandardMaterial color="#d4914a" metalness={0.5} roughness={0.1} transparent opacity={0.8} />
            ) : (
              <MeshTransmissionMaterial transmission={1} roughness={0} thickness={1.5} color="#d4914a" ior={1.2} />
            )}
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// --- AGENT 5: Production (monolith + ring) ---
function ProductionScene({ simplified }) {
  const ringRef = useRef();
  const boxRef = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ringRef.current) { ringRef.current.rotation.x = t * 0.7; ringRef.current.rotation.y = t * 0.9; }
    if (boxRef.current) { boxRef.current.position.y = Math.sin(t * 1.2) * 0.1; }
  });
  return (
    <group scale={0.8}>
      <mesh ref={boxRef}>
        <boxGeometry args={[0.9, 2, 0.3]} />
        <meshStandardMaterial color="#111" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.4, 0.015, 16, 100]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={2.5} />
      </mesh>
      <Sparkles count={simplified ? 15 : 40} scale={3.5} size={1} speed={0.15} color="#ff3333" />
    </group>
  );
}

const SCENES = { 1: ScoutScene, 2: ValidationScene, 3: ScriptScene, 4: HookScene, 5: ProductionScene };

export default function Agent3DScene({ agentId }) {
  const isLowEnd = useIsLowEnd();
  const Scene = agentId ? SCENES[agentId] : null;
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 40 }}
      style={{ width: '100%', height: '100%' }}
      dpr={isLowEnd ? 1 : undefined}
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={0.3} />
      <spotLight position={[8, 8, 8]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-8, -8, -8]} intensity={0.2} />
      {Scene ? <Scene simplified={isLowEnd} /> : <IdleScene simplified={isLowEnd} />}
      <Environment preset="city" />
    </Canvas>
  );
}
