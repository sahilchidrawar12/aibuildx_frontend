import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => {
  const colorConfig = {
    blue: { bg: 'rgba(14, 165, 233, 0.1)', text: '#0EA5E9', border: 'rgba(14, 165, 233, 0.3)' },
    emerald: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
    amber: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
    rose: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl p-6 h-full border shadow-lg"
      style={{ 
        background: 'rgba(19, 24, 32, 0.7)', 
        backdropFilter: 'blur(16px)',
        borderColor: '#2D3748'
      }}
    >
      <div className="flex items-start justify-between">
        <div 
          className="p-3 rounded-lg"
          style={{ background: config.bg, border: `1px solid ${config.border}` }}
        >
          <Icon className="w-6 h-6" style={{ color: config.text }} />
        </div>
        {trend && (
          <span 
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ 
              background: trend > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: trend > 0 ? '#10B981' : '#EF4444'
            }}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-5">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;