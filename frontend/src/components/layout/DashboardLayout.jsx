import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard, User, Briefcase, FileText, Bookmark, Bell,
  Settings, LogOut, Building2, PlusCircle, Users, BarChart3,
  ChevronLeft, Menu, Shield, Activity
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout, isSeeker, isRecruiter, isAdmin } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getNavItems = () => {
    if (isAdmin) return [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { label: 'Manage Users', icon: Users, path: '/admin/users' },
      { label: 'Manage Recruiters', icon: User, path: '/admin/recruiters' },
      { label: 'Manage Companies', icon: Building2, path: '/admin/companies' },
      { label: 'Manage Jobs', icon: Briefcase, path: '/admin/jobs' },
      { label: 'Statistics', icon: BarChart3, path: '/admin/stats' },
    ];

    if (isRecruiter) return [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/recruiter/dashboard' },
      { label: 'Company Profile', icon: Building2, path: '/recruiter/company' },
      { label: 'Post Job', icon: PlusCircle, path: '/recruiter/post-job' },
      { label: 'My Jobs', icon: Briefcase, path: '/recruiter/my-jobs' },
      { label: 'Analytics', icon: BarChart3, path: '/recruiter/analytics' },
    ];

    return [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/seeker/dashboard' },
      { label: 'My Profile', icon: User, path: '/seeker/profile' },
      { label: 'Applied Jobs', icon: FileText, path: '/seeker/applied-jobs' },
      { label: 'Saved Jobs', icon: Bookmark, path: '/seeker/saved-jobs' },
      { label: 'Job Alerts', icon: Activity, path: '/seeker/alerts' },
      { label: 'Notifications', icon: Bell, path: '/seeker/notifications' },
      { label: 'Settings', icon: Settings, path: '/seeker/change-password' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 ${collapsed ? 'w-[70px]' : 'w-64'} hidden lg:block`}>
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center justify-between p-4 h-16 border-b border-slate-200 dark:border-slate-800">
            {!collapsed && (
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Job<span className="text-primary-500">Portal</span>
                </span>
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            {!collapsed && (
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                {!collapsed && 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">Job<span className="text-primary-500">Portal</span></span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 z-50 w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 lg:hidden animate-slide-down">
            <div className="flex items-center justify-between p-4 h-14 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <nav className="py-4 px-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className={`transition-all duration-300 ${collapsed ? 'lg:ml-[70px]' : 'lg:ml-64'} pt-14 lg:pt-0`}>
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
