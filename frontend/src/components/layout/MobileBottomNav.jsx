import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Building2, 
  User, 
  LogIn, 
  FileText, 
  Bell, 
  PlusCircle, 
  LayoutDashboard, 
  Users, 
  BarChart3 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function MobileBottomNav() {
  const { user, isAuthenticated, isSeeker, isRecruiter, isAdmin } = useAuth();

  const getNavTabs = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', to: '/', icon: Home, exact: true },
        { label: 'Jobs', to: '/jobs', icon: Briefcase },
        { label: 'Companies', to: '/companies', icon: Building2 },
        { label: 'Sign In', to: '/login', icon: LogIn },
      ];
    }

    if (isAdmin) {
      return [
        { label: 'Home', to: '/', icon: Home, exact: true },
        { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Users', to: '/admin/users', icon: Users },
        { label: 'Jobs', to: '/admin/jobs', icon: Briefcase },
        { label: 'Stats', to: '/admin/stats', icon: BarChart3 },
      ];
    }

    if (isRecruiter) {
      return [
        { label: 'Home', to: '/', icon: Home, exact: true },
        { label: 'Dashboard', to: '/recruiter/dashboard', icon: LayoutDashboard },
        { label: 'Post Job', to: '/recruiter/post-job', icon: PlusCircle, highlight: true },
        { label: 'My Jobs', to: '/recruiter/my-jobs', icon: Briefcase },
        { label: 'Company', to: '/recruiter/company', icon: Building2 },
      ];
    }

    // Default: Job Seeker
    return [
      { label: 'Home', to: '/', icon: Home, exact: true },
      { label: 'Jobs', to: '/jobs', icon: Briefcase },
      { label: 'Applied', to: '/seeker/applied-jobs', icon: FileText },
      { label: 'Alerts', to: '/seeker/alerts', icon: Bell },
      { label: 'Profile', to: '/seeker/profile', icon: User },
    ];
  };

  const tabs = getNavTabs();

  return (
    <nav 
      aria-label="Mobile navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] pb-[max(env(safe-area-inset-bottom),0.35rem)]"
    >
      <div className="flex items-center justify-around h-14 px-1 max-w-md mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exact}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 select-none
              ${tab.highlight ? 'relative -top-2' : ''}
              ${isActive 
                ? 'text-primary-600 dark:text-primary-400 font-semibold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {tab.highlight ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/40 active:scale-95 transition-transform mb-0.5">
                    <tab.icon className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="relative">
                    <tab.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full" />
                    )}
                  </div>
                )}
                <span className={`text-[10px] leading-tight tracking-tight mt-0.5 ${tab.highlight ? 'font-bold text-primary-600 dark:text-primary-400' : ''}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
