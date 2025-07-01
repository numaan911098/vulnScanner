import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface LogEntry {
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'OUTPUT';
  message: string;
  command?: string;
  scan_id: string;
}

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

interface ErrorData {
  scan_id: string;
  timestamp: string;
  error: string;
  stack_trace?: string;
}

interface SystemResources {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_io: any;
}

export const useWebSocket = (scanId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [error, setError] = useState<ErrorData | null>(null);
  const [systemResources, setSystemResources] = useState<SystemResources | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Scan event handlers
    newSocket.on('scan_log', (logEntry: LogEntry) => {
      setLogs(prevLogs => [...prevLogs, logEntry]);
    });

    newSocket.on('scan_progress', (progressData: ProgressData) => {
      setProgress(progressData);
    });

    newSocket.on('scan_error', (errorData: ErrorData) => {
      setError(errorData);
    });

    newSocket.on('system_resources', (resources: SystemResources) => {
      setSystemResources(resources);
    });

    // Join scan room if scanId is provided
    if (scanId) {
      newSocket.emit('join_scan', { scan_id: scanId });
    }

    return () => {
      if (scanId) {
        newSocket.emit('leave_scan', { scan_id: scanId });
      }
      newSocket.close();
    };
  }, [scanId]);

  const joinScan = (newScanId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_scan', { scan_id: newScanId });
      // Clear previous logs when joining a new scan
      setLogs([]);
      setProgress(null);
      setError(null);
    }
  };

  const leaveScan = (oldScanId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_scan', { scan_id: oldScanId });
    }
  };

  const requestSystemResources = () => {
    if (socketRef.current) {
      socketRef.current.emit('request_system_resources');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    socket,
    isConnected,
    logs,
    progress,
    error,
    systemResources,
    joinScan,
    leaveScan,
    requestSystemResources,
    clearLogs,
    clearError
  };
};