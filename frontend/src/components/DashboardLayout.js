import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Building2, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0A0E1A' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(19, 24, 32, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #2D3748' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)' }}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  AiBuild X
                </h1>
                <p className="text-xs text-slate-400">{user?.role}</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg border border-[#2D3748]" style={{ background: 'rgba(19, 24, 32, 0.5)' }}>
                <User className="w-4 h-4 text-[#0EA5E9]" />
                <div className="text-sm">
                  <p className="text-white font-medium">{user?.name}</p>
                  <p className="text-slate-400 text-xs">{user?.email}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                data-testid="logout-button"
                className="border-[#2D3748] text-slate-300 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg transition-all"
                style={{ background: 'rgba(19, 24, 32, 0.5)' }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
                {title}
              </h2>
              <div className="h-1 w-20 rounded-full" style={{ background: 'linear-gradient(90deg, #0EA5E9 0%, #38BDF8 100%)' }}></div>
            </div>
          )}
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;