import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
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
import { useAuth } from '../context/AuthContext';
import { FolderOpen, Plus, Upload, Calendar, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

const ClientEngineerDashboard = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [projectForm, setProjectForm] = useState({
    title: '',
    location: '',
    drawingType: 'PDF',
    file: null,
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.companyId) return;

    try {
      const [companyRes, projectsRes] = await Promise.all([
        api.get(`/companies/${user.companyId}`),
        api.get('/projects'),
      ]);
      setCompany(companyRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const extension = file.name.split('.').pop().toUpperCase();
      if (extension === 'PDF' || extension === 'DWG') {
        setProjectForm({
          ...projectForm,
          file,
          drawingType: extension,
        });
      } else {
        toast.error('Only PDF and DWG files are allowed');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/vnd.dwg': ['.dwg'],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (company?.subscriptionStatus === 'Expired') {
      toast.error('Subscription expired. Please contact your admin to renew.');
      return;
    }

    if (!projectForm.file) {
      toast.error('Please upload a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', projectForm.file);
    formData.append('title', projectForm.title);
    formData.append('location', projectForm.location);
    formData.append('drawingType', projectForm.drawingType);

    try {
      await api.post('/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Project created successfully');
      setShowDialog(false);
      setProjectForm({ title: '', location: '', drawingType: 'PDF', file: null });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create project');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Engineer Dashboard">
        <div className="text-white text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }

  const isSubscriptionExpired = company?.subscriptionStatus === 'Expired';

  return (
    <DashboardLayout title="Engineer Dashboard">
      <div data-testid="clientengineer-dashboard">
        {/* Subscription Alert */}
        {isSubscriptionExpired && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/20 border border-rose-500 rounded-sm p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-rose-500" />
              <div>
                <p className="text-rose-500 font-medium">Subscription Expired</p>
                <p className="text-sm text-rose-400">Cannot create projects or upload files. Please contact your admin.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Subscription Info Card */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-sm p-6 mb-8">
          <h3 className="text-xl font-bold text-white font-mono tracking-wide uppercase mb-4">Subscription Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Current Plan</p>
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
              <p className="text-slate-400 text-sm">Expiry Date</p>
              <p className="text-white text-lg font-medium mt-1">
                {company?.subscriptionExpiryDate
                  ? format(new Date(company.subscriptionExpiryDate), 'MMM dd, yyyy')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={FolderOpen}
            label="Total Projects"
            value={projects.length}
            color="blue"
          />
          <StatCard
            icon={Upload}
            label="Uploaded"
            value={projects.filter(p => p.status === 'Uploaded').length}
            color="emerald"
          />
          <StatCard
            icon={FileText}
            label="Completed"
            value={projects.filter(p => p.status === 'Completed').length}
            color="amber"
          />
        </div>

        {/* Projects Section */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white font-mono tracking-wide uppercase">Projects</h3>
              <p className="text-sm text-slate-400 mt-1">All company projects are visible to you</p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button
                  disabled={isSubscriptionExpired}
                  data-testid="create-project-button"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-mono tracking-wide uppercase">Create New Project</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Upload drawings and create a new engineering project
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="projectTitle" className="text-slate-300">Project Title</Label>
                    <Input
                      id="projectTitle"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      required
                      data-testid="project-title-input"
                      placeholder="e.g., City Tower Construction"
                      className="bg-slate-900 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectLocation" className="text-slate-300">Location</Label>
                    <Input
                      id="projectLocation"
                      value={projectForm.location}
                      onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                      required
                      data-testid="project-location-input"
                      placeholder="e.g., Mumbai, Maharashtra"
                      className="bg-slate-900 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Upload Drawing (PDF/DWG)</Label>
                    <div
                      {...getRootProps()}
                      data-testid="file-dropzone"
                      className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all ${
                        isDragActive
                          ? 'border-blue-600 bg-blue-600/10'
                          : 'border-slate-700 bg-slate-900/50 hover:border-blue-600/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      {projectForm.file ? (
                        <div>
                          <p className="text-white font-medium">{projectForm.file.name}</p>
                          <p className="text-slate-400 text-sm mt-1">
                            {(projectForm.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-white font-medium">
                            {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
                          </p>
                          <p className="text-slate-400 text-sm mt-1">PDF or DWG files only</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={uploading || !projectForm.file}
                    data-testid="project-submit-button"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {uploading ? 'Uploading...' : 'Create Project'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-20 h-20 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No projects yet</p>
              <p className="text-slate-500 text-sm">Create your first project to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-slate-900/50 border border-slate-700 rounded-sm p-6 hover:border-blue-600/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-2">{project.title}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-mono">{project.drawingType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        project.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : project.status === 'Processing'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-blue-500/20 text-blue-500'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientEngineerDashboard;
