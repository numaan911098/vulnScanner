import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download,
  RefreshCw,
  Globe,
  Server,
  Users,
  Palette,
  Bug,
  ArrowLeft,
  Terminal,
  Activity
} from 'lucide-react';
import { useScan } from '../contexts/ScanContext';
import { useWebSocket } from '../hooks/useWebSocket';
import TerminalConsole from '../components/TerminalConsole';
import ProgressTracker from '../components/ProgressTracker';
import SystemMonitor from '../components/SystemMonitor';

const ScanResults: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const { getScanResults } = useScan();
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'console' | 'monitor'>('console');

  const {
    isConnected,
    logs,
    progress,
    error: wsError,
    systemResources,
    joinScan,
    requestSystemResources,
    clearLogs,
    clearError
  } = useWebSocket(scanId);

  useEffect(() => {
    if (scanId) {
      joinScan(scanId);
      requestSystemResources();
    }
  }, [scanId]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!scanId) return;
      
      try {
        const data = await getScanResults(scanId);
        if (data.status === 'pending') {
          // Poll for results every 5 seconds if still pending
          setTimeout(fetchResults, 5000);
        } else {
          setResults(data);
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch scan results');
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [scanId, getScanResults]);

  const downloadReport = async () => {
    if (!scanId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/report/${scanId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `scan-report-${scanId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const exportLogs = async () => {
    if (!scanId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/export-logs/${scanId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `scan-logs-${scanId}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const cancelScan = async () => {
    if (!scanId) return;
    
    try {
      await fetch(`http://localhost:5000/cancel-scan/${scanId}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error cancelling scan:', error);
    }
  };

  const ResultSection = ({ title, icon: Icon, data, color = 'blue' }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden"
    >
      <div className={`p-6 bg-gradient-to-r from-${color}-500 to-${color}-600 text-white`}>
        <div className="flex items-center">
          <Icon className="h-6 w-6 mr-3" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm opacity-90 mt-1">{data?.res || 'Analysis complete'}</p>
      </div>
      
      {data?.data?.dataRows && data.data.dataRows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr>
                {data.data.headings.map((heading: string, index: number) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {data.data.dataRows.map((row: any[], rowIndex: number) => (
                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors duration-200">
                  {row.map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {typeof cell === 'object' && Array.isArray(cell) ? (
                        <div className="space-y-1">
                          {cell.map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {typeof item === 'object' ? JSON.stringify(item) : item}
                            </div>
                          ))}
                        </div>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 rounded-xl transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Real-time Scan Monitor
            </h1>
            <p className="text-slate-600 mt-1">Live security analysis with detailed logging</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <button
            onClick={downloadReport}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100/80 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'console'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Live Console</span>
        </button>
        
        <button
          onClick={() => setActiveTab('monitor')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'monitor'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>System Monitor</span>
        </button>
        
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'results'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Results</span>
        </button>
      </div>

      {/* Progress Tracker - Always visible */}
      <ProgressTracker
        progress={progress}
        isConnected={isConnected}
        onCancel={cancelScan}
      />

      {/* Tab Content */}
      {activeTab === 'console' && (
        <div className="space-y-6">
          <TerminalConsole
            logs={logs}
            isConnected={isConnected}
            onClear={clearLogs}
            onExport={exportLogs}
          />
          
          {wsError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-900">Scan Error</h4>
                  <p className="text-sm text-red-800 mt-1">{wsError.error}</p>
                  {wsError.stack_trace && (
                    <details className="mt-2">
                      <summary className="text-sm text-red-700 cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded overflow-x-auto">
                        {wsError.stack_trace}
                      </pre>
                    </details>
                  )}
                  <button
                    onClick={clearError}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === 'monitor' && (
        <SystemMonitor
          resources={systemResources}
          onRefresh={requestSystemResources}
        />
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/60 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Scan in Progress</h2>
              <p className="text-slate-600">Please wait while we analyze your target...</p>
            </div>
          ) : error || !results ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/60 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Results</h2>
              <p className="text-slate-600">{error || 'Unable to load scan results'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.nmap && (
                <ResultSection
                  title="Network Ports"
                  icon={Server}
                  data={results.nmap}
                  color="blue"
                />
              )}

              {results.whatweb && (
                <ResultSection
                  title="Web Technology"
                  icon={Globe}
                  data={results.whatweb}
                  color="indigo"
                />
              )}

              {results.general && (
                <ResultSection
                  title="General Information"
                  icon={Shield}
                  data={results.general}
                  color="purple"
                />
              )}

              {results.vulnerabilities && (
                <ResultSection
                  title="Vulnerabilities"
                  icon={Bug}
                  data={results.vulnerabilities}
                  color="red"
                />
              )}

              {results.users && (
                <ResultSection
                  title="Users Found"
                  icon={Users}
                  data={results.users}
                  color="orange"
                />
              )}

              {results.themes && (
                <ResultSection
                  title="Themes Analysis"
                  icon={Palette}
                  data={results.themes}
                  color="pink"
                />
              )}

              {results.subdomains && (
                <ResultSection
                  title="Subdomains"
                  icon={Globe}
                  data={results.subdomains}
                  color="teal"
                />
              )}

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200/60"
              >
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                  <h3 className="text-lg font-semibold text-slate-900">Scan Complete</h3>
                </div>
                <p className="text-slate-600 mb-4">
                  Security analysis has been completed successfully. Review the findings above and download 
                  the detailed PDF report for comprehensive documentation.
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Scan ID: {scanId}</span>
                  <span>•</span>
                  <span>Generated: {new Date().toLocaleString()}</span>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanResults;