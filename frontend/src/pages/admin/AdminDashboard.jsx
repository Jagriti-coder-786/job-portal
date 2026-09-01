import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Briefcase, Activity, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCompanies, setRecentCompanies] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Using existing endpoints to get counts
        const [statsRes, usersRes, companiesRes] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers({ limit: 5, sort: 'newest' }),
          adminService.getCompanies({ limit: 5, sort: 'newest' })
        ]);
        
        setStats(statsRes.data.data);
        setRecentUsers(usersRes.data.data.users);
        setRecentCompanies(companiesRes.data.data.companies);
      } catch (err) {
        console.error('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary-500" />
          Admin Control Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Overview of platform activity, users, and companies.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Seekers" value={stats?.users?.seekers || 0} icon={Users} color="bg-blue-500" link="/admin/users" />
        <StatCard title="Total Recruiters" value={stats?.users?.recruiters || 0} icon={UserCheck} color="bg-purple-500" link="/admin/recruiters" />
        <StatCard title="Companies" value={stats?.companies?.total || 0} icon={Building2} color="bg-emerald-500" link="/admin/companies" />
        <StatCard title="Active Jobs" value={stats?.jobs?.active || 0} icon={Briefcase} color="bg-amber-500" link="/admin/jobs" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Recent Companies */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Companies</h2>
            <Link to="/admin/companies" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentCompanies.map(company => (
              <div key={company._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    {company.logo ? (
                      <img src={company.logo} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building2 className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{company.name}</h3>
                    <p className="text-xs text-slate-500">{company.industry}</p>
                  </div>
                </div>
                <Badge variant={company.status === 'approved' ? 'success' : company.status === 'pending' ? 'warning' : 'danger'}>
                  {company.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Users */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Users</h2>
            <Link to="/admin/users" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentUsers.map(user => (
              <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="font-bold text-slate-500">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{user.name}</h3>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <Badge variant={user.role === 'recruiter' ? 'purple' : 'info'}>
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

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
          Manage <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </Card>
  );
}

