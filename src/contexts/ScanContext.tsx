import React, { createContext, useContext, useState, useEffect } from 'react';

interface Scan {
  _id: string;
  name: string;
  target: string;
  time: string;
  status: 'pending' | 'completed' | 'failed';
}

interface ScanContextType {
  scans: Scan[];
  refreshScans: () => Promise<void>;
  startScan: (target: string, name: string) => Promise<string | null>;
  getScanResults: (scanId: string) => Promise<any>;
  deleteScan: (scanId: string) => Promise<boolean>;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const useScan = () => {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scans, setScans] = useState<Scan[]>([]);

  const refreshScans = async () => {
    try {
      const response = await fetch('http://localhost:5000/all-scans');
      const data = await response.json();
      setScans(data);
    } catch (error) {
      console.error('Error fetching scans:', error);
    }
  };

  const startScan = async (target: string, name: string): Promise<string | null> => {
    try {
      const response = await fetch('http://localhost:5000/start-active-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target }),
      });

      const data = await response.json();
      
      if (data.scan_id) {
        // Save scan metadata
        await fetch('http://localhost:5000/save-scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            target,
            Time: new Date().toISOString(),
            status: 'pending',
            scan_id: data.scan_id,
          }),
        });

        await refreshScans();
        return data.scan_id;
      }
      return null;
    } catch (error) {
      console.error('Error starting scan:', error);
      return null;
    }
  };

  const getScanResults = async (scanId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/scan-results/${scanId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching scan results:', error);
      return null;
    }
  };

  const deleteScan = async (scanId: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/delete-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scan_id: scanId }),
      });

      if (response.ok) {
        await refreshScans();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting scan:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshScans();
  }, []);

  return (
    <ScanContext.Provider value={{ scans, refreshScans, startScan, getScanResults, deleteScan }}>
      {children}
    </ScanContext.Provider>
  );
};