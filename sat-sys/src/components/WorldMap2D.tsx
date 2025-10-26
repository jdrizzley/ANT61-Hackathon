import React, { useState, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Line,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { Satellite } from '../types/Satellite';

// World map data URL
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const INITIAL_ZOOM = 1;
const INITIAL_MAP_POSITION: [number, number] = [0, 20];

interface WorldMap2DProps {
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

const WorldMap2D: React.FC<WorldMap2DProps> = ({
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
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [position, setPosition] = useState<[number, number]>(INITIAL_MAP_POSITION);
  const [hoveredSatellite, setHoveredSatellite] = useState<string | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState<{ x: number, y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Convert satellite position to lat/lon coordinates
  const getSatelliteCoordinates = (satellite: Satellite): [number, number] => {
    if (satellite.currentPosition) {
      // Convert ECI coordinates to lat/lon (simplified)
      const x = satellite.currentPosition.x;
      const y = satellite.currentPosition.y;
      const z = satellite.currentPosition.z;
      
      const lat = Math.asin(z / Math.sqrt(x*x + y*y + z*z)) * 180 / Math.PI;
      const lon = Math.atan2(y, x) * 180 / Math.PI;
      
      return [lon, lat];
    }
    
    // Fallback: generate coordinates based on orbital parameters
    const angle = Date.now() * 0.0001;
    const lat = Math.sin(angle) * satellite.inclination;
    const lon = (angle * 180 / Math.PI) % 360;
    
    return [lon, lat];
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 10));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.5));
  const handleMapReset = () => {
    setZoom(INITIAL_ZOOM);
    setPosition(INITIAL_MAP_POSITION);
  };
  const handleMoveEnd = (pos: { coordinates: [number, number], zoom: number }) => {
    setPosition(pos.coordinates);
    setZoom(pos.zoom);
  };

  const handleMarkerClick = (satelliteId: string, event: React.MouseEvent) => {
    onSatelliteSelect?.(satelliteId);
  };

  const handleSatelliteHover = (satelliteId: string | null, event?: React.MouseEvent) => {
    setHoveredSatellite(satelliteId);
    if (satelliteId && event && mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setTooltipCoords({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    } else {
      setTooltipCoords(null);
    }
  };

  const getSatelliteColor = (satellite: Satellite): string => {
    switch (satellite.status) {
      case 'danger': return '#ff4444';
      case 'warning': return '#ffaa00';
      case 'safe': return '#44ff44';
      default: return '#61dafb';
    }
  };

  const getSatelliteSize = (satellite: Satellite): number => {
    switch (satellite.status) {
      case 'danger': return 8;
      case 'warning': return 6;
      case 'safe': return 5;
      default: return 4;
    }
  };

  return (
    <div ref={mapContainerRef} className="world-map-container" style={{ 
      width: '100%', 
      maxWidth: '900px', 
      margin: '0 auto', 
      border: '1px solid #444', 
      background: '#2c2c2c', 
      borderRadius: '12px', 
      padding: '15px', 
      position: 'relative' 
    }}>
      {/* Map Controls */}
      <div 
        className="controls map-controls" 
        style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}
      >
        <button onClick={handleZoomIn} style={{ padding: '5px 10px', background: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Zoom In (+)
        </button>
        <button onClick={handleZoomOut} style={{ padding: '5px 10px', background: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Zoom Out (-)
        </button>
        <button onClick={handleMapReset} style={{ padding: '5px 10px', background: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reset View
        </button>
      </div>

      {/* Map */}
      <div className="map-wrapper" style={{ aspectRatio: '2 / 1', background: '#1a1a1c' }}>
        <ComposableMap
          projection="geoEquirectangular"
          projectionConfig={{ scale: 110 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={position} zoom={zoom} onMoveEnd={handleMoveEnd} style={{ cursor: 'grab' }}>
            <Graticule stroke="#484848" strokeWidth={0.3} />
            <Geographies geography={geoUrl}>
              {({ geographies }) => geographies.map(geo => (
                <Geography 
                  key={geo.rsmKey} 
                  geography={geo} 
                  fill="#403830" 
                  stroke="#5A4D40" 
                  style={{ 
                    default: { outline: 'none' }, 
                    hover: { outline: 'none' }, 
                    pressed: { outline: 'none' } 
                  }}
                />
              ))}
            </Geographies>

            {/* Satellite Trails */}
            {showSatelliteTrails && satellites.map((satellite) => {
              const coords = getSatelliteCoordinates(satellite);
              const color = getSatelliteColor(satellite);
              
              // Create a simple trail by adding some offset points
              const trailPoints: [number, number][] = [];
              for (let i = 0; i < 5; i++) {
                const offset = (i - 2) * 0.1;
                trailPoints.push([coords[0] + offset, coords[1] + offset]);
              }
              
              if (trailPoints.length >= 2) {
                return (
                  <Line 
                    key={`trail-${satellite.id}`} 
                    coordinates={trailPoints} 
                    stroke={color} 
                    strokeWidth={2} 
                    strokeOpacity={0.6} 
                  />
                );
              }
              return null;
            })}

            {/* Satellites */}
            {satellites.map((satellite) => {
              const coords = getSatelliteCoordinates(satellite);
              const color = getSatelliteColor(satellite);
              const size = getSatelliteSize(satellite);
              const isSelected = selectedSatelliteId === satellite.id;
              
              return (
                <Marker 
                  key={satellite.id} 
                  coordinates={coords}
                  onMouseEnter={(e) => handleSatelliteHover(satellite.id, e)}
                  onMouseLeave={() => handleSatelliteHover(null)}
                  onClick={(e) => handleMarkerClick(satellite.id, e)}
                >
                  {/* Outer glow ring */}
                  <circle 
                    r={size + 2} 
                    fill="none" 
                    stroke={color} 
                    strokeWidth={2}
                    opacity={0.6}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Main satellite marker */}
                  <circle 
                    r={isSelected ? size + 2 : size} 
                    fill={color} 
                    stroke={isSelected ? "#fff" : "#333"} 
                    strokeWidth={isSelected ? 3 : 1} 
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Inner highlight */}
                  <circle 
                    r={size * 0.4} 
                    fill="white" 
                    opacity={0.8}
                    style={{ cursor: 'pointer' }}
                  />
                  {showSatelliteLabels && (
                    <text 
                      textAnchor="middle" 
                      y={-12} 
                      style={{ 
                        fill: 'white', 
                        fontSize: '11px', 
                        pointerEvents: 'none',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {satellite.name}
                    </text>
                  )}
                </Marker>
              );
            })}

            {/* Connection Lines between Satellites */}
            {satellites.length > 1 && satellites.map((satellite, index) => {
              const coords = getSatelliteCoordinates(satellite);
              return satellites.slice(index + 1).map((otherSatellite) => {
                const otherCoords = getSatelliteCoordinates(otherSatellite);
                return (
                  <Line 
                    key={`connection-${satellite.id}-${otherSatellite.id}`}
                    coordinates={[coords, otherCoords]}
                    stroke="red"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                    strokeOpacity={0.6}
                  />
                );
              });
            })}

            {/* CME Events */}
            {showCMEEvents && cmeEvents.map((cme, index) => {
              const coords: [number, number] = [
                Math.random() * 360 - 180,
                Math.random() * 180 - 90
              ];
              
              return (
                <Marker key={`cme-${index}`} coordinates={coords}>
                  <circle r={3} fill="red" opacity={0.6} stroke="#fff" strokeWidth={0.5} />
                </Marker>
              );
            })}

            {/* Debris */}
            {showDebris && debrisData.map((debris, index) => {
              const coords: [number, number] = [
                Math.random() * 360 - 180,
                Math.random() * 180 - 90
              ];
              
              return (
                <Marker key={`debris-${index}`} coordinates={coords}>
                  <rect width={2} height={2} fill="orange" opacity={0.8} />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>
      
      {/* Tooltip */}
      {hoveredSatellite && tooltipCoords && (
        <div style={{
          position: 'absolute',
          left: `${tooltipCoords.x + 15}px`,
          top: `${tooltipCoords.y + 15}px`,
          background: 'rgba(40, 40, 40, 0.9)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '0.85em',
          pointerEvents: 'none',
          zIndex: 1000,
          border: '1px solid #555'
        }}>
          <div><strong>Satellite:</strong> {hoveredSatellite}</div>
          <div><strong>Status:</strong> {satellites.find(s => s.id === hoveredSatellite)?.status || 'unknown'}</div>
        </div>
      )}
    </div>
  );
};

export default WorldMap2D;
