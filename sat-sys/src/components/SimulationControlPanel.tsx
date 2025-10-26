import { useState } from "react";

interface Props {
  isSimulationRunning: boolean;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onPredictCollisions: () => void;
  satelliteCount: number;
}

export default function SimulationControlPanel({ 
  isSimulationRunning, 
  onStartSimulation, 
  onStopSimulation, 
  onPredictCollisions,
  satelliteCount 
}: Props) {
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  return (
    <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      <h2 className="text-2xl font-bold mb-4">🎮 Simulation Control</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simulation Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Orbital Simulation</h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Simulation Speed
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="w-full"
                disabled={isSimulationRunning}
              />
              <div className="text-xs text-gray-600 mt-1">
                {simulationSpeed}x speed
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            {!isSimulationRunning ? (
              <button
                onClick={onStartSimulation}
                disabled={satelliteCount === 0}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                ▶️ Start Simulation
              </button>
            ) : (
              <button
                onClick={onStopSimulation}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                ⏹️ Stop Simulation
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {isSimulationRunning ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full pulse-animation"></div>
                <span>Simulation running at {simulationSpeed}x speed</span>
              </div>
            ) : (
              <span>Simulation stopped</span>
            )}
          </div>
        </div>

        {/* Analysis Tools */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Analysis Tools</h3>
          
          <button
            onClick={onPredictCollisions}
            disabled={satelliteCount < 2}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            🔍 Predict Collisions
          </button>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Active Satellites:</span>
              <span className="font-medium">{satelliteCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Simulation Status:</span>
              <span className={`font-medium ${isSimulationRunning ? 'text-green-600' : 'text-gray-600'}`}>
                {isSimulationRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Collision Analysis:</span>
              <span className="font-medium text-gray-600">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">Simulation Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Real-time orbital mechanics</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>TLE-based positioning</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Collision prediction</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Space weather monitoring</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Suggested actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Action execution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
