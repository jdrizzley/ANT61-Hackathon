import { useState } from "react";
import { ConjunctionEvent, SpaceWeatherAlert, SuggestedAction } from "../types/Satellite";

interface Props {
  alerts: string[];
  conjunctions: ConjunctionEvent[];
  spaceWeatherAlerts: SpaceWeatherAlert[];
  onExecuteAction?: (satelliteId: string, action: SuggestedAction) => void;
  onDismissAlert?: (alertId: string) => void;
}

export default function AlertPanel({ alerts, conjunctions, spaceWeatherAlerts, onExecuteAction, onDismissAlert }: Props) {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const toggleExpanded = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  const getAlertSeverity = (alert: string) => {
    if (alert.includes('HIGH RISK') || alert.includes('FAST CME') || alert.includes('CRITICAL')) {
      return 'critical';
    } else if (alert.includes('MEDIUM RISK') || alert.includes('WARNING')) {
      return 'warning';
    } else {
      return 'info';
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-600 text-red-900';
      case 'warning':
        return 'bg-yellow-100 border-yellow-600 text-yellow-900';
      case 'info':
        return 'bg-blue-100 border-blue-600 text-blue-900';
      default:
        return 'bg-gray-100 border-gray-600 text-gray-900';
    }
  };

  const getActionPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const formatTimeToTCA = (tca: string) => {
    const timeUntil = new Date(tca).getTime() - Date.now();
    const hoursUntil = Math.round(timeUntil / (1000 * 60 * 60));
    const minutesUntil = Math.round(timeUntil / (1000 * 60));
    
    if (hoursUntil > 24) {
      return `${Math.round(hoursUntil / 24)} days`;
    } else if (hoursUntil > 0) {
      return `${hoursUntil}h ${minutesUntil % 60}m`;
    } else {
      return `${minutesUntil}m`;
    }
  };

  const handleExecuteAction = (satelliteId: string, action: SuggestedAction) => {
    if (onExecuteAction) {
      onExecuteAction(satelliteId, action);
    }
  };

  const handleDismiss = (alertId: string) => {
    if (onDismissAlert) {
      console.log("antohny cool");  
      onDismissAlert(alertId);    
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-gradient-to-br from-red-50 to-orange-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🚨 Real-Time Alerts</h2>
        <div className="text-sm text-gray-600">
          {alerts.length + conjunctions.length + spaceWeatherAlerts.length} active alerts
        </div>
      </div>

      {alerts.length === 0 && conjunctions.length === 0 && spaceWeatherAlerts.length === 0 ? (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg text-center">
          ✅ All systems nominal. No threats detected.
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto alerts-scroll">
          {/* General Alerts */}
          {alerts.map((alert, i) => (
            <div 
              key={`alert-${i}`}
              className={`p-4 rounded-lg border-l-4 ${getSeverityStyles(getAlertSeverity(alert))}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{alert}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getAlertSeverity(alert) === 'critical' ? 'bg-red-500 pulse-animation' : ''}`}></div>
              </div>
            </div>
          ))}

          {/* Conjunction Alerts */}
          {conjunctions.map((conjunction) => {
            const alertId = conjunction.id; 
            const isExpanded = expandedAlerts.has(alertId);
            const severity = conjunction.risk === 'high' ? 'critical' : conjunction.risk === 'medium' ? 'warning' : 'info';
            
            return (
              <div 
                key={alertId}
                className={`p-4 rounded-lg border-l-4 ${getSeverityStyles(severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">
                        {conjunction.risk === 'high' ? '🚨' : conjunction.risk === 'medium' ? '⚠️' : 'ℹ️'} 
                        Collision Risk: {conjunction.objectName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionPriorityColor(conjunction.risk)} text-white`}>
                        {conjunction.risk.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Satellite:</span> {conjunction.satelliteId}
                      </div>
                      <div>
                        <span className="font-medium">Time to TCA:</span> {formatTimeToTCA(conjunction.tca)}
                      </div>
                      <div>
                        <span className="font-medium">Miss Distance:</span> {conjunction.missDistance} km
                      </div>
                      <div>
                        <span className="font-medium">Relative Velocity:</span> {conjunction.relativeVelocity} km/s
                      </div>
                    </div>

                    {conjunction.suggestedAction && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Suggested Action</h4>
                          <button
                            onClick={() => toggleExpanded(alertId)}
                            className="text-sm underline hover:no-underline"
                          >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </button>
                        </div>
                        
                        <p className="text-sm mb-2">{conjunction.suggestedAction.description}</p>
                        
                        {isExpanded && (
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium">Priority:</span> {conjunction.suggestedAction.priority}
                              </div>
                              <div>
                                <span className="font-medium">Success Probability:</span> {(conjunction.suggestedAction.successProbability || 0) * 100}%
                              </div>
                              {conjunction.suggestedAction.estimatedFuelCost && (
                                <div>
                                  <span className="font-medium">Fuel Cost:</span> {conjunction.suggestedAction.estimatedFuelCost} kg
                                </div>
                              )}
                              {conjunction.suggestedAction.estimatedTimeToExecute && (
                                <div>
                                  <span className="font-medium">Execution Time:</span> {conjunction.suggestedAction.estimatedTimeToExecute} min
                                </div>
                              )}
                            </div>
                            
                            {conjunction.suggestedAction.parameters && (
                              <div className="mt-2">
                                <span className="font-medium">Parameters:</span>
                                <div className="ml-4 space-y-1">
                                  {conjunction.suggestedAction.parameters.deltaV && (
                                    <div>ΔV: {conjunction.suggestedAction.parameters.deltaV} m/s</div>
                                  )}
                                  {conjunction.suggestedAction.parameters.burnDuration && (
                                    <div>Burn Duration: {conjunction.suggestedAction.parameters.burnDuration} s</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => handleExecuteAction(conjunction.satelliteId, conjunction.suggestedAction!)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              conjunction.suggestedAction.priority === 'critical' 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : conjunction.suggestedAction.priority === 'high'
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            Execute Action
                          </button>
                          <button
                            onClick={() => handleDismiss(alertId)}
                            className="px-3 py-1 rounded text-sm font-medium bg-gray-600 text-white hover:bg-gray-700"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Space Weather Alerts */}
          {spaceWeatherAlerts.map((alert) => {
            const alertId = alert.id;
            const isExpanded = expandedAlerts.has(alertId);
            const severity = alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'warning' : 'info';
            
            return (
              <div 
                key={alertId}
                className={`p-4 rounded-lg border-l-4 ${getSeverityStyles(severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">
                        {alert.type === 'cme' ? '☀️' : alert.type === 'geomagnetic' ? '🌪️' : '⚠️'} 
                        {alert.type.replace('_', ' ').toUpperCase()}: {alert.message}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionPriorityColor(alert.severity)} text-white`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm mb-3">
                      <div>
                        <span className="font-medium">Timestamp:</span> {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      {alert.affectedSatellites && alert.affectedSatellites.length > 0 && (
                        <div>
                          <span className="font-medium">Affected Satellites:</span> {alert.affectedSatellites.join(', ')}
                        </div>
                      )}
                    </div>

                    {alert.suggestedAction && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Suggested Action</h4>
                          <button
                            onClick={() => toggleExpanded(alertId)}
                            className="text-sm underline hover:no-underline"
                          >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </button>
                        </div>
                        
                        <p className="text-sm mb-2">{alert.suggestedAction.description}</p>
                        
                        {isExpanded && (
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium">Type:</span> {alert.suggestedAction.type.replace('_', ' ')}
                              </div>
                              <div>
                                <span className="font-medium">Priority:</span> {alert.suggestedAction.priority}
                              </div>
                              {alert.suggestedAction.estimatedTimeToExecute && (
                                <div>
                                  <span className="font-medium">Execution Time:</span> {alert.suggestedAction.estimatedTimeToExecute} min
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Success Probability:</span> {(alert.suggestedAction.successProbability || 0) * 100}%
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => {
                              if (alert.affectedSatellites && alert.affectedSatellites.length > 0) {
                                handleExecuteAction(alert.affectedSatellites[0], alert.suggestedAction!);
                              }
                            }}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              alert.suggestedAction.priority === 'critical' 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : alert.suggestedAction.priority === 'high'
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            Execute Action
                          </button>
                          <button
                            onClick={() => handleDismiss(alertId)}
                            className="px-3 py-1 rounded text-sm font-medium bg-gray-600 text-white hover:bg-gray-700"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600 text-center">
        Data Sources: CelesTrak (TLE) • NASA DONKI (CME) • NOAA (Space Weather) • Updates every 30s
      </div>
    </div>
  );
}

