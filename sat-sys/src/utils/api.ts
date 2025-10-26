import axios from 'axios';

// API Configuration
const CME_PREDICTION_API = 'https://kauai.ccmc.gsfc.nasa.gov/CMEscoreboard/WS/get/predictions';;
const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php';
const NOAA_SWPC_BASE = 'https://services.swpc.noaa.gov/json';
const SPACETRACK_BASE = 'https://www.space-track.org';

// Get NASA API key from environment (Vite only - browser safe)
const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

// ==================== TLE DATA ====================

/**
 * Fetch TLE data from CelesTrak (no auth required)
 * @param group - Satellite group (e.g., 'stations', 'visual', 'active')
 * @returns Array of TLE strings (3 lines per satellite: name, line1, line2)
 */
// export async function fetchTLEFromCelesTrak(group: string = 'stations') {
//   try {
//     const response = await axios.get(CELESTRAK_BASE, {
//       params: {
//         GROUP: group,
//         FORMAT: 'tle'
//       }
//     });
    
//     // Parse TLE data (3 lines per satellite)
//     const lines = response.data.split('\n').filter((line: string) => line.trim());
//     const satellites = [];
    
//     for (let i = 0; i < lines.length; i += 3) {
//       if (i + 2 < lines.length) {
//         satellites.push({
//           name: lines[i].trim(),
//           line1: lines[i + 1].trim(),
//           line2: lines[i + 2].trim()
//         });
//       }
//     }
    
//     return satellites;
//   } catch (error) {
//     console.error('Error fetching TLE from CelesTrak:', error);
//     throw error;
//   }
// }

export async function fetchTLEFromCelesTrak() {
   // Mock data matching the structure expected in useSatelliteData.ts (with activityID, startTime, sourceLocation, cmeAnalyses)
  const mockCME = [
    {
      activityID: '2025-001-001',
      startTime: '2025-10-24T12:00:00Z', // Fixed start time
      sourceLocation: 'Sun Center',
      instruments: [{ displayName: 'SOHO' }],
      cmeAnalyses: [{
        speed: 1200,
        latitude: 10,
        longitude: -20,
        time21_5: '2025-10-25T00:00:00Z'
      }]
    },
    {
      activityID: '2025-001-002',
      startTime: '2025-10-23T18:00:00Z', // Fixed start time
      sourceLocation: 'Sun East',
      instruments: [{ displayName: 'STEREO' }],
      cmeAnalyses: [{
        speed: 1500,
        latitude: 5,
        longitude: 15,
        time21_5: '2025-10-24T06:00:00Z'
      }]
    }
  ];
  
  return mockCME;
}

/**
 * Fetch TLE data for a specific satellite by NORAD ID from CelesTrak
 */
export async function fetchTLEByNoradId(noradId: string) {
  try {
    const response = await axios.get(CELESTRAK_BASE, {
      params: {
        CATNR: noradId,
        FORMAT: 'tle'
      }
    });
    
    const lines = response.data.split('\n').filter((line: string) => line.trim());
    
    if (lines.length >= 3) {
      return {
        name: lines[0].trim(),
        line1: lines[1].trim(),
        line2: lines[2].trim()
      };
    }
    
    throw new Error('Invalid TLE data received');
  } catch (error) {
    console.error('Error fetching TLE by NORAD ID:', error);
    throw error;
  }
}

// ==================== CME DATA ====================

export interface CMEPrediction {
  id: string;
  cmeTime: string; // Time of the CME event
  predictedArrivalTime: string; // Predicted arrival time at Earth
  probability: number; // Probability of arrival (if provided)
  sourceLocation?: string; // Optional source location of the CME
  instruments: Array<{ displayName: string }>; // Instruments used for prediction
  notes?: string; // Optional notes or comments
}
/**
 * Fetch the latest CME prediction from NASA CME Scoreboard API
 */
