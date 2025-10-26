export type OrbitType = "LEO" | "Polar" | "GEO" | "MEO";

export interface Satellite {
  id: string;
  name: string;
  orbitType: OrbitType;
  altitude: number; // km
  inclination: number; // degrees
  velocity: number; // km/s
  status?: "safe" | "warning" | "danger";
  tle?: {
    line1: string;
    line2: string;
  };
  
  // Orbital parameters for simulation
  eccentricity?: number; // for elliptical orbits
  argumentOfPeriapsis?: number; // degrees
  rightAscensionOfAscendingNode?: number; // degrees
  meanAnomaly?: number; // degrees
  
  // Simulation state
  currentPosition?: {
    x: number;
    y: number;
    z: number;
  };
  currentVelocity?: {
    x: number;
    y: number;
    z: number;
  };
  
  // Real-time data
  lastUpdated?: string;
  noradId?: string;
}

export interface ConjunctionEvent {
  id: string;
  satelliteId: string;
  objectName: string;
  tca: string; // Time of Closest Approach
  missDistance: number; // in kilometers
  relativeVelocity: number; // in km/s
  probability: number; // collision probability
  risk: 'low' | 'medium' | 'high';
  suggestedAction?: SuggestedAction;
}

export interface CMEPrediction {
  predictedMethodName: string;
  submissionTime: string;
  predictedArrivalTime: string;
  uncertaintyMinusInHrs?: number | null;
  uncertaintyPlusInHrs?: number | null;
  confidenceInPercentage?: number | null;
  predictedMaxKpLowerRange?: number | null;
  predictedMaxKpUpperRange?: number | null;
  predictedDstMin?: number | null;
  predictedDstMinTime?: string | null;
  differenceInHrs?: number | null;
  leadTimeInHrs?: string | null;
  predictionNote?: string;
}

export interface SpaceWeatherAlert {
  id: string;
  type: 'geomagnetic' | 'solar_wind' | 'radiation' | 'cme';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  affectedSatellites?: string[];
  suggestedAction?: SuggestedAction;
}

export interface SuggestedAction {
  id: string;
  type: 'orbit_adjustment' | 'power_down' | 'attitude_change' | 'evasive_maneuver' | 'communication_shutdown';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedFuelCost?: number; // kg
  estimatedTimeToExecute?: number; // minutes
  successProbability?: number; // 0-1
  parameters?: {
    deltaV?: number; // m/s
    burnDuration?: number; // seconds
    newOrbit?: Partial<Satellite>;
  };
}

export interface ThreatAssessment {
  satelliteId: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  threats: Array<{
    type: 'collision' | 'space_weather' | 'radiation' | 'debris';
    severity: number; // 0-10
    timeToImpact?: number; // minutes
    description: string;
  }>;
  recommendedActions: SuggestedAction[];
  lastAssessment: string;
}

export interface SimulationState {
  isRunning: boolean;
  timeStep: number; // seconds
  currentTime: number; // simulation time in seconds
  satellites: Map<string, Satellite>;
  threats: Map<string, ThreatAssessment>;
}
