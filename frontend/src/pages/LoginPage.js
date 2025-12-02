import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import WireframeBackground from '../components/WireframeBackground';
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #131820 100%)' }}>
      <WireframeBackground />
      
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
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)' }}>
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                AiBuild X
              </h1>
            </motion.div>
            <p className="text-slate-400 text-sm">
              Structural Engineering Automation Platform
            </p>
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="glass p-8 rounded-xl shadow-xl"
            style={{ background: 'rgba(19, 24, 32, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(45, 55, 72, 0.8)' }}
          >
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">
              Sign In
            </h2>
            <p className="text-slate-400 text-sm mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@aibuildx.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="login-email-input"
                    className="pl-10 bg-[#0A0E1A] border-[#2D3748] text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] rounded-lg h-12 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="login-password-input"
                    className="pl-10 bg-[#0A0E1A] border-[#2D3748] text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] rounded-lg h-12 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full font-medium h-12 rounded-lg transition-all duration-200 text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)' }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-[#2D3748]">
              <p className="text-xs text-slate-400 mb-3 font-medium tracking-wide">Test Credentials</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#0A0E1A] p-3 rounded-lg border border-[#2D3748]">
                  <p className="text-[#0EA5E9] mb-1 font-semibold">Super Admin</p>
                  <p className="text-slate-300 font-mono text-[10px]">admin@aibuildx.com</p>
                  <p className="text-slate-400 font-mono text-[10px]">admin123</p>
                </div>
                <div className="bg-[#0A0E1A] p-3 rounded-lg border border-[#2D3748]">
                  <p className="text-[#0EA5E9] mb-1 font-semibold">Marketing</p>
                  <p className="text-slate-300 font-mono text-[10px] truncate">marketing@aibuildx.com</p>
                  <p className="text-slate-400 font-mono text-[10px]">marketing123</p>
                </div>
                <div className="bg-[#0A0E1A] p-3 rounded-lg border border-[#2D3748]">
                  <p className="text-[#0EA5E9] mb-1 font-semibold">Client Admin</p>
                  <p className="text-slate-300 font-mono text-[10px]">john@techstruct.com</p>
                  <p className="text-slate-400 font-mono text-[10px]">john123</p>
                </div>
                <div className="bg-[#0A0E1A] p-3 rounded-lg border border-[#2D3748]">
                  <p className="text-[#0EA5E9] mb-1 font-semibold">Engineer</p>
                  <p className="text-slate-300 font-mono text-[10px]">jane@techstruct.com</p>
                  <p className="text-slate-400 font-mono text-[10px]">jane123</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-xs mt-6">
            © 2025 AiBuild X. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;