export async function fetchLatestCMEPrediction() {
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  const fiveDaysPrior = new Date();
  fiveDaysPrior.setDate(fiveDaysPrior.getDate() - 5); // Subtract 5 days from the current date
  const fiveDaysPriorDate = fiveDaysPrior.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  const url = `${CME_PREDICTION_API}?CMEtimeStart=${fiveDaysPriorDate}&CMEtimeEnd=${currentDate}&skipNoArrivalObservedCMEs=false&closeOutCMEsOnly=false`;
  console.log('Fetching CME predictions from URL:', url);

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Failed to fetch CME predictions: ${response.statusText}`);
      }

      const data = await response.json();


      // Filter predictions to ensure the predicted arrival date is after the current date
      const validPredictions = data
      .flatMap((cme: any) => cme.predictions) // Extract all predictions from each CME object
      .filter((prediction: any) => {
        const predictedArrival = new Date(prediction.predictedArrivalTime);
        console.log('Predicted Arrival Time:', predictedArrival);
        return predictedArrival > new Date(); // Ensure the predicted arrival is in the future
      });

     console.log('Valid CME Predictions:', validPredictions);
      return validPredictions;
      
  } catch (error) {
      console.error('Error fetching CME predictions:', error);
      return null;
  }
}


// ==================== SPACE WEATHER ====================

export interface GeomageticStorm {
  time_tag: string;
  kp_index: number;
  observed?: string;
  noaa_scale?: string;
}

/**
 * Fetch current Geomagnetic Storm data from NOAA
 */
export async function fetchGeomagneticStorm() {
  // uncomment to test with api
  // try {
  //   const response = await axios.get<GeomageticStorm[]>(
  //     `${NOAA_SWPC_BASE}/planetary_k_index_1m.json`,
  //     {
  //       timeout: 10000,
  //       headers: {
  //         'Accept': 'application/json',
  //       }
  //     }
  //   );
    
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching geomagnetic storm data:', error);
  //   // Return empty array for network errors
  //   if (axios.isAxiosError(error)) {
  //     if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
  //       console.warn('Geomagnetic storm API network error - returning empty data');
  //       return [];
  //     }
  //   }
  //   throw error;
  // }

//mock data to test 
const mockGeomag: GeomageticStorm[] = [
    {
      time_tag: '2025-10-25T12:00:00Z', // Fixed time tag
      kp_index: 4,
      observed: 'observed',
      noaa_scale: 'G0'
    },
    {
      time_tag: '2025-10-25T12:05:00Z', // Fixed time tag
      kp_index: 6,
      observed: 'observed',
      noaa_scale: 'G2'
    },
    {
      time_tag: '2025-10-25T12:10:00Z', // Fixed time tag
      kp_index: 7.5,
      observed: 'observed',
      noaa_scale: 'G3'
    }
  ];
  return mockGeomag;
}

/**
 * Fetch Solar Wind data from NOAA
 */
export async function fetchSolarWind() {
  try {
    const response = await axios.get(
      `${NOAA_SWPC_BASE}/ace/swepam/swepam_1m.json`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching solar wind data:', error);
    throw error;
  }
}

/**
 * Fetch space weather alerts from NOAA
 */
export async function fetchSpaceWeatherAlerts() {
  try {
    const response = await axios.get(
      `${NOAA_SWPC_BASE}/icao-space-weather-advisories.json`,
      {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching space weather alerts:', error);
    // Return empty array for network errors
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.warn('Space weather alerts API network error - returning empty data');
        return [];
      }
    }
    throw error;
  }
}

//==================== CONJUNCTION DATA ====================

export interface ConjunctionEvent {
  satelliteId: string;
  objectName: string;
  tca: string; // Time of Closest Approach
  missDistance: number; // in kilometers
  relativeVelocity: number; // in km/s
  probability: number; // collision probability
  risk: 'low' | 'medium' | 'high';
}

/**
 * Enhanced conjunction data generator with more realistic scenarios
 * Note: Real CDM data requires Space-Track authentication and backend proxy
 */
export async function fetchConjunctionData(): Promise<ConjunctionEvent[]> {
  // TODO: Implement real Space-Track CDM API when backend is ready
  // For now, return enhanced mock data for development
  
  const mockData: ConjunctionEvent[] = [
    {
      satelliteId: '25544', // ISS
      objectName: 'DEBRIS-2024-001',
      tca: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      missDistance: 0.5,
      relativeVelocity: 14.2,
      probability: 0.00001,
      risk: 'high'
    },
    {
      satelliteId: '25544',
      objectName: 'DEBRIS-2024-045',
      tca: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
      missDistance: 2.3,
      relativeVelocity: 8.7,
      probability: 0.000001,
      risk: 'medium'
    },
    {
      satelliteId: '43013', // Starlink
      objectName: 'DEBRIS-2024-078',
      tca: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      missDistance: 1.8,
      relativeVelocity: 12.1,
      probability: 0.000005,
      risk: 'medium'
    },
    {
      satelliteId: '43175', // Hubble
      objectName: 'DEBRIS-2024-123',
      tca: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
      missDistance: 5.2,
      relativeVelocity: 6.8,
      probability: 0.0000001,
      risk: 'low'
    }
  ];
  
  return mockData;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Available satellite groups from CelesTrak
 */
export const CELESTRAK_GROUPS = [
  'stations',      // Space Stations
  'visual',        // Brightest satellites
  'active',        // Active satellites
  'analyst',       // Analyst satellites
  'weather',       // Weather satellites
  'noaa',          // NOAA satellites
  'goes',          // GOES satellites
  'resource',      // Earth resources satellites
  'sarsat',        // Search & Rescue satellites
  'dmc',           // Disaster Monitoring
  'tdrss',         // Tracking & Data Relay
  'geo',           // Geostationary satellites
  'intelsat',      // Intelsat satellites
  'gps-ops',       // GPS satellites
  'galileo',       // Galileo satellites
  'beidou',        // Beidou satellites
  'iridium',       // Iridium satellites
  'starlink',      // Starlink satellites
  'oneweb',        // OneWeb satellites
];

/**
 * Get human-readable name for satellite group
 */
export function getGroupName(group: string): string {
  const names: Record<string, string> = {
    stations: 'Space Stations',
    visual: 'Brightest Satellites',
    active: 'Active Satellites',
    weather: 'Weather Satellites',
    starlink: 'Starlink Constellation',
    geo: 'Geostationary Satellites',
  };
  return names[group] || group;
}

/**
 * Calculate threat level based on miss distance and probability
 */
export function calculateThreatLevel(missDistance: number, probability: number): 'low' | 'medium' | 'high' {
  if (missDistance < 1 && probability > 0.00001) return 'high';
  if (missDistance < 5 && probability > 0.000001) return 'medium';
  return 'low';
}

/**
 * Generate suggested action based on threat assessment
 */
export function generateSuggestedAction(conjunction: ConjunctionEvent) {
  const timeToTCA = new Date(conjunction.tca).getTime() - Date.now();
  const hoursToTCA = timeToTCA / (1000 * 60 * 60);
  
  if (conjunction.risk === 'high' && hoursToTCA < 24) {
    return {
      type: 'evasive_maneuver',
      description: `Execute emergency evasive maneuver - ${hoursToTCA.toFixed(1)}h until closest approach`,
      priority: 'critical',
      estimatedFuelCost: 2.5,
      estimatedTimeToExecute: 15,
      successProbability: 0.85,
      parameters: {
        deltaV: 5.0, // m/s
        burnDuration: 300 // seconds
      }
    };
  } else if (conjunction.risk === 'medium' && hoursToTCA < 72) {
    return {
      type: 'orbit_adjustment',
      description: `Plan orbit adjustment maneuver - ${hoursToTCA.toFixed(1)}h until closest approach`,
      priority: 'high',
      estimatedFuelCost: 1.2,
      estimatedTimeToExecute: 30,
      successProbability: 0.92,
      parameters: {
        deltaV: 2.5, // m/s
        burnDuration: 180 // seconds
      }
    };
  } else {
    return {
      type: 'attitude_change',
      description: `Monitor situation - ${hoursToTCA.toFixed(1)}h until closest approach`,
      priority: 'medium',
      estimatedFuelCost: 0.1,
      estimatedTimeToExecute: 5,
      successProbability: 0.98,
      parameters: {
        deltaV: 0.5, // m/s
        burnDuration: 60 // seconds
      }
    };
  }
}
