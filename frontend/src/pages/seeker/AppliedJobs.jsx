import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, ExternalLink } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import MessagingWidget from '../../components/messaging/MessagingWidget';
import { formatRelativeDate } from '../../utils/formatters';

export default function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [chatAppId, setChatAppId] = useState(null);
  const [chatAppName, setChatAppName] = useState('');

  const fetchApplications = async (page = 1) => {
    try {
      setLoading(true);
      const res = await applicationService.getMyApplications({ page, limit: 10 });
      setApplications(res.data.data.applications);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    const maps = {
      'applied': { variant: 'info', label: 'Applied' },
      'under-review': { variant: 'warning', label: 'Under Review' },
      'shortlisted': { variant: 'purple', label: 'Shortlisted' },
      'interview': { variant: 'primary', label: 'Interview' },
      'rejected': { variant: 'danger', label: 'Rejected' },
      'hired': { variant: 'success', label: 'Hired' }
    };
    const s = maps[status] || maps['applied'];
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Applied Jobs</h1>
        <p className="text-slate-500 dark:text-slate-400">Track the status of all your job applications.</p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app._id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {app.job?.company?.logo ? (
                    <img src={app.job.company.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                    <div>
                      <Link to={`/jobs/${app.job?._id}`} className="text-xl font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group">
                        {app.job?.title}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <Link to={`/companies/${app.job?.company?._id}`} className="text-slate-500 hover:text-primary-600 font-medium">
                        {app.job?.company?.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      {getStatusBadge(app.status)}
                      <span className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {formatRelativeDate(app.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">{app.job?.jobType}</Badge>
                    <Badge className="bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">{app.job?.location}</Badge>
                  </div>
                  
                  {app.coverLetter && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 italic mb-4">
                      " {app.coverLetter} "
                    </div>
                  )}

                  <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setChatAppId(app._id);
                        setChatAppName(app.job?.company?.name || 'Recruiter');
                      }}
                    >
                      Message Recruiter
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchApplications} />
        </div>
      ) : (
        <Card className="p-12">
          <EmptyState 
            icon={Briefcase}
            title="No applications yet"
            description="You haven't applied to any jobs. Start exploring opportunities to advance your career."
            action={() => window.location.href = '/jobs'}
            actionLabel="Find Jobs"
          />
        </Card>
      )}

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

