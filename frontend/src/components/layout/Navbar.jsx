import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, ChevronDown, Briefcase, LayoutDashboard, Settings, Bookmark, FileText, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import Badge from '../ui/Badge';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout, isSeeker, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isRecruiter) return '/recruiter/dashboard';
    return '/seeker/dashboard';
  };

  const isScrolled = useScrollPosition();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Job<span className="gradient-text">Portal</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/jobs" active={location.pathname === '/jobs'}>{t('nav.findJobs')}</NavLink>
            <NavLink to="/companies" active={location.pathname.startsWith('/companies')}>{t('nav.companies')}</NavLink>
            {isAuthenticated && (
              <NavLink to={getDashboardPath()} active={location.pathname.includes('dashboard')}>{t('nav.dashboard')}</NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Toggle Language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{i18n.language}</span>
            </button>
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to={isSeeker ? '/seeker/notifications' : getDashboardPath()}
                  className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-medium">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 animate-slide-down">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-medium text-slate-900 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                        <Badge variant="primary" className="mt-1">{user?.role}</Badge>
                      </div>
                      <div className="py-1">
                        <DropdownItem to={getDashboardPath()} icon={LayoutDashboard}>Dashboard</DropdownItem>
                        {isSeeker && (
                          <>
                            <DropdownItem to="/seeker/profile" icon={User}>My Profile</DropdownItem>
                            <DropdownItem to="/seeker/applied-jobs" icon={FileText}>Applied Jobs</DropdownItem>
                            <DropdownItem to="/seeker/saved-jobs" icon={Bookmark}>Saved Jobs</DropdownItem>
                          </>
                        )}
                        {isRecruiter && (
                          <>
                            <DropdownItem to="/recruiter/company" icon={Settings}>Company Profile</DropdownItem>
                            <DropdownItem to="/recruiter/my-jobs" icon={Briefcase}>My Jobs</DropdownItem>
                          </>
                        )}
                        <DropdownItem to={isSeeker ? '/seeker/change-password' : isRecruiter ? '/recruiter/dashboard' : '/admin/dashboard'} icon={Settings}>Settings</DropdownItem>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">{t('nav.signIn')}</Link>
                <Link to="/register" className="btn-primary text-sm">{t('nav.signUp')}</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
            >
              <Globe className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            <MobileNavLink to="/jobs">{t('nav.findJobs')}</MobileNavLink>
            <MobileNavLink to="/companies">{t('nav.companies')}</MobileNavLink>
            {isAuthenticated ? (
              <>
                <MobileNavLink to={getDashboardPath()}>{t('nav.dashboard')}</MobileNavLink>
                {isSeeker && (
                  <>
                    <MobileNavLink to="/seeker/profile">Profile</MobileNavLink>
                    <MobileNavLink to="/seeker/applied-jobs">Applied Jobs</MobileNavLink>
                    <MobileNavLink to="/seeker/saved-jobs">Saved Jobs</MobileNavLink>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary flex-1 text-center text-sm">{t('nav.signIn')}</Link>
                <Link to="/register" className="btn-primary flex-1 text-center text-sm">{t('nav.signUp')}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30'
          : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-900'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children }) {
  return (
    <Link to={to} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      {children}
    </Link>
  );
}

function DropdownItem({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <Icon className="w-4 h-4 text-slate-400" />
      {children}
    </Link>
  );
}

function useScrollPosition() {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return isScrolled;
}
