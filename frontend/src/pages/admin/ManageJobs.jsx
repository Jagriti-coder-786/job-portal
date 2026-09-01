import { useState, useEffect } from 'react';
import { Briefcase, Search, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export default function ManageJobs() {
  const { success, error } = useToast();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getJobs({ page, limit: 10, search });
      setJobs(res.data.data.jobs);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error('Failed to load jobs');
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
      await adminService.deleteJob(selectedJob._id);
      success('Job deleted successfully');
      setDeleteModalOpen(false);
      fetchJobs(pagination.page);
    } catch (err) {
      error('Failed to delete job');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manage Jobs</h1>
        <p className="text-slate-500 dark:text-slate-400">View and manage all job postings on the platform.</p>
      </div>

      <Card className="p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Input 
              placeholder="Search by job title or company..." 
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-0"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : jobs.length > 0 ? (
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((job) => (
                <div key={job._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link to={`/jobs/${job._id}`} className="font-semibold text-slate-900 dark:text-white text-sm hover:text-primary-600 block truncate">
                        {job.title}
                      </Link>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{job.company?.name || 'Unknown Company'}</p>
                    </div>
                    <Badge variant={job.status === 'open' ? 'success' : 'default'} className="text-[10px] uppercase font-bold">
                      {job.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{job.jobType}</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{job.location}</span>
                    <span className="text-slate-400">Posted {formatDate(job.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Link to={`/jobs/${job._id}`}>
                      <Button variant="outline" size="sm" className="text-xs min-h-[36px] px-3 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[36px] px-3 flex items-center gap-1"
                      onClick={() => confirmDelete(job)}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Job Details</th>
                    <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Company</th>
                    <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Status</th>
                    <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <Link to={`/jobs/${job._id}`} className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                            {job.title}
                          </Link>
                          <span className="text-xs text-slate-500">{job.jobType} • {job.location}</span>
                          <span className="text-xs text-slate-400">Posted {formatDate(job.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                        {job.company?.name || 'Unknown'}
                      </td>
                      <td className="p-4">
                        <Badge variant={job.status === 'open' ? 'success' : 'default'}>
                          {job.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/jobs/${job._id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                            onClick={() => confirmDelete(job)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No jobs found.
          </div>
        )}
      </Card>

      {!loading && jobs.length > 0 && (
        <div className="mt-6">
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchJobs} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Job"
        message={`Are you sure you want to delete "${selectedJob?.title}"? This action cannot be undone.`}
        confirmText="Delete Job"
        variant="danger"
      />
    </div>
  );
}

