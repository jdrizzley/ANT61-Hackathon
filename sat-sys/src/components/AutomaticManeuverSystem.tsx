import React, { useState, useEffect } from 'react';
import { Satellite, ConjunctionEvent } from '../types/Satellite';

interface AutomaticManeuverSystemProps {
  satellites: Satellite[];
  conjunctions: ConjunctionEvent[];
  onExecuteAction: (satelliteId: string, action: any) => boolean;
  isEnabled: boolean;
  onToggle: () => void;
}

const AutomaticManeuverSystem: React.FC<AutomaticManeuverSystemProps> = ({
  satellites,
  conjunctions,
  onExecuteAction,
  isEnabled,
  onToggle
}) => {
  const [lastManeuverTime, setLastManeuverTime] = useState<Date>(new Date());
  const [maneuverCount, setManeuverCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Automatic collision avoidance logic
  useEffect(() => {
    if (!isEnabled || conjunctions.length === 0) return;

    const processCollisions = async () => {
      setIsProcessing(true);
      
      // Sort conjunctions by risk level and time to closest approach
      const sortedConjunctions = conjunctions.sort((a, b) => {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        const riskDiff = riskOrder[b.risk] - riskOrder[a.risk];
        if (riskDiff !== 0) return riskDiff;
        
        // If same risk level, prioritize by time to closest approach
        const timeA = new Date(a.tca).getTime();
        const timeB = new Date(b.tca).getTime();
        return timeA - timeB;
      });

      for (const conjunction of sortedConjunctions) {
        // Only process high and medium risk conjunctions automatically
        if (conjunction.risk === 'low') continue;

        const satellite = satellites.find(s => s.id === conjunction.satelliteId);
        if (!satellite) continue;

        // Generate automatic maneuver based on conjunction data
        const maneuver = generateAutomaticManeuver(conjunction, satellite);
        
        if (maneuver) {
          console.log(`🤖 Auto-executing maneuver for ${satellite.name}:`, maneuver);
          
          const success = onExecuteAction(conjunction.satelliteId, maneuver);
          
          if (success) {
            setManeuverCount(prev => prev + 1);
            setLastManeuverTime(new Date());
            
            // Add a small delay between maneuvers to avoid conflicts
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      setIsProcessing(false);
    };

    // Process collisions every 5 seconds when enabled
    const interval = setInterval(processCollisions, 5000);
    
    // Also process immediately when enabled
    processCollisions();

    return () => clearInterval(interval);
  }, [isEnabled, conjunctions, satellites, onExecuteAction]);

  const generateAutomaticManeuver = (conjunction: ConjunctionEvent, satellite: Satellite) => {
    const timeToClosestApproach = new Date(conjunction.tca).getTime() - Date.now();
    const hoursToTCA = timeToClosestApproach / (1000 * 60 * 60);

    // Don't maneuver if too close to TCA (less than 1 hour)
    if (hoursToTCA < 1) return null;

    // Determine maneuver type based on risk level and time
    let maneuverType: string;
    let deltaV: number;
    let burnDuration: number;

    if (conjunction.risk === 'high') {
      maneuverType = 'evasive_maneuver';
      deltaV = 2.0; // m/s
      burnDuration = 60; // seconds
    } else if (conjunction.risk === 'medium') {
      maneuverType = 'orbit_adjustment';
      deltaV = 1.0; // m/s
      burnDuration = 30; // seconds
    } else {
      return null; // Don't auto-maneuver for low risk
    }

    // Calculate fuel cost (simplified)
    const fuelCost = deltaV * 0.1; // kg per m/s

    return {
      id: `auto-maneuver-${Date.now()}`,
      type: maneuverType,
      description: `Automatic ${maneuverType.replace('_', ' ')} to avoid collision with ${conjunction.objectName}`,
      priority: conjunction.risk === 'high' ? 'critical' : 'high',
      estimatedFuelCost: fuelCost,
      estimatedTimeToExecute: 5, // minutes
      successProbability: 0.9,
      parameters: {
        deltaV,
        burnDuration,
        reason: `Collision avoidance with ${conjunction.objectName}`,
        tca: conjunction.tca,
        missDistance: conjunction.missDistance
      }
    };
  };

  return (
    <div className="automatic-maneuver-system" style={{
      background: '#2c2c2c',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #444',
      marginBottom: '15px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ 
          color: '#ff4500', 
          margin: 0, 
          fontSize: '1.1em',
          fontWeight: '500'
        }}>
          🤖 Automatic Maneuver System
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '0.9em',
          color: '#e0e0e0'
        }}>
          <span style={{ 
            color: isEnabled ? '#44ff44' : '#ff4444',
            fontWeight: 'bold'
          }}>
            {isEnabled ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>

      {isEnabled && (
        <div style={{ fontSize: '0.85em', color: '#e0e0e0' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Status:</strong> 
            <span style={{ 
              color: isProcessing ? '#ffaa00' : '#44ff44',
              marginLeft: '5px'
            }}>
              {isProcessing ? 'Processing Collisions...' : 'Monitoring Active'}
            </span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Maneuvers Executed:</strong> {maneuverCount}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Last Maneuver:</strong> {lastManeuverTime.toLocaleTimeString()}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Active Conjunctions:</strong> {conjunctions.length}
          </div>
          <div style={{ 
            background: '#1a1a1a', 
            padding: '8px', 
            borderRadius: '4px',
            fontSize: '0.8em',
            color: '#b0b0b0'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Auto-Maneuver Rules:</div>
            <div>• High Risk: Evasive maneuver (2.0 m/s ΔV)</div>
            <div>• Medium Risk: Orbit adjustment (1.0 m/s ΔV)</div>
            <div>• Low Risk: No automatic action</div>
            <div>• Minimum 1 hour before TCA required</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomaticManeuverSystem;
