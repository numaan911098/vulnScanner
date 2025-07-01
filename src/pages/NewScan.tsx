import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Play, Globe, Shield, Zap, Search } from 'lucide-react';
import { useScan } from '../contexts/ScanContext';

const NewScan: React.FC = () => {
  const [target, setTarget] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { startScan } = useScan();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const scanId = await startScan(target, name);
      if (scanId) {
        navigate(`/scan/${scanId}`);
      }
    } catch (error) {
      console.error('Error starting scan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scanTypes = [
    {
      icon: Globe,
      title: 'Web Application Scan',
      description: 'Comprehensive security assessment of web applications with real-time monitoring',
      features: ['Port scanning', 'Technology detection', 'WordPress analysis', 'Subdomain enumeration', 'Live console output']
    },
    {
      icon: Shield,
      title: 'Network Security Scan',
      description: 'Deep network infrastructure security analysis with progress tracking',
      features: ['Service detection', 'Vulnerability assessment', 'Configuration review', 'Security hardening', 'System monitoring']
    },
    {
      icon: Zap,
      title: 'Quick Security Check',
      description: 'Fast security overview with instant feedback and debugging capabilities',
      features: ['Basic port scan', 'Service identification', 'Common vulnerabilities', 'Quick reporting', 'Error tracking']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6"
        >
          <Target className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
          Start New Security Scan
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Launch a comprehensive security assessment with real-time monitoring, live console output, 
          and advanced debugging capabilities
        </p>
      </div>

      {/* Scan Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/60"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Scan Configuration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Scan Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production Website Scan"
                className="w-full px-4 py-3 bg-white/80 border border-slate-200/60 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-slate-700 mb-2">
                Target URL/Domain
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="url"
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200/60 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Starting Scan...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-3" />
                  Start Security Scan
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Enhanced Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/60"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">🚀 New Real-time Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">📺</span>
            </div>
            <h4 className="font-medium text-slate-900">Live Console</h4>
            <p className="text-sm text-slate-600">Real-time command output</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">📊</span>
            </div>
            <h4 className="font-medium text-slate-900">Progress Tracking</h4>
            <p className="text-sm text-slate-600">Dynamic progress bars</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">🔧</span>
            </div>
            <h4 className="font-medium text-slate-900">System Monitor</h4>
            <p className="text-sm text-slate-600">Resource usage tracking</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">🐛</span>
            </div>
            <h4 className="font-medium text-slate-900">Debug Logs</h4>
            <p className="text-sm text-slate-600">Advanced error tracking</p>
          </div>
        </div>
      </motion.div>

      {/* Scan Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scanTypes.map((scanType, index) => {
          const Icon = scanType.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">{scanType.title}</h3>
              </div>
              
              <p className="text-slate-600 mb-4">{scanType.description}</p>
              
              <ul className="space-y-2">
                {scanType.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6"
      >
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-amber-600 mt-1 mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Security & Compliance Notice</h3>
            <p className="text-amber-800 text-sm leading-relaxed">
              Only scan systems you own or have explicit permission to test. Unauthorized scanning may violate 
              terms of service and applicable laws. All scan data is encrypted and stored securely in compliance 
              with industry standards. Real-time monitoring ensures complete transparency of all operations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewScan;