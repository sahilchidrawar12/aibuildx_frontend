import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { toast } from 'sonner';
import api from '../utils/axios';
import { Building2, DollarSign, Users, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    maxUsers: '',
    storageLimitGB: '',
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Marketing',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, plansRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/plans'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setPlans(plansRes.data);
      setUsers(usersRes.data.filter(u => u.role === 'Marketing' || u.role === 'SuperAdmin'));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.patch(`/admin/plans/${editingPlan.id}`, {
          price: parseFloat(planForm.price),
          maxUsers: parseInt(planForm.maxUsers),
          storageLimitGB: parseInt(planForm.storageLimitGB),
        });
        toast.success('Plan updated successfully');
      } else {
        await api.post('/admin/plans', {
          ...planForm,
          price: parseFloat(planForm.price),
          maxUsers: parseInt(planForm.maxUsers),
          storageLimitGB: parseInt(planForm.storageLimitGB),
        });
        toast.success('Plan created successfully');
      }
      setShowPlanDialog(false);
      setPlanForm({ name: '', price: '', maxUsers: '', storageLimitGB: '' });
      setEditingPlan(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', userForm);
      toast.success('User created successfully');
      setShowUserDialog(false);
      setUserForm({ name: '', email: '', password: '', role: 'Marketing' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const editPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      price: plan.price.toString(),
      maxUsers: plan.maxUsers.toString(),
      storageLimitGB: plan.storageLimitGB.toString(),
    });
    setShowPlanDialog(true);
  };

  if (loading) {
    return (
      <DashboardLayout title="Super Admin">
        <div className="text-white text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Super Admin">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" data-testid="superadmin-dashboard">
        <StatCard
          icon={Building2}
          label="Total Companies"
          value={stats?.totalCompanies || 0}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          color="amber"
        />
        <StatCard
          icon={Users}
          label="Marketing Team"
          value={users.length}
          color="rose"
        />
      </div>

      {/* Pricing Plans Management */}
      <GlassCard className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Pricing Plans</h3>
            <p className="text-sm text-gray-600 mt-1">Manage subscription tiers and pricing</p>
          </div>
          <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPlan(null);
                  setPlanForm({ name: '', price: '', maxUsers: '', storageLimitGB: '' });
                }}
                data-testid="create-plan-button"
                className="bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-gray-900">
                  {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {editingPlan
                    ? 'Update plan details. Changes apply to new subscriptions only.'
                    : 'Define a new subscription plan for clients.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePlan} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="planName" className="text-gray-700">Plan Name</Label>
                  <Input
                    id="planName"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    disabled={editingPlan}
                    required
                    data-testid="plan-name-input"
                    className="bg-gray-50 border-gray-300 text-gray-900 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="planPrice" className="text-gray-700">Price (INR)</Label>
                  <Input
                    id="planPrice"
                    type="number"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    required
                    data-testid="plan-price-input"
                    className="bg-gray-50 border-gray-300 text-gray-900 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="planMaxUsers" className="text-gray-700">Max Users</Label>
                  <Input
                    id="planMaxUsers"
                    type="number"
                    value={planForm.maxUsers}
                    onChange={(e) => setPlanForm({ ...planForm, maxUsers: e.target.value })}
                    required
                    data-testid="plan-maxusers-input"
                    className="bg-gray-50 border-gray-300 text-gray-900 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="planStorage" className="text-gray-700">Storage Limit (GB)</Label>
                  <Input
                    id="planStorage"
                    type="number"
                    value={planForm.storageLimitGB}
                    onChange={(e) => setPlanForm({ ...planForm, storageLimitGB: e.target.value })}
                    required
                    data-testid="plan-storage-input"
                    className="bg-gray-50 border-gray-300 text-gray-900 mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="plan-submit-button"
                  className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-gray-50">
                <TableHead className="text-gray-700 font-semibold">Plan Name</TableHead>
                <TableHead className="text-gray-700 font-semibold">Price</TableHead>
                <TableHead className="text-gray-700 font-semibold">Max Users</TableHead>
                <TableHead className="text-gray-700 font-semibold">Storage</TableHead>
                <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell className="text-gray-900 font-medium">{plan.name}</TableCell>
                  <TableCell className="text-gray-900 font-mono">₹{plan.price.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-gray-900">{plan.maxUsers} users</TableCell>
                  <TableCell className="text-gray-900">{plan.storageLimitGB} GB</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        plan.isActive
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : 'bg-slate-500/20 text-slate-500'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => editPlan(plan)}
                      size="sm"
                      variant="ghost"
                      data-testid={`edit-plan-${plan.id}`}
                      className="text-[#667eea] hover:text-[#764ba2] hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlassCard>

      {/* Marketing Users */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Marketing Team</h3>
            <p className="text-sm text-gray-600 mt-1">Manage marketing and admin users</p>
          </div>
          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogTrigger asChild>
              <Button
                data-testid="create-user-button"
                className="bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Create New User</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Add a new marketing team member or admin
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="userName" className="text-gray-700">Name</Label>
                  <Input
                    id="userName"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    required
                    data-testid="user-name-input"
                    className="bg-gray-50 border-gray-300 text-gray-900 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail" className="text-gray-700">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                    data-testid="user-email-input"
                    className="bg-gray-50 border-gray-300 text-gray-900 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="userPassword" className="text-gray-700">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                    data-testid="user-password-input"
                    className="bg-gray-50 border-gray-300 text-gray-900 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="userRole" className="text-gray-700">Role</Label>
                  <select
                    id="userRole"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    data-testid="user-role-select"
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 mt-1"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="SuperAdmin">Super Admin</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  data-testid="user-submit-button"
                  className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white"
                >
                  Create User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-gray-50">
                <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                <TableHead className="text-gray-700 font-semibold">Email</TableHead>
                <TableHead className="text-gray-700 font-semibold">Role</TableHead>
                <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell className="text-gray-900 font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-900 font-mono text-sm">{user.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-[#667eea]/20 text-[#667eea] rounded text-xs font-medium">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDeleteUser(user.id)}
                      size="sm"
                      variant="ghost"
                      data-testid={`delete-user-${user.id}`}
                      className="text-rose-500 hover:text-rose-600 hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;