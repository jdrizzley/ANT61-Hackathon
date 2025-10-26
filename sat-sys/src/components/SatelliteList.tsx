import { Satellite } from "../types/Satellite";

interface Props {
  satellites: Satellite[];
  onRemove?: (id: string) => void;
  onExecuteAction?: (satelliteId: string, actionId: string) => void;
}

export default function SatelliteList({ satellites, onRemove, onExecuteAction }: Props) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'danger': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'safe': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrbitTypeColor = (orbitType: string) => {
    switch (orbitType) {
      case 'LEO': return 'bg-blue-100 text-blue-800';
      case 'Polar': return 'bg-purple-100 text-purple-800';
      case 'GEO': return 'bg-green-100 text-green-800';
      case 'MEO': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPosition = (position?: { x: number; y: number; z: number }) => {
    if (!position) return 'N/A';
    return `(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`;
  };

  const formatVelocity = (velocity?: { x: number; y: number; z: number }) => {
    if (!velocity) return 'N/A';
    const magnitude = Math.sqrt(velocity.x**2 + velocity.y**2 + velocity.z**2);
    return `${magnitude.toFixed(2)} km/s`;
  };

  return (
    <div className="p-6 border rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🛰️ Active Satellites ({satellites.length})</h2>
        {satellites.length > 0 && (
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>

      {satellites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🛰️</div>
          <p>No satellites added yet</p>
          <p className="text-sm">Add satellites using the form above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {satellites.map((satellite) => (
            <div key={satellite.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold">{satellite.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrbitTypeColor(satellite.orbitType)}`}>
                    {satellite.orbitType}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(satellite.status)}`}>
                    {satellite.status || 'unknown'}
                  </span>
                </div>
                {onRemove && (
                  <button
                    onClick={() => onRemove(satellite.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Altitude:</span>
                  <div className="text-gray-900">{satellite.altitude.toFixed(1)} km</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Inclination:</span>
                  <div className="text-gray-900">{satellite.inclination.toFixed(1)}°</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Velocity:</span>
                  <div className="text-gray-900">{satellite.velocity.toFixed(2)} km/s</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">NORAD ID:</span>
                  <div className="text-gray-900">{satellite.noradId || 'N/A'}</div>
                </div>
              </div>

              {/* Orbital Parameters */}
              {(satellite.eccentricity !== undefined || satellite.argumentOfPeriapsis !== undefined) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Orbital Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    {satellite.eccentricity !== undefined && (
                      <div>
                        <span className="font-medium text-gray-700">Eccentricity:</span>
                        <div className="text-gray-900">{satellite.eccentricity.toFixed(4)}</div>
                      </div>
                    )}
                    {satellite.argumentOfPeriapsis !== undefined && (
                      <div>
                        <span className="font-medium text-gray-700">Arg. of Periapsis:</span>
                        <div className="text-gray-900">{satellite.argumentOfPeriapsis.toFixed(1)}°</div>
                      </div>
                    )}
                    {satellite.rightAscensionOfAscendingNode !== undefined && (
                      <div>
                        <span className="font-medium text-gray-700">RAAN:</span>
                        <div className="text-gray-900">{satellite.rightAscensionOfAscendingNode.toFixed(1)}°</div>
                      </div>
                    )}
                    {satellite.meanAnomaly !== undefined && (
                      <div>
                        <span className="font-medium text-gray-700">Mean Anomaly:</span>
                        <div className="text-gray-900">{satellite.meanAnomaly.toFixed(1)}°</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Real-time Position Data */}
              {(satellite.currentPosition || satellite.currentVelocity) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Real-time Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Position (ECI):</span>
                      <div className="text-gray-900 font-mono text-xs">{formatPosition(satellite.currentPosition)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Velocity:</span>
                      <div className="text-gray-900 font-mono text-xs">{formatVelocity(satellite.currentVelocity)}</div>
                    </div>
                  </div>
                  {satellite.lastUpdated && (
                    <div className="mt-2 text-xs text-gray-500">
                      Last updated: {new Date(satellite.lastUpdated).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}

              {/* TLE Data */}
              {satellite.tle && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">TLE Data</h4>
                  <div className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono">
                    <div className="mb-1">{satellite.tle.line1}</div>
                    <div>{satellite.tle.line2}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
