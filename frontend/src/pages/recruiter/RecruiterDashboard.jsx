import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, FileText, Activity, ArrowRight, Building2, Eye, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { jobService } from '../../services/jobService';
import { companyService } from '../../services/companyService';
import { formatRelativeDate, formatNumber } from '../../utils/formatters';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, views: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [jobsRes, companyRes] = await Promise.all([
          jobService.getMyJobs({ limit: 4 }),
          companyService.getMyCompany()
        ]);
        
        const jobsData = jobsRes.data.data;
        setRecentJobs(jobsData.jobs);
        
        // Calculate total applicants from jobs (since the backend populates applicationsCount)
        const totalApps = jobsData.jobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0);
        
        setStats({
          activeJobs: jobsData.jobs.filter(j => j.status === 'open').length,
          totalApplicants: totalApps,
          views: Math.floor(Math.random() * 1500) + 500 // Mock data for views
        });

        if (companyRes.data.data.company) {
          setCompany(companyRes.data.data.company);
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
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Recruiter Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Overview of your active job postings and candidate pipeline.
          </p>
        </div>
        <div className="flex gap-3">
          {!company && (
            <Link to="/recruiter/company">
              <Button variant="secondary">Setup Company Profile</Button>
            </Link>
          )}
          <Link to="/recruiter/post-job">
            <Button className="shadow-lg shadow-primary-500/25">Post a New Job</Button>
          </Link>
        </div>
      </div>

      {!company && (
        <Card className="mb-8 p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-500 mb-1">Company Profile Required</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400/80">You need to set up your company profile before you can post jobs.</p>
            </div>
            <Link to="/recruiter/company">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white border-none whitespace-nowrap">
                Setup Now
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Jobs" value={stats.activeJobs} icon={Briefcase} color="bg-blue-500" />
        <StatCard title="Total Applicants" value={formatNumber(stats.totalApplicants)} icon={Users} color="bg-emerald-500" />
        <StatCard title="Profile Views" value={formatNumber(stats.views)} icon={Eye} color="bg-purple-500" />
        <StatCard title="Hired Candidates" value="0" icon={Activity} color="bg-amber-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Job Postings</h2>
              <Link to="/recruiter/my-jobs" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Manage all
              </Link>
            </div>
            
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map(job => (
                  <Card key={job._id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                    <div>
                      <Link to={`/jobs/${job._id}`} className="font-semibold text-lg text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                        {job.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                        <span>•</span>
                        <span>{job.jobType}</span>
                        <span>•</span>
                        <span>Posted {formatRelativeDate(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                      <Badge variant={job.status === 'open' ? 'success' : 'default'}>
                        {job.status.toUpperCase()}
                      </Badge>
                      <Link to={`/recruiter/jobs/${job._id}/applicants`}>
                        <Button variant="secondary" size="sm">
                          {job.applicationsCount || 0} Applicants
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No jobs posted yet</h3>
                <p className="text-slate-500 mb-6">Create your first job posting to start receiving applications.</p>
                <Link to="/recruiter/post-job"><Button>Post a Job</Button></Link>
              </Card>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {company && (
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Your Company</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {company.logo ? (
                    <img src={company.logo} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{company.name}</h4>
                  <Badge variant={company.status === 'approved' ? 'success' : 'warning'} className="mt-1">
                    {company.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                {company.description}
              </div>
              <Link to="/recruiter/company">
                <Button variant="outline" className="w-full text-sm">Edit Company Profile</Button>
              </Link>
            </Card>
          )}

          <Card className="p-6 bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-950/20 dark:to-indigo-950/20 border-primary-100 dark:border-primary-900/50">
            <h3 className="font-bold text-primary-900 dark:text-primary-100 mb-2">Need help finding candidates?</h3>
            <p className="text-sm text-primary-700/80 dark:text-primary-300 mb-4">
              Our AI matching system can help you identify the best candidates for your open positions instantly.
            </p>
            <Button className="w-full bg-primary-600 hover:bg-primary-700" size="sm">Explore AI Features</Button>
          </Card>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
    </Card>
  );
}

