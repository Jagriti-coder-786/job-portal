import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Users, Eye, EyeOff, Trash2, Search, MapPin } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { jobService } from '../../services/jobService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatRelativeDate } from '../../utils/formatters';

export default function MyJobs() {
  const { success, error } = useToast();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  
  const [search, setSearch] = useState('');
  
  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await jobService.getMyJobs({ page, limit: 10, search });
      setJobs(res.data.data.jobs);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const confirmDelete = (job) => {
    setSelectedJob(job);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await jobService.deleteJob(selectedJob._id);
      success('Job deleted successfully');
      setDeleteModalOpen(false);
      fetchJobs(pagination.page);
    } catch (err) {
      error('Failed to delete job');
    }
  };

  const confirmStatusToggle = (job) => {
    setSelectedJob(job);
    setStatusModalOpen(true);
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = selectedJob.status === 'open' ? 'closed' : 'open';
      await jobService.updateJob(selectedJob._id, { status: newStatus });
      success(`Job marked as ${newStatus}`);
      setStatusModalOpen(false);
      
      // Update local state
      setJobs(jobs.map(j => j._id === selectedJob._id ? { ...j, status: newStatus } : j));
    } catch (err) {
      error('Failed to update job status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">My Job Postings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your active and closed job listings.</p>
        </div>
        <Link to="/recruiter/post-job">
          <Button><Plus className="w-4 h-4 mr-2" /> Post New Job</Button>
        </Link>
      </div>

      <Card className="p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Input 
              placeholder="Search by job title..." 
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-0"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </Card>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : jobs.length > 0 ? (
        <div className="space-y-4 mb-6">
          {jobs.map(job => (
            <Card key={job._id} className="p-5 flex flex-col md:flex-row gap-6 md:items-center hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Link to={`/jobs/${job._id}`} className="text-xl font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 truncate">
                    {job.title}
                  </Link>
                  <Badge variant={job.status === 'open' ? 'success' : 'default'} className="shrink-0">
                    {job.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span>{job.jobType}</span>
                  <span>{job.experienceLevel}</span>
                  <span>Posted {formatRelativeDate(job.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap items-center gap-3 shrink-0">
                <Link to={`/recruiter/jobs/${job._id}/applicants`} className="w-full md:w-auto">
                  <Button variant="secondary" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    {job.applicationsCount || 0} Applicants
                  </Button>
                </Link>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Link to={`/recruiter/edit-job/${job._id}`} className="flex-1 md:flex-none">
                    <Button variant="outline" className="w-full p-2" aria-label="Edit">
                      <Edit2 className="w-4 h-4 text-slate-500" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="flex-1 md:flex-none p-2"
                    onClick={() => confirmStatusToggle(job)}
                    aria-label={job.status === 'open' ? 'Close job' : 'Reopen job'}
                  >
                    {job.status === 'open' ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 md:flex-none p-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    onClick={() => confirmDelete(job)}
                    aria-label="Delete job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchJobs} />
        </div>
      ) : (
        <Card className="p-12">
          <EmptyState 
            icon={Briefcase}
            title={search ? "No jobs match your search" : "No jobs posted yet"}
            description={search ? "Try adjusting your search terms." : "Create your first job posting to start receiving applications."}
            action={search ? () => { setSearch(''); fetchJobs(1); } : () => window.location.href = '/recruiter/post-job'}
            actionLabel={search ? "Clear Search" : "Post a Job"}
          />
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Job Posting"
        message={`Are you sure you want to delete "${selectedJob?.title}"? This will also remove all associated applications. This action cannot be undone.`}
        confirmText="Delete Job"
        variant="danger"
      />

      {/* Status Toggle Modal */}
      <ConfirmDialog
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusToggle}
        title={selectedJob?.status === 'open' ? 'Close Job Posting' : 'Reopen Job Posting'}
        message={selectedJob?.status === 'open' 
          ? `Are you sure you want to close "${selectedJob?.title}"? It will no longer be visible to job seekers, but you can still view its applicants.`
          : `Are you sure you want to reopen "${selectedJob?.title}"? Job seekers will be able to find and apply to it again.`
        }
        confirmText={selectedJob?.status === 'open' ? 'Close Job' : 'Reopen Job'}
        variant="warning"
      />
    </div>
  );
}

