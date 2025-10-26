import { useState } from "react";
import { Satellite, OrbitType } from "../types/Satellite";
import { fetchTLEByNoradId, fetchTLEFromCelesTrak, CELESTRAK_GROUPS } from "../utils/api";
import * as satellite from "satellite.js";

interface Props {
  onAdd: (satellite: Satellite) => void;
}

export default function SatelliteForm({ onAdd }: Props) {
  const [activeTab, setActiveTab] = useState<'manual' | 'api'>('manual');
  const [noradId, setNoradId] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("stations");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Manual form state
  const [form, setForm] = useState({ 
    name: "", 
    orbitType: "LEO" as OrbitType,
    altitude: "", 
    inclination: "", 
    velocity: "",
    // LEO specific fields
    eccentricity: "",
    argumentOfPeriapsis: "",
    // Polar orbit specific fields
    rightAscensionOfAscendingNode: "",
    meanAnomaly: ""
  });

  // Load satellite by NORAD ID
  const handleLoadByNoradId = async () => {
    if (!noradId.trim()) {
      setError("Please enter a NORAD ID");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const tleData = await fetchTLEByNoradId(noradId);
      
      // Parse TLE and calculate current position
      const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);
      const now = new Date();
      const positionAndVelocity = satellite.propagate(satrec, now);
      
      if (positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean') {
        const gmst = satellite.gstime(now);
        const geodeticCoords = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        
        const newSatellite: Satellite = {
          id: noradId,
          name: tleData.name,
          orbitType: "LEO", // Default for TLE satellites
          altitude: geodeticCoords.height,
          inclination: 0, // Extract from TLE if needed
          velocity: 7.8, // Approximate LEO velocity
          noradId: noradId,
          tle: {
            line1: tleData.line1,
            line2: tleData.line2
          }
        };
        
        onAdd(newSatellite);
        setNoradId("");
        setError(`✅ Successfully loaded ${tleData.name}`);
      } else {
        setError("Could not calculate satellite position");
      }
    } catch (err) {
      setError(`Failed to load satellite: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Load all satellites from a group
  const handleLoadGroup = async () => {
    setLoading(true);
    setError("");
    
    try {
      const tleDataArray = await fetchTLEFromCelesTrak(selectedGroup);
      
      // Add first 5 satellites from the group (to avoid overwhelming the UI)
      const satellitesToAdd = tleDataArray.slice(0, 5);
      
      satellitesToAdd.forEach((tleData, index) => {
        const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);
        const now = new Date();
        const positionAndVelocity = satellite.propagate(satrec, now);
        
        if (positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean') {
          const gmst = satellite.gstime(now);
          const geodeticCoords = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
          
          const newSatellite: Satellite = {
            id: `${selectedGroup}-${index}`,
            name: tleData.name,
            orbitType: "LEO",
            altitude: geodeticCoords.height,
            inclination: 0,
            velocity: 7.8,
            tle: {
              line1: tleData.line1,
              line2: tleData.line2
            }
          };
          
          onAdd(newSatellite);
        }
      });
      
      setError(`✅ Loaded ${satellitesToAdd.length} satellites from ${selectedGroup}`);
    } catch (err) {
      setError(`Failed to load group: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Manual form submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const satellite: Satellite = {
      id: Date.now().toString(),
      name: form.name,
      orbitType: form.orbitType,
      altitude: Number(form.altitude),
      inclination: Number(form.inclination),
      velocity: Number(form.velocity),
    };

    // Add orbit-specific parameters
    if (form.orbitType === "LEO") {
      satellite.eccentricity = Number(form.eccentricity);
      satellite.argumentOfPeriapsis = Number(form.argumentOfPeriapsis);
    } else if (form.orbitType === "Polar") {
      satellite.rightAscensionOfAscendingNode = Number(form.rightAscensionOfAscendingNode);
      satellite.meanAnomaly = Number(form.meanAnomaly);
    }

    onAdd(satellite);
    setForm({ 
      name: "", 
      orbitType: "LEO",
      altitude: "", 
      inclination: "", 
      velocity: "",
      eccentricity: "",
      argumentOfPeriapsis: "",
      rightAscensionOfAscendingNode: "",
      meanAnomaly: ""
    });
    setError("✅ Satellite added successfully");
  };

  return (
    <div className="p-6 border rounded-lg bg-slate-50 space-y-4">
      <h2 className="text-2xl font-bold">🛰️ Add Satellites</h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'manual' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Manual Input
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'api' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Load from APIs
        </button>
      </div>

      {error && (
        <div className={`p-3 rounded ${
          error.includes('✅') || error.includes('Successfully') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {error}
        </div>
      )}

      {/* Manual Input Tab */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Satellite Name</label>
              <input 
                placeholder="Enter satellite name" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orbit Type</label>
              <select 
                value={form.orbitType}
                onChange={e => setForm({ ...form, orbitType: e.target.value as OrbitType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LEO">Low Earth Orbit (LEO)</option>
                <option value="Polar">Polar Orbit</option>
                <option value="GEO">Geostationary Orbit (GEO)</option>
                <option value="MEO">Medium Earth Orbit (MEO)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Altitude (km)</label>
              <input 
                placeholder="e.g., 400" 
                value={form.altitude}
                onChange={e => setForm({ ...form, altitude: e.target.value })} 
                type="number"
                min="160"
                max="2000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inclination (°)</label>
              <input 
                placeholder="e.g., 51.6" 
                value={form.inclination}
                onChange={e => setForm({ ...form, inclination: e.target.value })} 
                type="number"
                min="0"
                max="180"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Velocity (km/s)</label>
              <input 
                placeholder="e.g., 7.8" 
                value={form.velocity}
                onChange={e => setForm({ ...form, velocity: e.target.value })} 
                type="number"
                min="1"
                max="15"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* LEO specific parameters */}
          {form.orbitType === "LEO" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eccentricity (0-1)</label>
                <input 
                  placeholder="e.g., 0.01" 
                  value={form.eccentricity}
                  onChange={e => setForm({ ...form, eccentricity: e.target.value })} 
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Argument of Periapsis (°)</label>
                <input 
                  placeholder="e.g., 0" 
                  value={form.argumentOfPeriapsis}
                  onChange={e => setForm({ ...form, argumentOfPeriapsis: e.target.value })} 
                  type="number"
                  min="0"
                  max="360"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Polar orbit specific parameters */}
          {form.orbitType === "Polar" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Right Ascension of Ascending Node (°)</label>
                <input 
                  placeholder="e.g., 0" 
                  value={form.rightAscensionOfAscendingNode}
                  onChange={e => setForm({ ...form, rightAscensionOfAscendingNode: e.target.value })} 
                  type="number"
                  min="0"
                  max="360"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mean Anomaly (°)</label>
                <input 
                  placeholder="e.g., 0" 
                  value={form.meanAnomaly}
                  onChange={e => setForm({ ...form, meanAnomaly: e.target.value })} 
                  type="number"
                  min="0"
                  max="360"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Add Satellite
          </button>
        </form>
      )}

      {/* API Loading Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* Load by NORAD ID */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Load by NORAD ID</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., 25544 for ISS"
                value={noradId}
                onChange={(e) => setNoradId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleLoadByNoradId}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Loading..." : "Load"}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Try: 25544 (ISS), 43013 (Starlink), 43175 (Hubble)
            </p>
          </div>

          {/* Load by Group */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Load Satellite Group</h3>
            <div className="flex gap-2">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {CELESTRAK_GROUPS.map(group => (
                  <option key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleLoadGroup}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Loading..." : "Load Group (5 sats)"}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Select a group and load real satellites from CelesTrak
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
