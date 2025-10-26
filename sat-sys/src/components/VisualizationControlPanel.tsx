import React from 'react';

interface VisualizationControlPanelProps {
  showCMEEvents: boolean;
  showDebris: boolean;
  showSatelliteTrails: boolean;
  showSatelliteLabels: boolean;
  isAutoManeuverEnabled: boolean;
  onToggleCMEEvents: () => void;
  onToggleDebris: () => void;
  onToggleSatelliteTrails: () => void;
  onToggleSatelliteLabels: () => void;
  onToggleViewMode: () => void;
  onToggleAutoManeuver: () => void;
  viewMode: '2D' | '3D';
}

const VisualizationControlPanel: React.FC<VisualizationControlPanelProps> = ({
  showCMEEvents,
  showDebris,
  showSatelliteTrails,
  showSatelliteLabels,
  isAutoManeuverEnabled,
  onToggleCMEEvents,
  onToggleDebris,
  onToggleSatelliteTrails,
  onToggleSatelliteLabels,
  onToggleViewMode,
  onToggleAutoManeuver,
  viewMode
}) => {
  return (
    <div className="visualization-controls" style={{
      background: '#2c2c2c',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #444',
      marginBottom: '15px'
    }}>
      <h3 style={{ 
        color: '#ff4500', 
        margin: '0 0 15px 0', 
        fontSize: '1.1em',
        fontWeight: '500'
      }}>
        Visualization Controls
      </h3>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
        {/* View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onToggleViewMode}
            style={{
              padding: '8px 16px',
              background: viewMode === '3D' ? '#ff4500' : '#555',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9em',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease'
            }}
          >
            {viewMode === '2D' ? 'Switch to 3D' : 'Switch to 2D'}
          </button>
        </div>

        {/* Satellite Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="showSatelliteTrails"
            checked={showSatelliteTrails}
            onChange={onToggleSatelliteTrails}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="showSatelliteTrails" style={{ 
            color: '#e0e0e0', 
            fontSize: '0.9em', 
            cursor: 'pointer' 
          }}>
            Show Satellite Trails
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="showSatelliteLabels"
            checked={showSatelliteLabels}
            onChange={onToggleSatelliteLabels}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="showSatelliteLabels" style={{ 
            color: '#e0e0e0', 
            fontSize: '0.9em', 
            cursor: 'pointer' 
          }}>
            Show Satellite Labels
          </label>
        </div>

        {/* Space Weather Controls */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          paddingLeft: '15px',
          borderLeft: '1px solid #555'
        }}>
          <input
            type="checkbox"
            id="showCMEEvents"
            checked={showCMEEvents}
            onChange={onToggleCMEEvents}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="showCMEEvents" style={{ 
            color: '#e0e0e0', 
            fontSize: '0.9em', 
            cursor: 'pointer' 
          }}>
            Show CME Events
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="showDebris"
            checked={showDebris}
            onChange={onToggleDebris}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="showDebris" style={{ 
            color: '#e0e0e0', 
            fontSize: '0.9em', 
            cursor: 'pointer' 
          }}>
            Show Space Debris
          </label>
        </div>

        {/* Automatic Maneuver Control */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          paddingLeft: '15px',
          borderLeft: '1px solid #555'
        }}>
          <input
            type="checkbox"
            id="autoManeuver"
            checked={isAutoManeuverEnabled}
            onChange={onToggleAutoManeuver}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="autoManeuver" style={{ 
            color: '#e0e0e0', 
            fontSize: '0.9em', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            🤖 Auto-Evasion
          </label>
        </div>
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        background: '#1a1a1a', 
        borderRadius: '4px',
        fontSize: '0.8em',
        color: '#b0b0b0'
      }}>
        <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#e0e0e0' }}>Legend:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: '#44ff44', borderRadius: '50%' }}></div>
            <span>Safe Satellites</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: '#ffaa00', borderRadius: '50%' }}></div>
            <span>Warning Status</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: '#ff4444', borderRadius: '50%' }}></div>
            <span>Danger Status</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: 'red', borderRadius: '50%' }}></div>
            <span>CME Events</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', background: 'orange' }}></div>
            <span>Space Debris</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationControlPanel;
