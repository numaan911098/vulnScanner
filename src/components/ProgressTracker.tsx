import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Zap, 
  Pause, 
  Square, 
  Play,
  Activity,
  TrendingUp
} from 'lucide-react';

interface ProgressData {
  scan_id: string;
  timestamp: string;
  progress: number;
  current_phase: string;
  phase_progress: number;
  estimated_time_remaining: number;
  scan_speed: number;
  elapsed_time: number;
}

interface ProgressTrackerProps {
  progress: ProgressData | null;
  isConnected: boolean;
  onPause?: () => void;
  onCancel?: () => void;
  onResume?: () => void;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  isConnected,
  onPause,
  onCancel,
  onResume,
  className = ''
}) => {
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const getPhaseColor = (progress: number) => {
    if (progress < 25) return 'from-red-500 to-orange-500';
    if (progress < 50) return 'from-orange-500 to-yellow-500';
    if (progress < 75) return 'from-yellow-500 to-blue-500';
    return 'from-blue-500 to-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Scan Progress</h3>
            <p className="text-sm text-slate-600">
              {isConnected ? 'Real-time monitoring' : 'Disconnected'}
            </p>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center space-x-2">
          {onPause && (
            <button
              onClick={onPause}
              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
              title="Pause scan"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}
          
          {onResume && (
            <button
              onClick={onResume}
              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              title="Resume scan"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Cancel scan"
            >
              <Square className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {progress ? (
        <div className="space-y-6">
          {/* Main Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Progress</span>
              <span className="text-sm font-semibold text-slate-900">{progress.progress.toFixed(1)}%</span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getPhaseColor(progress.progress)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Current Phase */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Current Phase</span>
              <span className="text-sm font-semibold text-slate-900">{progress.phase_progress.toFixed(1)}%</span>
            </div>
            
            <h4 className="text-lg font-semibold text-slate-900 mb-2">{progress.current_phase}</h4>
            
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.phase_progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <Clock className="h-5 w-5 text-slate-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-slate-900">
                {formatTime(progress.elapsed_time)}
              </div>
              <div className="text-xs text-slate-600">Elapsed</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <Clock className="h-5 w-5 text-slate-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-slate-900">
                {progress.estimated_time_remaining > 0 
                  ? formatTime(progress.estimated_time_remaining)
                  : 'Calculating...'
                }
              </div>
              <div className="text-xs text-slate-600">Remaining</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <Zap className="h-5 w-5 text-slate-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-slate-900">
                {progress.scan_speed.toFixed(1)}%/s
              </div>
              <div className="text-xs text-slate-600">Speed</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <TrendingUp className="h-5 w-5 text-slate-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-slate-900">
                {progress.progress > 0 
                  ? Math.round((progress.elapsed_time / progress.progress) * 100)
                  : 0
                }s
              </div>
              <div className="text-xs text-slate-600">ETA Total</div>
            </div>
          </div>

          {/* Phase Timeline */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-slate-700 mb-3">Scan Phases</h5>
            
            {[
              { name: 'Network Discovery', weight: 25 },
              { name: 'Web Technology Detection', weight: 20 },
              { name: 'WordPress Analysis', weight: 30 },
              { name: 'Subdomain Enumeration', weight: 25 }
            ].map((phase, index) => {
              const phaseProgress = Math.max(0, Math.min(100, 
                (progress.progress - (index * 25)) / (phase.weight / 100)
              ));
              
              const isActive = progress.current_phase === phase.name;
              const isCompleted = progress.progress > (index + 1) * 25;
              
              return (
                <div key={phase.name} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isActive 
                        ? 'bg-blue-500 animate-pulse' 
                        : 'bg-slate-300'
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        isActive ? 'font-semibold text-slate-900' : 'text-slate-600'
                      }`}>
                        {phase.name}
                      </span>
                      
                      {isActive && (
                        <span className="text-xs text-slate-500">
                          {phaseProgress.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    
                    {isActive && (
                      <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${phaseProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Scan</h3>
          <p className="text-slate-500">Start a new scan to see real-time progress</p>
        </div>
      )}
    </motion.div>
  );
};

export default ProgressTracker;