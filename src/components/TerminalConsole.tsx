import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Copy, 
  Search, 
  Download, 
  Trash2, 
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'OUTPUT';
  message: string;
  command?: string;
  scan_id: string;
}

interface TerminalConsoleProps {
  logs: LogEntry[];
  isConnected: boolean;
  onClear: () => void;
  onExport: () => void;
  className?: string;
}

const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  logs,
  isConnected,
  onClear,
  onExport,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Filter logs based on search term and type
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.command && log.command.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'ALL' || log.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'ERROR':
        return 'text-red-400';
      case 'WARNING':
        return 'text-yellow-400';
      case 'SUCCESS':
        return 'text-green-400';
      case 'INFO':
        return 'text-blue-400';
      case 'OUTPUT':
        return 'text-gray-300';
      default:
        return 'text-gray-300';
    }
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'ERROR':
        return '❌';
      case 'WARNING':
        return '⚠️';
      case 'SUCCESS':
        return '✅';
      case 'INFO':
        return 'ℹ️';
      case 'OUTPUT':
        return '📄';
      default:
        return '•';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const copyAllLogs = () => {
    const allLogsText = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.type}: ${log.message}${log.command ? ` (${log.command})` : ''}`
    ).join('\n');
    copyToClipboard(allLogsText);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-green-400" />
            <h3 className="text-white font-semibold">Security Scanner Console</h3>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Controls */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="ALL">All Types</option>
                  <option value="INFO">Info</option>
                  <option value="SUCCESS">Success</option>
                  <option value="WARNING">Warning</option>
                  <option value="ERROR">Error</option>
                  <option value="OUTPUT">Output</option>
                </select>

                {/* Auto-scroll toggle */}
                <label className="flex items-center space-x-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500/50"
                  />
                  <span>Auto-scroll</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyAllLogs}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Copy all logs"
                >
                  <Copy className="h-4 w-4" />
                </button>
                
                <button
                  onClick={onExport}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Export logs"
                >
                  <Download className="h-4 w-4" />
                </button>
                
                <button
                  onClick={onClear}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Clear logs"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
              <span>Total: {logs.length}</span>
              <span>Filtered: {filteredLogs.length}</span>
              <span>Errors: {logs.filter(l => l.type === 'ERROR').length}</span>
              <span>Warnings: {logs.filter(l => l.type === 'WARNING').length}</span>
            </div>
          </div>

          {/* Terminal Content */}
          <div 
            ref={terminalRef}
            className="h-96 overflow-y-auto bg-gray-900 font-mono text-sm"
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
              const isAtBottom = scrollHeight - scrollTop === clientHeight;
              setAutoScroll(isAtBottom);
            }}
          >
            <div className="p-4 space-y-1">
              {filteredLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  {logs.length === 0 ? 'No logs yet...' : 'No logs match your filter criteria'}
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-start space-x-3 py-1 px-2 rounded hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <span className="text-gray-500 text-xs mt-0.5 w-20 flex-shrink-0">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    
                    <span className="text-xs mt-0.5 w-4 flex-shrink-0">
                      {getLogTypeIcon(log.type)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`${getLogTypeColor(log.type)} break-words`}>
                        {log.message}
                      </div>
                      
                      {log.command && (
                        <div className="text-gray-500 text-xs mt-1 italic">
                          Command: {log.command}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => copyToClipboard(log.message)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-white transition-all duration-200"
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))
              )}
              <div ref={endRef} />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TerminalConsole;