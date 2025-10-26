/**
 * Enhanced Satellite Orbit Simulation Library
 * Combines custom orbital mechanics with satellite.js for TLE-based calculations
 */

import * as satellite from 'satellite.js';
import { Satellite, SuggestedAction } from '../types/Satellite';

export class SatelliteSimulator {
  private satellite: Satellite;
  private time: number = 0; // simulation time in seconds
  private position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private velocity: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private orbitalElements: any;
  private satrec?: any; // satellite.js satellite record

  constructor(satellite: Satellite) {
    this.satellite = satellite;
    this.initializeSimulation();
  }

  /**
   * Initialize simulation based on satellite data
   */
  private initializeSimulation() {
    if (this.satellite.tle) {
      // Use satellite.js for TLE-based satellites
      this.satrec = satellite.twoline2satrec(
        this.satellite.tle.line1,
        this.satellite.tle.line2
      );
      this.updatePositionFromTLE();
    } else {
      // Use custom orbital mechanics for manually defined satellites
      this.orbitalElements = this.calculateOrbitalElements();
      this.calculatePosition();
    }
  }

  /**
   * Update position using satellite.js TLE data
   */
  private updatePositionFromTLE() {
    if (!this.satrec) return;

    const now = new Date();
    const positionAndVelocity = satellite.propagate(this.satrec, now);
    
    if (positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean') {
      const gmst = satellite.gstime(now);
      const geodeticCoords = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
      
      this.position = {
        x: positionAndVelocity.position.x,
        y: positionAndVelocity.position.y,
        z: positionAndVelocity.position.z
      };

      if (positionAndVelocity.velocity && typeof positionAndVelocity.velocity !== 'boolean') {
        this.velocity = {
          x: positionAndVelocity.velocity.x,
          y: positionAndVelocity.velocity.y,
          z: positionAndVelocity.velocity.z
        };
      }

      // Update satellite altitude from TLE
      this.satellite.altitude = geodeticCoords.height;
    }
  }

  /**
   * Calculate orbital elements based on satellite parameters
   */
  private calculateOrbitalElements() {
    const { altitude, inclination, velocity, orbitType } = this.satellite;
    
    // Earth's radius in km
    const earthRadius = 6371;
    const semiMajorAxis = altitude + earthRadius;
    
    // Convert inclination to radians
    const inclinationRad = (inclination * Math.PI) / 180;
    
    // Calculate orbital period (Kepler's third law)
    const mu = 3.986004418e5; // Earth's gravitational parameter (km³/s²)
    const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
    
    // Calculate mean motion (rad/s)
    const meanMotion = 2 * Math.PI / orbitalPeriod;
    
    let orbitalElements = {
      semiMajorAxis,
      inclination: inclinationRad,
      meanMotion,
      orbitalPeriod,
      eccentricity: 0,
      argumentOfPeriapsis: 0,
      rightAscensionOfAscendingNode: 0,
      meanAnomaly: 0
    };

    // Add orbit-specific elements
    if (orbitType === "LEO") {
      orbitalElements.eccentricity = this.satellite.eccentricity || 0.01;
      orbitalElements.argumentOfPeriapsis = (this.satellite.argumentOfPeriapsis || 0) * Math.PI / 180;
    } else if (orbitType === "Polar") {
      orbitalElements.rightAscensionOfAscendingNode = (this.satellite.rightAscensionOfAscendingNode || 0) * Math.PI / 180;
      orbitalElements.meanAnomaly = (this.satellite.meanAnomaly || 0) * Math.PI / 180;
    }

    return orbitalElements;
  }

