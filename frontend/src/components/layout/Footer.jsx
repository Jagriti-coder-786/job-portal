import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Job<span className="text-primary-400">Portal</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your gateway to amazing career opportunities. Connect with top companies and find your dream job.
            </p>

          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/jobs">Browse Jobs</FooterLink>
              <FooterLink to="/companies">Companies</FooterLink>
              <FooterLink to="/register">Create Account</FooterLink>
              <FooterLink to="/seeker/dashboard">Dashboard</FooterLink>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Recruiters</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/register">Post a Job</FooterLink>
              <FooterLink to="/recruiter/dashboard">Recruiter Dashboard</FooterLink>
              <FooterLink to="/recruiter/company">Company Profile</FooterLink>
              <FooterLink to="/recruiter/analytics">Analytics</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              <FooterLink to="#">Help Center</FooterLink>
              <FooterLink to="#">Privacy Policy</FooterLink>
              <FooterLink to="#">Terms of Service</FooterLink>
              <FooterLink to="#">Contact Us</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
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
