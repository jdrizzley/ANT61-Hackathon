import React, { useMemo, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Satellite } from '../types/Satellite';

const EARTH_RADIUS_KM_3D = 6.371;
const SATELLITE_VISUAL_SIZE = 0.05;
const LABEL_OFFSET_Y = 0.1;
const LABEL_FONT_SIZE = 0.14;

interface EarthVisualization3DProps {
  satellites: Satellite[];
  selectedSatelliteId?: string | null;
  onSatelliteSelect?: (id: string) => void;
  showSatelliteTrails?: boolean;
  showSatelliteLabels?: boolean;
  showCMEEvents?: boolean;
  showDebris?: boolean;
  cmeEvents?: any[];
  debrisData?: any[];
}

const EarthVisualization3D: React.FC<EarthVisualization3DProps> = ({
  satellites,
  selectedSatelliteId,
  onSatelliteSelect,
  showSatelliteTrails = true,
  showSatelliteLabels = true,
  showCMEEvents = false,
  showDebris = false,
  cmeEvents = [],
  debrisData = []
}) => {
  const earthTexture = useLoader(THREE.TextureLoader, '/textures/earth_texture.jpg');
  const earthGeometry = useMemo(() => new THREE.SphereGeometry(EARTH_RADIUS_KM_3D, 64, 64), []);
  const earthMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: earthTexture, roughness: 0.9, metalness: 0.1 }), [earthTexture]);

  const satelliteGeometry = useMemo(() => new THREE.SphereGeometry(SATELLITE_VISUAL_SIZE * 2, 16, 16), []);
  const baseMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#61dafb', emissive: '#61dafb', emissiveIntensity: 0.3 }), []);
  const highlightMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 'yellow', emissive: 'yellow', emissiveIntensity: 0.8 }), []);
  const dangerMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 'red', emissive: 'red', emissiveIntensity: 0.5 }), []);
  const warningMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 'orange', emissive: 'orange', emissiveIntensity: 0.4 }), []);
  const safeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 'green', emissive: 'green', emissiveIntensity: 0.3 }), []);
  const cmeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 'red', transparent: true, opacity: 0.3 }), []);
  const debrisMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 'orange', transparent: true, opacity: 0.5 }), []);
  const connectionLineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: 'red', linewidth: 2, dashSize: 0.1, gapSize: 0.05 }), []);

  // Convert satellite position to 3D coordinates
  const getSatellitePosition = (satellite: Satellite): THREE.Vector3 => {
    if (satellite.currentPosition) {
      // Scale down the position for visualization
      const scale = 0.001;
      return new THREE.Vector3(
        satellite.currentPosition.x * scale,
        satellite.currentPosition.z * scale,
        -satellite.currentPosition.y * scale
      );
    }
    
    // Fallback: calculate position from orbital parameters
    const altitude = satellite.altitude;
    const inclination = THREE.MathUtils.degToRad(satellite.inclination);
    const angle = Date.now() * 0.0001; // Simple rotation for demo
    
    const radius = (EARTH_RADIUS_KM_3D + altitude) * 0.001;
    return new THREE.Vector3(
      radius * Math.cos(angle) * Math.cos(inclination),
      radius * Math.sin(inclination),
      radius * Math.sin(angle) * Math.cos(inclination)
    );
  };

  return (
    <div style={{ height: 'calc(100vh - 250px)', minHeight: '500px', background: '#000005' }}>
      <Canvas camera={{ position: [0, 0, EARTH_RADIUS_KM_3D * 3.5], fov: 45, near: 0.1, far: EARTH_RADIUS_KM_3D * 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} castShadow />
        <Stars radius={200} depth={80} count={8000} factor={6} saturation={0} fade speed={0.3} />

        {/* Earth */}
        <mesh geometry={earthGeometry} material={earthMaterial} receiveShadow />

        {/* Satellites */}
        {satellites.map((satellite) => {
          const position = getSatellitePosition(satellite);
          const isSelected = selectedSatelliteId === satellite.id;
          
          // Choose material based on status
          let material = baseMaterial;
          if (isSelected) {
            material = highlightMaterial;
          } else {
            switch (satellite.status) {
              case 'danger':
                material = dangerMaterial;
                break;
              case 'warning':
                material = warningMaterial;
                break;
              case 'safe':
                material = safeMaterial;
                break;
              default:
                material = baseMaterial;
            }
          }
          
          return (
            <group key={satellite.id}>
              <mesh 
                position={position} 
                geometry={satelliteGeometry} 
                material={material}
                onClick={() => onSatelliteSelect?.(satellite.id)}
              />
              {/* Add a glowing ring around each satellite */}
              <mesh position={position}>
                <ringGeometry args={[SATELLITE_VISUAL_SIZE * 2.5, SATELLITE_VISUAL_SIZE * 3, 32]} />
                <meshBasicMaterial color="white" transparent opacity={0.3} side={THREE.DoubleSide} />
              </mesh>
              {showSatelliteLabels && (
                <Text 
                  position={[position.x, position.y + LABEL_OFFSET_Y * 2, position.z]} 
                  fontSize={LABEL_FONT_SIZE * 1.2} 
                  color="white" 
                  anchorX="center" 
                  anchorY="middle"
                  outlineWidth={0.02}
                  outlineColor="black"
                >
                  {satellite.name}
                </Text>
              )}
            </group>
          );
        })}

        {/* Connection Lines between Satellites */}
        {satellites.length > 1 && satellites.map((satellite, index) => {
          const position = getSatellitePosition(satellite);
          return satellites.slice(index + 1).map((otherSatellite) => {
            const otherPosition = getSatellitePosition(otherSatellite);
            const points = [position, otherPosition];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, connectionLineMaterial);
            return <primitive key={`connection-${satellite.id}-${otherSatellite.id}`} object={line} />;
          });
        })}

        {/* CME Events Visualization */}
        {showCMEEvents && cmeEvents.map((cme, index) => {
          // Create a visual representation of CME events
          const cmePosition = new THREE.Vector3(
            Math.random() * 20 - 10,
            Math.random() * 20 - 10,
            Math.random() * 20 - 10
          );
          
          return (
            <mesh key={`cme-${index}`} position={cmePosition}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="red" transparent opacity={0.6} />
            </mesh>
          );
        })}

        {/* Debris Visualization */}
        {showDebris && debrisData.map((debris, index) => {
          const debrisPosition = new THREE.Vector3(
            Math.random() * 15 - 7.5,
            Math.random() * 15 - 7.5,
            Math.random() * 15 - 7.5
          );
          
          return (
            <mesh key={`debris-${index}`} position={debrisPosition}>
              <boxGeometry args={[0.02, 0.02, 0.02]} />
              <meshStandardMaterial color="orange" transparent opacity={0.8} />
            </mesh>
          );
        })}

        <OrbitControls enableZoom={true} enablePan={true} minDistance={EARTH_RADIUS_KM_3D * 1.05} maxDistance={EARTH_RADIUS_KM_3D * 30} />
      </Canvas>
    </div>
  );
};

export default EarthVisualization3D;