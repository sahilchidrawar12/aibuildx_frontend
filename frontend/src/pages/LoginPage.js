import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import BackgroundAnimation from '../components/BackgroundAnimation';
import GlassCard from '../components/GlassCard';
import { toast } from 'sonner';
import { Lock, Mail, Building2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-3 mb-4"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                AiBuild X
              </h1>
            </motion.div>
            <p className="text-white/90 text-sm">
              Structural Engineering Automation Platform
            </p>
          </div>

          {/* Login Card */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
              Sign In
            </h2>
            <p className="text-gray-600 text-sm mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@aibuildx.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="login-email-input"
                    className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] rounded-lg h-12 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="login-password-input"
                    className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] rounded-lg h-12 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full font-medium h-12 rounded-lg transition-all duration-200 text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-3 font-medium tracking-wide">Test Credentials</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-[#667eea] mb-1 font-semibold">Super Admin</p>
                  <p className="text-gray-700 font-mono text-[10px]">admin@aibuildx.com</p>
                  <p className="text-gray-500 font-mono text-[10px]">admin123</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-[#667eea] mb-1 font-semibold">Marketing</p>
                  <p className="text-gray-700 font-mono text-[10px] truncate">marketing@aibuildx.com</p>
                  <p className="text-gray-500 font-mono text-[10px]">marketing123</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-[#667eea] mb-1 font-semibold">Client Admin</p>
                  <p className="text-gray-700 font-mono text-[10px]">john@techstruct.com</p>
                  <p className="text-gray-500 font-mono text-[10px]">john123</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-[#667eea] mb-1 font-semibold">Engineer</p>
                  <p className="text-gray-700 font-mono text-[10px]">jane@techstruct.com</p>
                  <p className="text-gray-500 font-mono text-[10px]">jane123</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Footer */}
          <p className="text-center text-white/80 text-xs mt-6">
            © 2025 AiBuild X. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;