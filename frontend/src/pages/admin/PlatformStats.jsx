import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Line } from 'recharts';
import { Activity, TrendingUp, Users, Briefcase, Filter, Search, Award, Building2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export default function PlatformStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { error } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStats();
      setStats(res.data.data);
    } catch (err) {
      error('Failed to load platform analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <LoadingSpinner size="lg" />;

  // Prepare Funnel Data
  const funnelData = [
    { name: 'Applied', value: stats.funnel.applied, fill: '#64748b' },
    { name: 'Under Review', value: stats.funnel.underReview, fill: '#3b82f6' },
    { name: 'Shortlisted', value: stats.funnel.shortlisted, fill: '#8b5cf6' },
    { name: 'Hired', value: stats.funnel.hired, fill: '#10b981' },
  ];

  // Merge activity timelines by date for a combined chart
  const timelineMap = {};
  [...stats.activityTimeline.users, ...stats.activityTimeline.jobs, ...stats.activityTimeline.applications].forEach(item => {
    if (!timelineMap[item._id]) {
      timelineMap[item._id] = { date: item._id, users: 0, jobs: 0, applications: 0 };
    }
  });
  stats.activityTimeline.users.forEach(item => timelineMap[item._id].users = item.count);
  stats.activityTimeline.jobs.forEach(item => timelineMap[item._id].jobs = item.count);
  stats.activityTimeline.applications.forEach(item => timelineMap[item._id].applications = item.count);
  const combinedTimeline = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Platform Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Deep insights into job board performance, user activity, and hiring trends.</p>
      </div>

      {/* High-level Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.overview.totalUsers + stats.overview.totalRecruiters}</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium">Active Jobs</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.overview.activeJobs}</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium">Total Applications</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.overview.totalApplications}</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800">
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">Conversion Rate</p>
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{stats.funnel.conversionRate}%</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Activity Timeline */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Activity (Last 30 Days)</h3>
              <p className="text-sm text-slate-500">Users, Jobs, and Applications volume</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => { const d = new Date(val); return `${d.getMonth()+1}/${d.getDate()}` }}
                />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Area yAxisId="left" type="monotone" dataKey="applications" name="Applications" fill="#e0e7ff" stroke="#6366f1" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="users" name="New Users" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="jobs" name="New Jobs" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Application Funnel */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Application Funnel</h3>
              <p className="text-sm text-slate-500">Overall conversion pipeline</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Filter className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {funnelData.map((stage, idx) => (
              <div key={stage.name} className="relative">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{stage.name}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{stage.value}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${stats.funnel.applied > 0 ? (stage.value / stats.funnel.applied) * 100 : 0}%`,
                      backgroundColor: stage.fill
                    }}
                  ></div>
                </div>
                {idx < funnelData.length - 1 && (
                  <div className="absolute -bottom-5 right-0 text-xs text-slate-400 font-medium">
                    {stage.value > 0 ? `↓ ${Math.round((funnelData[idx+1].value / stage.value) * 100)}%` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Top Skills */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Top Demanded Skills</h3>
          </div>
          <div className="space-y-3">
            {stats.topSkills.map((skill, i) => (
              <div key={skill._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-400 w-4">{i + 1}.</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{skill._id}</span>
                </div>
                <Badge variant="outline">{skill.count}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Categories */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Top Categories</h3>
          </div>
          <div className="space-y-3">
            {stats.jobsByCategory.map((cat, i) => (
              <div key={cat._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 truncate pr-2">
                  <span className="text-sm font-bold text-slate-400 w-4">{i + 1}.</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{cat._id}</span>
                </div>
                <Badge variant="outline">{cat.count}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Searched Keywords */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Top Searches</h3>
          </div>
          <div className="space-y-3">
            {stats.topSearches.map((search, i) => (
              <div key={search._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 truncate pr-2">
                  <span className="text-sm font-bold text-slate-400 w-4">{i + 1}.</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{search._id}</span>
                </div>
                <span className="text-xs text-slate-500">{search.count}x</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Companies */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-green-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Top Companies</h3>
          </div>
          <div className="space-y-3">
            {stats.topCompanies.map((company, i) => (
              <div key={company._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 truncate pr-2">
                  <span className="text-sm font-bold text-slate-400 w-4">{i + 1}.</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{company.name}</span>
                </div>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{company.count} jobs</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
