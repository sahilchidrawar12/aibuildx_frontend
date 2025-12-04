import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ 
  children, 
  className = '', 
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={`
        relative
        bg-white/95 
        backdrop-blur-[20px]
        rounded-3xl 
        p-10 
        shadow-xl
        border border-white/20
        transition-all duration-300
        hover:-translate-y-0.5
        hover:shadow-2xl
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
