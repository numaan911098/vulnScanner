import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Wifi,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface SystemResources {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_io: {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
  };
}

interface SystemMonitorProps {
  resources: SystemResources | null;
  onRefresh: () => void;
  className?: string;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({
  resources,
  onRefresh,
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600 bg-green-100';
    if (percentage < 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'from-green-400 to-green-600';
    if (percentage < 80) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const ResourceCard = ({ 
    icon: Icon, 
    title, 
    value, 
    percentage, 
    subtitle 
  }: {
    icon: any;
    title: string;
    value: string;
    percentage: number;
    subtitle?: string;
  }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">{title}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getUsageColor(percentage)}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="mb-2">
        <div className="text-lg font-semibold text-slate-900">{value}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2">
        <motion.div
          className={`h-full bg-gradient-to-r ${getProgressColor(percentage)} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-50/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">System Monitor</h3>
            <p className="text-sm text-slate-600">Real-time resource usage</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {resources ? (
        <div className="space-y-4">
          {/* Resource Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResourceCard
              icon={Cpu}
              title="CPU Usage"
              value={`${resources.cpu_percent.toFixed(1)}%`}
              percentage={resources.cpu_percent}
              subtitle="Processor load"
            />

            <ResourceCard
              icon={MemoryStick}
              title="Memory"
              value={`${resources.memory_percent.toFixed(1)}%`}
              percentage={resources.memory_percent}
              subtitle="RAM usage"
            />

            <ResourceCard
              icon={HardDrive}
              title="Disk Usage"
              value={`${resources.disk_percent.toFixed(1)}%`}
              percentage={resources.disk_percent}
              subtitle="Storage space"
            />

            <ResourceCard
              icon={Wifi}
              title="Network"
              value={formatBytes(resources.network_io.bytes_sent + resources.network_io.bytes_recv)}
              percentage={Math.min(100, (resources.network_io.bytes_sent + resources.network_io.bytes_recv) / 1000000 * 10)}
              subtitle="Total I/O"
            />
          </div>

          {/* Network Details */}
          {resources.network_io && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Network Activity</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Bytes Sent</div>
                  <div className="font-semibold text-slate-900">
                    {formatBytes(resources.network_io.bytes_sent)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Bytes Received</div>
                  <div className="font-semibold text-slate-900">
                    {formatBytes(resources.network_io.bytes_recv)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Packets Sent</div>
                  <div className="font-semibold text-slate-900">
                    {resources.network_io.packets_sent.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Packets Received</div>
                  <div className="font-semibold text-slate-900">
                    {resources.network_io.packets_recv.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {(resources.cpu_percent > 80 || resources.memory_percent > 80 || resources.disk_percent > 90) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900">High Resource Usage Detected</h4>
                  <div className="text-sm text-amber-800 mt-1">
                    {resources.cpu_percent > 80 && <div>• CPU usage is above 80%</div>}
                    {resources.memory_percent > 80 && <div>• Memory usage is above 80%</div>}
                    {resources.disk_percent > 90 && <div>• Disk usage is above 90%</div>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Cpu className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Resource Data</h3>
          <p className="text-slate-500 mb-4">Click refresh to load system information</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Resources
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SystemMonitor;