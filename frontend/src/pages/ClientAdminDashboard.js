import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
import { useAuth } from '../context/AuthContext';
import { Users, FolderOpen, CreditCard, Plus, Check, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const ClientAdminDashboard = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
    loadRazorpayScript();
  }, [user]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchData = async () => {
    if (!user?.companyId) return;

    try {
      const [companyRes, usersRes, projectsRes, transactionsRes, plansRes] = await Promise.all([
        api.get(`/companies/${user.companyId}`),
        api.get(`/companies/${user.companyId}/users`),
        api.get('/projects'),
        api.get('/transactions'),
        api.get('/plans'),
      ]);
      setCompany(companyRes.data);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
      setTransactions(transactionsRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (users.length >= company.maxUsers) {
      toast.error('User limit reached. Please upgrade your plan.');
      return;
    }

    try {
      await api.post(`/companies/${user.companyId}/users`, {
        ...userForm,
        role: 'ClientEngineer',
      });
      toast.success('User added successfully');
      setShowUserDialog(false);
      setUserForm({ name: '', email: '', password: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add user');
    }
  };

  const handleSubscribe = async (planId) => {
    setProcessingPayment(true);

    try {
      const orderRes = await api.post('/subscriptions/create-order', { planId });
      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'AiBuild X',
        description: 'Subscription Payment',
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/subscriptions/verify-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful! Subscription activated.');
            fetchData();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#2563EB',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="text-white text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }

  const isSubscriptionExpired = company?.subscriptionStatus === 'Expired';
  const canAddUsers = users.length < company?.maxUsers;

  return (
    <DashboardLayout title="Admin Dashboard">
      <div data-testid="clientadmin-dashboard">
        {/* Subscription Alert */}
        {isSubscriptionExpired && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/20 border border-rose-500 rounded-sm p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-rose-500" />
              <div>
                <p className="text-rose-500 font-medium">Subscription Expired</p>
                <p className="text-sm text-rose-400">Please renew your subscription to create projects and upload files.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Team Members"
            value={`${users.length}/${company?.maxUsers || 0}`}
            color="blue"
          />
          <StatCard
            icon={FolderOpen}
            label="Total Projects"
            value={projects.length}
            color="emerald"
          />
          <StatCard
            icon={CreditCard}
            label="Active Plan"
            value={company?.subscriptionTier || 'No Plan'}
            color="amber"
          />
        </div>

        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger
              value="team"
              data-testid="team-tab"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Team Management
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              data-testid="subscription-tab"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Subscription
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              data-testid="projects-tab"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              data-testid="billing-tab"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Team Management */}
          <TabsContent value="team">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-mono tracking-wide uppercase">Team Members</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {users.length} of {company?.maxUsers} seats used
                  </p>
                </div>
                <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!canAddUsers}
                      data-testid="add-user-button"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Engineer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                      <DialogTitle className="font-mono tracking-wide uppercase">Add Engineer</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Create a new team member account
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddUser} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="engineerName" className="text-slate-300">Name</Label>
                        <Input
                          id="engineerName"
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          required
                          data-testid="engineer-name-input"
                          className="bg-slate-900 border-slate-700 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="engineerEmail" className="text-slate-300">Email</Label>
                        <Input
                          id="engineerEmail"
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          required
                          data-testid="engineer-email-input"
                          className="bg-slate-900 border-slate-700 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="engineerPassword" className="text-slate-300">Password</Label>
                        <Input
                          id="engineerPassword"
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          required
                          data-testid="engineer-password-input"
                          className="bg-slate-900 border-slate-700 text-white mt-1"
                        />
                      </div>
                      <Button
                        type="submit"
                        data-testid="engineer-submit-button"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Add Engineer
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300 font-mono uppercase text-xs">Name</TableHead>
                    <TableHead className="text-slate-300 font-mono uppercase text-xs">Email</TableHead>
                    <TableHead className="text-slate-300 font-mono uppercase text-xs">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((member) => (
                    <TableRow key={member.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="text-white font-medium">{member.name}</TableCell>
                      <TableCell className="text-white font-mono text-sm">{member.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-xs font-medium">
                          {member.role}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Subscription */}
          <TabsContent value="subscription">
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-sm p-6">
                <h3 className="text-xl font-bold text-white font-mono tracking-wide uppercase mb-4">Current Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Plan Name</p>
                    <p className="text-white text-lg font-medium mt-1">
                      {company?.subscriptionTier || 'No Active Plan'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium mt-1 ${
                        company?.subscriptionStatus === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : 'bg-rose-500/20 text-rose-500'
                      }`}
                    >
                      {company?.subscriptionStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Max Users</p>
                    <p className="text-white text-lg font-medium mt-1">{company?.maxUsers}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Expiry Date</p>
                    <p className="text-white text-lg font-medium mt-1">
                      {company?.subscriptionExpiryDate
                        ? format(new Date(company.subscriptionExpiryDate), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Plans */}
              <div>
                <h3 className="text-xl font-bold text-white font-mono tracking-wide uppercase mb-4">
                  {isSubscriptionExpired ? 'Choose a Plan' : 'Upgrade Plan'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-slate-800/50 backdrop-blur-md border rounded-sm p-6 ${
                        company?.subscriptionTier === plan.name
                          ? 'border-blue-600 ring-2 ring-blue-600/50'
                          : 'border-slate-700'
                      }`}
                    >
                      <h4 className="text-2xl font-bold text-white font-mono mb-2">{plan.name}</h4>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-white font-mono">₹{plan.price.toLocaleString('en-IN')}</span>
                        <span className="text-slate-400 text-sm">/month</span>
                      </div>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm">{plan.maxUsers} Users</span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm">{plan.storageLimitGB} GB Storage</span>
                        </li>
                      </ul>
                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={processingPayment || company?.subscriptionTier === plan.name}
                        data-testid={`subscribe-${plan.name.toLowerCase()}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-sm disabled:opacity-50"
                      >
                        {company?.subscriptionTier === plan.name ? 'Current Plan' : 'Subscribe'}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-sm p-6">
              <h3 className="text-xl font-bold text-white font-mono tracking-wide uppercase mb-6">Company Projects</h3>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No projects yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300 font-mono uppercase text-xs">Project</TableHead>
                      <TableHead className="text-slate-300 font-mono uppercase text-xs">Location</TableHead>
                      <TableHead className="text-slate-300 font-mono uppercase text-xs">Type</TableHead>
                      <TableHead className="text-slate-300 font-mono uppercase text-xs">Status</TableHead>
                      <TableHead className="text-slate-300 font-mono uppercase text-xs">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="text-white font-medium">{project.title}</TableCell>
                        <TableCell className="text-white">{project.location}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs font-mono">
                            {project.drawingType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              project.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : project.status === 'Processing'
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'bg-blue-500/20 text-blue-500'
                            }`}
                          >
                            {project.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-white text-sm font-mono">
                          {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-sm p-6">
              <h3 className="text-xl font-bold text-white font-mono tracking-wide uppercase mb-6">Invoice History</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No transactions yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300 font-mono uppercase text-xs">Date</TableHead>
                      <TableHead className="text-slate-300 font-mono uppercase text-xs">Plan</TableHead>
                      <TableHead className="text-slate-300 font-mono uppercase text-xs">Amount</TableHead>
                      <TableHead className="text-slate-300 font-mono uppercase text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="text-white font-mono text-sm">
                          {format(new Date(txn.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-white">{txn.planSnapshot.name}</TableCell>
                        <TableCell className="text-white font-mono">
                          ₹{txn.amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              txn.status === 'Paid'
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : txn.status === 'Failed'
                                ? 'bg-rose-500/20 text-rose-500'
                                : 'bg-amber-500/20 text-amber-500'
                            }`}
                          >
                            {txn.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientAdminDashboard;
