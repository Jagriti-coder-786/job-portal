import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, Download, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { formatRelativeDate, formatDate } from '../../utils/formatters';

import KanbanBoard from '../../components/recruiter/KanbanBoard';
import ScheduleInterviewModal from '../../components/recruiter/ScheduleInterviewModal';
import MessagingWidget from '../../components/messaging/MessagingWidget';
import MatchScoreBreakdown from '../../components/recruiter/MatchScoreBreakdown';
import { LayoutList, LayoutGrid, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' }
];

export default function ViewApplicants() {
  const { jobId } = useParams();
  const { success, error } = useToast();
  
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('newest');
  const [updating, setUpdating] = useState(null); 
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);
  const [chatAppId, setChatAppId] = useState(null);
  const [chatAppName, setChatAppName] = useState('');

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      
      const jobRes = await jobService.getJob(jobId);
      setJob(jobRes.data.data.job);
      
      // For Kanban view, we ideally want all applications (or a very large limit)
      // Since it's a drag and drop board.
      const query = { page, limit: viewMode === 'kanban' ? 100 : 10, sort: sortFilter };
      if (statusFilter) query.status = statusFilter;
      
      const appRes = await applicationService.getJobApplicants(jobId, query);
      setApplications(appRes.data.data.applications);
      setPagination(appRes.data.data.pagination);
    } catch (err) {
      error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, statusFilter, sortFilter, viewMode]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdating(appId);
      // Wait if the Kanban board already optimistically updated
      // But here we are just syncing state for list view
      setApplications(apps => apps.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      // error handled inside KanbanBoard, or here if triggered from List View
    } finally {
      setUpdating(null);
    }
  };

  const openInterviewModal = (app) => {
    setSelectedAppForInterview(app);
    setInterviewModalOpen(true);
  };

  const getStatusColor = (status) => {
    const maps = {
      'applied': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'screening': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'under-review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'shortlisted': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'interview': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'offer': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'hired': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    };
    return maps[status] || maps['applied'];
  };

  if (loading && !job) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12 px-4 sm:px-6 lg:px-8">
      <Link to="/recruiter/my-jobs" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Jobs
      </Link>

      <Card className="p-6 mb-8 border-t-4 border-t-primary-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Applicants for "{job?.title}"
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Badge variant={job?.status === 'open' ? 'success' : 'default'}>{job?.status?.toUpperCase()}</Badge>
              <span>{job?.location}</span>
              <span>•</span>
              <span>Posted {formatDate(job?.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
            
            {viewMode === 'list' && (
              <div className="flex gap-3">
                <div className="w-48">
                  <Select 
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                    options={[
                      { value: 'newest', label: 'Newest First' },
                      { value: 'oldest', label: 'Oldest First' },
                      { value: 'matchScore', label: 'Highest Match Score' }
                    ]}
                    className="mb-0"
                  />
                </div>
                <div className="w-48">
                  <Select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: '', label: 'All Statuses' },
                      ...STATUS_OPTIONS
                    ]}
                    className="mb-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : applications.length > 0 ? (
        viewMode === 'kanban' ? (
          <KanbanBoard 
            initialApplications={applications} 
            jobId={jobId} 
            onStatusChange={handleStatusChange}
            onScheduleInterview={openInterviewModal}
          />
        ) : (
          <div className="space-y-6">
            {applications.map(app => (
              <Card key={app._id} className="p-0 overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                  
                  {/* Applicant Info */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {app.applicant?.avatar ? (
                          <img src={app.applicant.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{app.applicant?.name}</h3>
                        <p className="text-slate-500 font-medium mb-2">{app.applicant?.headline || 'No headline provided'}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {app.applicant?.email}</span>
                          {app.applicant?.phone && (
                            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {app.applicant?.phone}</span>
                          )}
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Applied {formatRelativeDate(app.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {app.applicant?.skills?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {app.applicant.skills.map(skill => (
                            <Badge key={skill} className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.coverLetter && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Cover Letter</h4>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                          {app.coverLetter}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Sidebar */}
                  <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Application Status</label>
                      <div className="relative">
                        <select 
                          className={`w-full p-2.5 rounded-lg border font-medium text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${getStatusColor(app.status)} border-transparent`}
                          value={app.status}
                          onChange={async (e) => {
                            setUpdating(app._id);
                            await applicationService.updateApplicationStatus(app._id, e.target.value);
                            handleStatusChange(app._id, e.target.value);
                          }}
                          disabled={updating === app._id}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {updating === app._id && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <LoadingSpinner size="sm" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Match Score Display */}
                    {app.matchScore !== undefined && (
                      <MatchScoreBreakdown application={app} />
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      <Button 
                        variant="outline"
                        className="w-full flex justify-center items-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        onClick={() => {
                          setChatAppId(app._id);
                          setChatAppName(app.applicant?.name);
                        }}
                      >
                        <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Message Candidate</span>
                      </Button>
                      
                      {app.status === 'interview' && (
                        <Button 
                          className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => openInterviewModal(app)}
                        >
                          <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Schedule Interview</span>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full flex justify-between items-center bg-white dark:bg-slate-800"
                        onClick={() => window.open(app.applicant?.resume, '_blank')}
                        disabled={!app.applicant?.resume}
                      >
                        <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> View Resume</span>
                      </Button>
                    </div>
                  </div>

                </div>
              </Card>
            ))}
            
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchData} />
          </div>
        )
      ) : (
        <Card className="p-12">
          <EmptyState 
            icon={User}
            title={statusFilter ? `No applicants in "${statusFilter}" status` : "No applicants yet"}
            description={statusFilter ? "Try changing your status filter." : "Once candidates apply to this job, they will appear here."}
            action={statusFilter ? () => setStatusFilter('') : undefined}
            actionLabel={statusFilter ? "Clear Filter" : undefined}
          />
        </Card>
      )}

      <ScheduleInterviewModal 
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        application={selectedAppForInterview}
        onScheduled={() => fetchData(pagination.page)}
      />

      {chatAppId && (
        <MessagingWidget 
          applicationId={chatAppId} 
          applicantName={chatAppName} 
          onClose={() => setChatAppId(null)} 
        />
      )}
    </div>
  );
}

