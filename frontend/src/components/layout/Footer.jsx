import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Job<span className="text-primary-400">Portal</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Your gateway to amazing career opportunities. Connect with top companies and find your dream job.
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">For Seekers</h4>
            <ul className="space-y-2">
              <FooterLink to="/jobs">Browse Jobs</FooterLink>
              <FooterLink to="/companies">Companies</FooterLink>
              <FooterLink to="/register">Create Account</FooterLink>
              <FooterLink to="/seeker/dashboard">Dashboard</FooterLink>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">For Recruiters</h4>
            <ul className="space-y-2">
              <FooterLink to="/register">Post a Job</FooterLink>
              <FooterLink to="/recruiter/dashboard">Dashboard</FooterLink>
              <FooterLink to="/recruiter/company">Profile</FooterLink>
              <FooterLink to="/recruiter/analytics">Analytics</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-white text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <FooterLink to="#">Help Center</FooterLink>
              <FooterLink to="#">Privacy Policy</FooterLink>
              <FooterLink to="#">Terms of Service</FooterLink>
              <FooterLink to="#">Contact Us</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Made with ❤️ By Jagriti For developer Community
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon: Icon }) {
  return (
    <a href={href} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all">
      <Icon className="w-4 h-4" />
    </a>
  );
}
