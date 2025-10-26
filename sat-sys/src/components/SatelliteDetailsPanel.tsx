import React, { useState, useRef, useEffect } from 'react';
import { Satellite } from '../types/Satellite';

interface SatelliteDetailsPanelProps {
  selectedSatellite: Satellite | null;
  onClose: () => void;
  isOpen: boolean;
}

const SatelliteDetailsPanel: React.FC<SatelliteDetailsPanelProps> = ({
  selectedSatellite,
  onClose,
  isOpen
}) => {
  const [panelPosition, setPanelPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDownOnHeader = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!panelRef.current) return;
    
    setIsDragging(true);
    const panelRect = panelRef.current.getBoundingClientRect();
    setDragStartOffset({
      x: e.clientX - panelRect.left,
      y: e.clientY - panelRect.top,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !panelRef.current) return;
    let newX = e.clientX - dragStartOffset.x;
    let newY = e.clientY - dragStartOffset.y;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const panelCurrent = panelRef.current;
    const panelRect = panelCurrent.getBoundingClientRect();
    
    const headerHeight = 50;
    newX = Math.max(0, Math.min(newX, vw - panelRect.width));
    newY = Math.max(0, Math.min(newY, vh - headerHeight));

    setPanelPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartOffset]);

  const toggleMinimize = () => setIsMinimized(!isMinimized);

  if (!isOpen || !selectedSatellite) return null;

  const panelClasses = `satellite-details-panel ${isMinimized ? 'minimized' : ''}`;

  return (
    <div 
      ref={panelRef} 
      className={panelClasses}
      style={{
        left: `${panelPosition.x}px`, 
        top: `${panelPosition.y}px`,
        position: 'fixed',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 1050,
        userSelect: 'none',
        background: '#2c2c2c',
        border: '1px solid #444',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        minWidth: '300px',
        maxWidth: '400px'
      }}
    >
      <div 
        style={{
          background: '#ff4500',
          color: '#1a1a1a',
          padding: '10px 15px',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'grab'
        }}
        onMouseDown={handleMouseDownOnHeader}
      >
        <h4 style={{ margin: 0, fontSize: '1.1em', fontWeight: 'bold' }}>
          {selectedSatellite.name}
        </h4>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={toggleMinimize}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1a1a1a',
              cursor: 'pointer',
              fontSize: '1.2em',
              padding: '2px 6px',
              borderRadius: '3px'
            }}
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1a1a1a',
              cursor: 'pointer',
              fontSize: '1.2em',
              padding: '2px 6px',
              borderRadius: '3px'
            }}
            title="Close Panel"
          >
            ×
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div style={{ padding: '15px' }}>
          {/* Basic Information */}
          <div style={{ marginBottom: '15px' }}>
            <h5 style={{ 
              color: '#ff4500', 
              margin: '0 0 8px 0', 
              fontSize: '0.9em',
              fontWeight: 'bold'
            }}>
              Basic Information
            </h5>
            <div style={{ fontSize: '0.85em', color: '#e0e0e0', lineHeight: '1.4' }}>
              <div><strong>ID:</strong> {selectedSatellite.id}</div>
              <div><strong>Orbit Type:</strong> {selectedSatellite.orbitType}</div>
              <div><strong>Status:</strong> 
                <span style={{ 
                  color: selectedSatellite.status === 'danger' ? '#ff4444' : 
                         selectedSatellite.status === 'warning' ? '#ffaa00' : '#44ff44',
                  marginLeft: '5px'
                }}>
                  {selectedSatellite.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>

          {/* Orbital Parameters */}
          <div style={{ marginBottom: '15px' }}>
            <h5 style={{ 
              color: '#ff4500', 
              margin: '0 0 8px 0', 
              fontSize: '0.9em',
              fontWeight: 'bold'
            }}>
              Orbital Parameters
            </h5>
            <div style={{ fontSize: '0.85em', color: '#e0e0e0', lineHeight: '1.4' }}>
              <div><strong>Altitude:</strong> {selectedSatellite.altitude.toFixed(2)} km</div>
              <div><strong>Inclination:</strong> {selectedSatellite.inclination.toFixed(2)}°</div>
              <div><strong>Velocity:</strong> {selectedSatellite.velocity.toFixed(2)} km/s</div>
              {selectedSatellite.eccentricity && (
                <div><strong>Eccentricity:</strong> {selectedSatellite.eccentricity.toFixed(4)}</div>
              )}
              {selectedSatellite.argumentOfPeriapsis && (
                <div><strong>Argument of Periapsis:</strong> {selectedSatellite.argumentOfPeriapsis.toFixed(2)}°</div>
              )}
              {selectedSatellite.rightAscensionOfAscendingNode && (
                <div><strong>RAAN:</strong> {selectedSatellite.rightAscensionOfAscendingNode.toFixed(2)}°</div>
              )}
            </div>
          </div>

          {/* Current Position */}
          {selectedSatellite.currentPosition && (
            <div style={{ marginBottom: '15px' }}>
              <h5 style={{ 
                color: '#ff4500', 
                margin: '0 0 8px 0', 
                fontSize: '0.9em',
                fontWeight: 'bold'
              }}>
                Current Position (ECI)
              </h5>
              <div style={{ fontSize: '0.85em', color: '#e0e0e0', lineHeight: '1.4' }}>
                <div><strong>X:</strong> {selectedSatellite.currentPosition.x.toFixed(2)} km</div>
                <div><strong>Y:</strong> {selectedSatellite.currentPosition.y.toFixed(2)} km</div>
                <div><strong>Z:</strong> {selectedSatellite.currentPosition.z.toFixed(2)} km</div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div>
            <h5 style={{ 
              color: '#ff4500', 
              margin: '0 0 8px 0', 
              fontSize: '0.9em',
              fontWeight: 'bold'
            }}>
              Additional Information
            </h5>
            <div style={{ fontSize: '0.85em', color: '#e0e0e0', lineHeight: '1.4' }}>
              {selectedSatellite.noradId && (
                <div><strong>NORAD ID:</strong> {selectedSatellite.noradId}</div>
              )}
              {selectedSatellite.lastUpdated && (
                <div><strong>Last Updated:</strong> {new Date(selectedSatellite.lastUpdated).toLocaleString()}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatelliteDetailsPanel;
