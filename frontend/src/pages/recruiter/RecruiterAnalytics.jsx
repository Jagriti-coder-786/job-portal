import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Eye, MousePointerClick } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RecruiterAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from an analytics endpoint
    // For now, we use mock data to demonstrate the UI
    const timer = setTimeout(() => {
      setData({
        applicationsByJob: [
          { name: 'Senior React Dev', applicants: 45 },
          { name: 'Backend Engineer', applicants: 32 },
          { name: 'UI/UX Designer', applicants: 28 },
          { name: 'Product Manager', applicants: 15 },
        ],
        viewsOverTime: [
          { date: 'Mon', views: 120, applies: 12 },
          { date: 'Tue', views: 150, applies: 18 },
          { date: 'Wed', views: 180, applies: 24 },
          { date: 'Thu', views: 140, applies: 15 },
          { date: 'Fri', views: 210, applies: 35 },
          { date: 'Sat', views: 90, applies: 8 },
          { date: 'Sun', views: 110, applies: 10 },
        ],
        applicantStatus: [
          { name: 'Applied', value: 45 },
          { name: 'Reviewing', value: 30 },
          { name: 'Interviewing', value: 15 },
          { name: 'Hired', value: 4 },
          { name: 'Rejected', value: 26 },
        ]
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analytics Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Track the performance of your job postings and hiring pipeline.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total Views" value="1,245" trend="+12.5%" trendUp={true} icon={Eye} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-900/30" />
        <KpiCard title="Total Applicants" value="120" trend="+5.2%" trendUp={true} icon={Users} color="text-emerald-500" bg="bg-emerald-100 dark:bg-emerald-900/30" />
        <KpiCard title="Conversion Rate" value="9.6%" trend="-1.2%" trendUp={false} icon={MousePointerClick} color="text-purple-500" bg="bg-purple-100 dark:bg-purple-900/30" />
        <KpiCard title="Time to Hire" value="18 Days" trend="-2 Days" trendUp={true} icon={Activity} color="text-amber-500" bg="bg-amber-100 dark:bg-amber-900/30" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Applications by Job */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Applicants per Job Posting</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.applicationsByJob} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="applicants" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Views vs Applies over Time */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Engagement Overview (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.viewsOverTime} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey="views" name="Views" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="applies" name="Applications" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Applicant Pipeline Status */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Candidate Pipeline Distribution</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-[300px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.applicantStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.applicantStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              {data.applicantStatus.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{item.value} candidates</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, trendUp, icon: Icon, color, bg }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <Badge variant={trendUp ? 'success' : 'danger'}>{trend}</Badge>
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </Card>
  );
}

