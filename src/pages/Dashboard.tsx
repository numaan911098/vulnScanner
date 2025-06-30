import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Activity,
  Target,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { useScan } from '../contexts/ScanContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Dashboard: React.FC = () => {
  const { scans, refreshScans, deleteScan } = useScan();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    vulnerabilities: 0
  });

  useEffect(() => {
    const total = scans.length;
    const completed = scans.filter(scan => scan.status === 'completed').length;
    const pending = scans.filter(scan => scan.status === 'pending').length;
    
    setStats({
      total,
      completed,
      pending,
      vulnerabilities: Math.floor(Math.random() * 50) + 10 // Mock data
    });
  }, [scans]);

  const handleDeleteScan = async (scanId: string) => {
    if (window.confirm('Are you sure you want to delete this scan?')) {
      await deleteScan(scanId);
    }
  };

  const pieData = [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
  ];

  const barData = [
    { name: 'Critical', value: 5, color: '#ef4444' },
    { name: 'High', value: 12, color: '#f97316' },
    { name: 'Medium', value: 18, color: '#eab308' },
    { name: 'Low', value: 8, color: '#22c55e' },
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color} mb-4`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
          <p className="text-slate-600 font-medium">{title}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <div className="flex items-center text-emerald-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm font-semibold">{trend}</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Security Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Monitor your vulnerability scans and security posture</p>
        </div>
        <Link
          to="/new-scan"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Scan
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Shield}
          title="Total Scans"
          value={stats.total}
          subtitle="All time"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="+12%"
        />
        <StatCard
          icon={CheckCircle}
          title="Completed"
          value={stats.completed}
          subtitle="Successfully finished"
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={Clock}
          title="Pending"
          value={stats.pending}
          subtitle="Currently running"
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Vulnerabilities"
          value={stats.vulnerabilities}
          subtitle="Across all scans"
          color="bg-gradient-to-br from-red-500 to-red-600"
          trend="-8%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Scan Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Vulnerability Severity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Scans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Scans</h3>
            <Link
              to="/reports"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
            >
              View all
              <FileText className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {scans.slice(0, 5).map((scan) => (
                <tr key={scan._id} className="hover:bg-slate-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-slate-400 mr-3" />
                      <span className="text-sm font-medium text-slate-900">{scan.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{scan.target}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      scan.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : scan.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {scan.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {scan.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {scan.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {scan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(scan.time).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {scan.status === 'completed' && (
                        <Link
                          to={`/scan/${scan._id}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                        >
                          View Results
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteScan(scan._id)}
                        className="text-red-600 hover:text-red-700 transition-colors duration-200 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {scans.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No scans yet</h3>
            <p className="text-slate-500 mb-4">Get started by running your first security scan</p>
            <Link
              to="/new-scan"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start First Scan
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;