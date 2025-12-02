import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import api from '../utils/axios';
import { Building2, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const MarketingDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    planId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companiesRes, plansRes] = await Promise.all([
        api.get('/marketing/companies'),
        api.get('/plans'),
      ]);
      setCompanies(companiesRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marketing/companies', companyForm);
      toast.success('Company onboarded successfully');
      setShowDialog(false);
      setCompanyForm({
        name: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        planId: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to onboard company');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Marketing Dashboard">
        <div className="text-white text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Marketing Dashboard">
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-sm p-6" data-testid="marketing-dashboard">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white font-mono tracking-wide uppercase">Companies</h3>
            <p className="text-sm text-slate-400 mt-1">Manage client onboarding and subscriptions</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                data-testid="onboard-company-button"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Onboard Company
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="font-mono tracking-wide uppercase">Onboard New Company</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Create a new company and assign the first admin user
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="companyName" className="text-slate-300">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    required
                    data-testid="company-name-input"
                    className="bg-slate-900 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="adminName" className="text-slate-300">Admin Name</Label>
                  <Input
                    id="adminName"
                    value={companyForm.adminName}
                    onChange={(e) => setCompanyForm({ ...companyForm, adminName: e.target.value })}
                    required
                    data-testid="admin-name-input"
                    className="bg-slate-900 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail" className="text-slate-300">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={companyForm.adminEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, adminEmail: e.target.value })}
                    required
                    data-testid="admin-email-input"
                    className="bg-slate-900 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="adminPassword" className="text-slate-300">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={companyForm.adminPassword}
                    onChange={(e) => setCompanyForm({ ...companyForm, adminPassword: e.target.value })}
                    required
                    data-testid="admin-password-input"
                    className="bg-slate-900 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="planId" className="text-slate-300">Subscription Plan (Optional)</Label>
                  <Select
                    value={companyForm.planId}
                    onValueChange={(value) => setCompanyForm({ ...companyForm, planId: value })}
                  >
                    <SelectTrigger
                      data-testid="plan-select"
                      className="bg-slate-900 border-slate-700 text-white mt-1"
                    >
                      <SelectValue placeholder="No plan (Expired status)" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id} className="text-white">
                          {plan.name} - ₹{plan.price.toLocaleString('en-IN')}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  data-testid="company-submit-button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Onboard Company
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-700/50">
                <TableHead className="text-slate-300 font-mono uppercase text-xs">Company Name</TableHead>
                <TableHead className="text-slate-300 font-mono uppercase text-xs">Plan</TableHead>
                <TableHead className="text-slate-300 font-mono uppercase text-xs">Status</TableHead>
                <TableHead className="text-slate-300 font-mono uppercase text-xs">Max Users</TableHead>
                <TableHead className="text-slate-300 font-mono uppercase text-xs">Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id} className="border-slate-700 hover:bg-slate-700/30">
                  <TableCell className="text-white font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {company.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    {company.subscriptionTier || 'No Plan'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        company.subscriptionStatus === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : company.subscriptionStatus === 'GracePeriod'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-rose-500/20 text-rose-500'
                      }`}
                    >
                      {company.subscriptionStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-white">{company.maxUsers}</TableCell>
                  <TableCell className="text-white font-mono text-sm">
                    {company.subscriptionExpiryDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(new Date(company.subscriptionExpiryDate), 'MMM dd, yyyy')}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MarketingDashboard;
