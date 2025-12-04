import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection = ({ 
  badge = 'Production Ready',
  title,
  subtitle,
  stats = []
}) => {
  return (
    <motion.header 
      className="text-center text-white mb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Badge */}
      <motion.div 
        className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-[10px] rounded-full text-sm font-medium mb-6"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Pulsing Dot */}
        <span 
          className="w-2 h-2 bg-emerald-500 rounded-full"
          style={{
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        {badge}
      </motion.div>

      {/* Title with Gradient */}
      <h1 
        className="text-5xl md:text-7xl font-extrabold mb-5 leading-tight"
        style={{
          background: 'linear-gradient(to right, #fff, rgba(255, 255, 255, 0.8))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10">
        {subtitle}
      </p>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="flex justify-center gap-16 flex-wrap">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-extrabold leading-none mb-2">
                {stat.value}
              </div>
              <div className="text-sm opacity-80 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.header>
  );
};

export default HeroSection;