  /**
   * Calculate satellite position using Kepler's equation
   */
  private calculatePosition(timeStep: number = 1) {
    this.time += timeStep;
    
    const { semiMajorAxis, eccentricity, inclination, 
            rightAscensionOfAscendingNode, argumentOfPeriapsis, 
            meanMotion, meanAnomaly } = this.orbitalElements;

    // Calculate current mean anomaly
    const currentMeanAnomaly = meanAnomaly + meanMotion * this.time;
    
    // Solve Kepler's equation for eccentric anomaly
    const eccentricAnomaly = this.solveKeplersEquation(currentMeanAnomaly, eccentricity);
    
    // Calculate true anomaly
    const trueAnomaly = 2 * Math.atan2(
      Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
    );

    // Calculate orbital radius
    const radius = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));

    // Calculate position in orbital plane
    const xOrbital = radius * Math.cos(trueAnomaly);
    const yOrbital = radius * Math.sin(trueAnomaly);

    // Transform to Earth-centered inertial coordinates
    const cosRAAN = Math.cos(rightAscensionOfAscendingNode);
    const sinRAAN = Math.sin(rightAscensionOfAscendingNode);
    const cosInc = Math.cos(inclination);
    const sinInc = Math.sin(inclination);
    const cosArgP = Math.cos(argumentOfPeriapsis);
    const sinArgP = Math.sin(argumentOfPeriapsis);

    // Rotation matrices for coordinate transformation
    const x = xOrbital * (cosRAAN * cosArgP - sinRAAN * sinArgP * cosInc) - 
              yOrbital * (cosRAAN * sinArgP + sinRAAN * cosArgP * cosInc);
    
    const y = xOrbital * (sinRAAN * cosArgP + cosRAAN * sinArgP * cosInc) - 
              yOrbital * (sinRAAN * sinArgP - cosRAAN * cosArgP * cosInc);
    
    const z = xOrbital * sinArgP * sinInc + yOrbital * cosArgP * sinInc;

    this.position = { x, y, z };
    return this.position;
  }

  /**
   * Solve Kepler's equation using Newton-Raphson method
   */
  private solveKeplersEquation(meanAnomaly: number, eccentricity: number, maxIterations: number = 10): number {
    let eccentricAnomaly = meanAnomaly; // Initial guess
    
    for (let i = 0; i < maxIterations; i++) {
      const f = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
      const fPrime = 1 - eccentricity * Math.cos(eccentricAnomaly);
      
      if (Math.abs(f) < 1e-6) break;
      
      eccentricAnomaly = eccentricAnomaly - f / fPrime;
    }
    
    return eccentricAnomaly;
  }

  /**
   * Calculate orbital velocity
   */
  private calculateVelocity() {
    const { semiMajorAxis, eccentricity } = this.orbitalElements;
    const mu = 3.986004418e5; // Earth's gravitational parameter
    
    // Vis-viva equation
    const r = Math.sqrt(this.position.x**2 + this.position.y**2 + this.position.z**2);
    const velocityMagnitude = Math.sqrt(mu * (2/r - 1/semiMajorAxis));
    
    // Calculate velocity components (simplified)
    const velocityDirection = this.calculateVelocityDirection();
    
    this.velocity = {
      x: velocityMagnitude * velocityDirection.x,
      y: velocityMagnitude * velocityDirection.y,
      z: velocityMagnitude * velocityDirection.z
    };
    
    return this.velocity;
  }

  /**
   * Calculate velocity direction (simplified)
   */
  private calculateVelocityDirection() {
    // Simplified velocity direction calculation
    // In a real simulation, this would be more complex
    const angle = Math.atan2(this.position.y, this.position.x) + Math.PI / 2;
    
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
      z: 0
    };
  }

  /**
   * Get current satellite state
   */
  getCurrentState() {
    return {
      position: this.position,
      velocity: this.velocity,
      simulationTime: this.time,
      orbitalElements: this.orbitalElements
    };
  }

  /**
   * Update satellite parameters and recalculate orbital elements
   */
  updateSatellite(newSatellite: Partial<Satellite>) {
    this.satellite = { ...this.satellite, ...newSatellite };
    this.initializeSimulation();
  }

  /**
   * Execute suggested action (simulate orbital maneuver)
   */
  executeAction(action: SuggestedAction): boolean {
    if (!action.parameters) return false;

    const { deltaV, burnDuration, newOrbit } = action.parameters;
    
    if (deltaV && burnDuration) {
      // Simulate burn
      const acceleration = deltaV / burnDuration; // m/s²
      const velocityChange = acceleration * burnDuration;
      
      // Apply velocity change (simplified)
      const velocityMagnitude = Math.sqrt(
        this.velocity.x**2 + this.velocity.y**2 + this.velocity.z**2
      );
      
      const newVelocityMagnitude = velocityMagnitude + velocityChange / 1000; // Convert to km/s
      
      // Update velocity components proportionally
      const scale = newVelocityMagnitude / velocityMagnitude;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
      this.velocity.z *= scale;
      
      // Update satellite velocity
      this.satellite.velocity = newVelocityMagnitude;
      
      // If new orbit parameters provided, update them
      if (newOrbit) {
        this.updateSatellite(newOrbit);
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Reset simulation
   */
  reset() {
    this.time = 0;
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.initializeSimulation();
  }
}

/**
 * Utility functions for orbit calculations
 */
export const OrbitUtils = {
  /**
   * Calculate orbital period from altitude
   */
  calculateOrbitalPeriod(altitudeKm: number): number {
    const earthRadius = 6371;
    const semiMajorAxis = altitudeKm + earthRadius;
    const mu = 3.986004418e5;
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
  },

  /**
   * Calculate orbital velocity from altitude
   */
  calculateOrbitalVelocity(altitudeKm: number): number {
    const earthRadius = 6371;
    const radius = altitudeKm + earthRadius;
    const mu = 3.986004418e5;
    return Math.sqrt(mu / radius);
  },

  /**
   * Check if orbit is stable
   */
  isStableOrbit(altitudeKm: number, eccentricity: number = 0): boolean {
    const earthRadius = 6371;
    const minAltitude = 160; // Minimum stable altitude (km)
    const maxAltitude = 2000; // Maximum LEO altitude (km)
    
    return altitudeKm >= minAltitude && 
           altitudeKm <= maxAltitude && 
           eccentricity >= 0 && 
           eccentricity < 1;
  },

  /**
   * Calculate ground track coordinates
   */
  calculateGroundTrack(position: { x: number; y: number; z: number }, time: number) {
    const earthRadius = 6371;
    const latitude = Math.asin(position.z / Math.sqrt(position.x**2 + position.y**2 + position.z**2));
    const longitude = Math.atan2(position.y, position.x) - (time * 7.292115e-5); // Earth's rotation rate
    
    return {
      latitude: latitude * 180 / Math.PI,
      longitude: longitude * 180 / Math.PI
    };
  },

  /**
   * Calculate distance between two satellites
   */
  calculateDistance(sat1: SatelliteSimulator, sat2: SatelliteSimulator): number {
    const pos1 = sat1.getCurrentState().position;
    const pos2 = sat2.getCurrentState().position;
    
    return Math.sqrt(
      (pos1.x - pos2.x)**2 + 
      (pos1.y - pos2.y)**2 + 
      (pos1.z - pos2.z)**2
    );
  },

  /**
   * Predict collision risk between two satellites
   */
  predictCollisionRisk(sat1: SatelliteSimulator, sat2: SatelliteSimulator, timeHorizon: number = 3600): {
    risk: 'low' | 'medium' | 'high';
    minDistance: number;
    timeToClosestApproach: number;
    probability: number;
  } {
    let minDistance = Infinity;
    let timeToClosestApproach = 0;
    
    // Simulate over time horizon
    for (let t = 0; t < timeHorizon; t += 60) { // Check every minute
      sat1.calculatePosition(60);
      sat2.calculatePosition(60);
      
      const distance = this.calculateDistance(sat1, sat2);
      if (distance < minDistance) {
        minDistance = distance;
        timeToClosestApproach = t;
      }
    }
    
    // Calculate risk based on minimum distance
    let risk: 'low' | 'medium' | 'high' = 'low';
    let probability = 0;
    
    if (minDistance < 1) {
      risk = 'high';
      probability = 0.001;
    } else if (minDistance < 5) {
      risk = 'medium';
      probability = 0.0001;
    } else {
      risk = 'low';
      probability = 0.00001;
    }
    
    return {
      risk,
      minDistance,
      timeToClosestApproach,
      probability
    };
  }
};

/**
 * Factory function to create satellite simulators
 */
export function createSatelliteSimulator(satellite: Satellite): SatelliteSimulator {
  return new SatelliteSimulator(satellite);
}

export default SatelliteSimulator;
