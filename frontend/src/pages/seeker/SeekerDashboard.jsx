import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Bookmark, FileText, Bell, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import JobCard from '../../components/jobs/JobCard';
import { applicationService } from '../../services/applicationService';
import { savedJobService } from '../../services/savedJobService';
import { notificationService } from '../../services/notificationService';
import { jobService } from '../../services/jobService';
import { formatRelativeDate } from '../../utils/formatters';

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ applied: 0, saved: 0, unread: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app with dedicated dashboard endpoints this would be fewer calls
        const [appRes, savedRes, notifRes, recRes] = await Promise.all([
          applicationService.getMyApplications({ limit: 3 }),
          savedJobService.getSavedJobs({ limit: 3 }),
          notificationService.getNotifications({ unreadOnly: true }),
          jobService.getRecommendedJobs(3)
        ]);

        setStats({
          applied: appRes.data.data.pagination.total,
          saved: savedRes.data.data.pagination.total,
          unread: notifRes.data.data.pagination.total
        });

        setRecentApplications(appRes.data.data.applications);
        
        if (recRes.data.data.jobs) {
          setRecommendedJobs(recRes.data.data.jobs);
        }
      } catch (err) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {user?.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Here is what is happening with your job applications today.
        </p>
      </div>

      {!user?.resume && (
        <Card className="mb-8 p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-500 mb-1">Your profile is incomplete</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400/80">Upload a resume to start applying for jobs and let employers find you.</p>
            </div>
            <Link to="/seeker/profile">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white border-none whitespace-nowrap">
                Update Profile
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Applied Jobs" 
          value={stats.applied} 
          icon={FileText} 
          color="bg-blue-500" 
          link="/seeker/applied-jobs" 
        />
        <StatCard 
          title="Saved Jobs" 
          value={stats.saved} 
          icon={Bookmark} 
          color="bg-purple-500" 
          link="/seeker/saved-jobs" 
        />
        <StatCard 
          title="Unread Alerts" 
          value={stats.unread} 
          icon={Bell} 
          color="bg-emerald-500" 
          link="/seeker/notifications" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Applications</h2>
              <Link to="/seeker/applied-jobs" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                View all
              </Link>
            </div>
            
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map(app => (
                  <Card key={app._id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        {app.job?.company?.logo ? (
                          <img src={app.job.company.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <Briefcase className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <Link to={`/jobs/${app.job?._id}`} className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          {app.job?.title}
                        </Link>
                        <p className="text-sm text-slate-500">{app.job?.company?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                        ${app.status === 'applied' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${app.status === 'under-review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                        ${app.status === 'shortlisted' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                        ${app.status === 'interview' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}
                        ${app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${app.status === 'hired' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                      `}>
                        {app.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">
                        Applied {formatRelativeDate(app.createdAt)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-slate-500">
                You haven't applied to any jobs yet.
                <div className="mt-4">
                  <Link to="/jobs"><Button>Browse Jobs</Button></Link>
                </div>
              </Card>
            )}
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recommended for you</h2>
            </div>
            
            {recommendedJobs.length > 0 ? (
              <div className="space-y-4">
                {recommendedJobs.map(job => (
                  <div key={job._id} className="transform scale-[0.98] origin-left">
                    <JobCard job={job} isSaved={true} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-sm text-slate-500">
                Complete your profile to get personalized job recommendations.
              </Card>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, link }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-${color.split('-')[1]}-500/30`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Link to={link} className="flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          View Details <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </Card>
  );
}
