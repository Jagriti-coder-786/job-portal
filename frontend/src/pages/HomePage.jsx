import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Briefcase, Users, Building2, TrendingUp, ArrowRight,
  Star, CheckCircle, Zap, Target, Code2, Palette,
  HeartPulse, BarChart3, Megaphone, Database, Cpu, Package, Globe,
  DollarSign, Award, Rocket, GraduationCap, LineChart, Filter, Sparkles,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { jobService } from '../services/jobService';
import { companyService } from '../services/companyService';
import { formatSalary, formatRelativeDate } from '../utils/formatters';
import useInView from '../hooks/useInView';
import useCountUp from '../hooks/useCountUp';

/* ── CountUp Stat ── */
function CountUpStat({ value, suffix = '', label, icon: Icon, color, isActive }) {
  const count = useCountUp(value, 2000, 0, isActive);
  return (
    <div className="flex flex-col items-center p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{count.toLocaleString()}{suffix}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

/* ── Typewriter ── */
function Typewriter({ words, speed = 110, pause = 2200 }) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    let t;
    if (!deleting && charIdx < word.length) t = setTimeout(() => setCharIdx(c => c + 1), speed);
    else if (!deleting && charIdx === word.length) t = setTimeout(() => setDeleting(true), pause);
    else if (deleting && charIdx > 0) t = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    else { setDeleting(false); setWordIdx(i => (i + 1) % words.length); }
    setDisplayed(word.slice(0, charIdx));
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return (
    <span className="gradient-text-gold">{displayed}<span className="animate-pulse">|</span></span>
  );
}

/* ── Featured Job Card ── */
function FeaturedJobCard({ job }) {
  return (
    <Link to={`/jobs/${job._id}`} className="group block h-full">
      <div className="h-full p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center flex-shrink-0">
            {job.company?.logo
              ? <img src={job.company.logo} alt="" className="w-9 h-9 rounded-lg object-cover" />
              : <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate text-sm">{job.title}</h3>
            <p className="text-xs text-slate-500 truncate">{job.company?.name}</p>
          </div>
          {job.salary && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg whitespace-nowrap">{formatSalary(job.salary)}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium capitalize">{job.jobType || job.type}</span>
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs capitalize">{job.workMode}</span>
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs capitalize">{job.experienceLevel}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
          <span>{formatRelativeDate(job.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Skeleton ── */
function JobCardSkeleton() {
  return (
    <div className="h-full p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-start gap-3 mb-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 rounded w-3/4" />
          <div className="skeleton h-3 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="skeleton h-5 rounded-md w-16" />
        <div className="skeleton h-5 rounded-md w-14" />
        <div className="skeleton h-5 rounded-md w-12" />
      </div>
      <div className="skeleton h-px rounded w-full mb-3 mt-auto" />
      <div className="flex justify-between">
        <div className="skeleton h-3 rounded w-24" />
        <div className="skeleton h-3 rounded w-16" />
      </div>
    </div>
  );
}

/* ── Company Card ── */
function CompanyCard({ company }) {
  return (
    <Link to="/companies" className="group block">
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          {company.logo
            ? <img src={company.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
            : <Building2 className="w-8 h-8 text-slate-400" />}
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 truncate">{company.name}</h3>
        <p className="text-xs text-slate-500 mb-3 truncate">{company.industry || company.location || 'Technology'}</p>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium">
          <Briefcase className="w-3 h-3" />Hiring
        </span>
      </div>
    </Link>
  );
}

/* ════════════════ MAIN ════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('seeker');
  const [statsRef, statsInView] = useInView({ threshold: 0.2 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [jobsRes, companiesRes] = await Promise.allSettled([
        jobService.getJobs({ limit: 6, sort: 'newest' }),
        companyService.getCompanies({ limit: 6 }),
      ]);
      if (jobsRes.status === 'fulfilled') setFeaturedJobs(jobsRes.value.data.data.jobs || []);
      if (companiesRes.status === 'fulfilled') setTopCompanies(companiesRes.value.data.data.companies || []);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (searchLocation) params.set('location', searchLocation);
    if (workMode) params.set('workMode', workMode);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000" />

        {/* Floating cards – desktop only */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="absolute top-24 left-14 glass-card rounded-2xl p-3 animate-float animation-delay-200">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-400" /></div>
              <div><p className="text-xs font-semibold">New Offer!</p><p className="text-[10px] text-white/60">React Developer</p></div>
            </div>
          </div>
          <div className="absolute top-40 right-14 glass-card rounded-2xl p-3 animate-float animation-delay-600">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center"><Users className="w-4 h-4 text-blue-400" /></div>
              <div><p className="text-xs font-semibold">+120 Applicants</p><p className="text-[10px] text-white/60">This week</p></div>
            </div>
          </div>
          <div className="absolute bottom-52 left-14 glass-card rounded-2xl p-3 animate-float animation-delay-1000">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center"><Star className="w-4 h-4 text-amber-400" /></div>
              <div><p className="text-xs font-semibold">95% Match</p><p className="text-[10px] text-white/60">AI Powered</p></div>
            </div>
          </div>
          <div className="absolute bottom-52 right-14 glass-card rounded-2xl p-3 animate-float animation-delay-800">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-pink-500/30 flex items-center justify-center"><DollarSign className="w-4 h-4 text-pink-400" /></div>
              <div><p className="text-xs font-semibold">$120k+ Avg</p><p className="text-[10px] text-white/60">Salary</p></div>
            </div>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-white/90 text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI-Powered Job Matching — Find your perfect role
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-5 animate-fade-in-up">
            Find Your Dream<br />
            <span className="my-2 block min-h-[1.2em]">
              <Typewriter words={['React Developer', 'Data Scientist', 'UI/UX Designer', 'DevOps Engineer', 'Product Manager', 'ML Engineer']} />
            </span>
            <span className="text-white/90 text-4xl sm:text-5xl lg:text-6xl">Role Today</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200 leading-relaxed">
            Connect with thousands of top companies. AI matches you to opportunities that fit your skills, experience, and goals.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto animate-fade-in-up animation-delay-300" role="search" aria-label="Job search">
            <div className="glass-card rounded-2xl p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <label htmlFor="hero-search" className="sr-only">Job title, skills, or company</label>
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl border border-white/10 hover:border-white/25 transition-colors">
                  <Search className="w-5 h-5 text-white/50 flex-shrink-0" aria-hidden="true" />
                  <input
                    id="hero-search"
                    type="text"
                    placeholder="Job title, skills, or company..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full text-white placeholder-white/40 focus:outline-none bg-transparent text-sm"
                  />
                </div>
                <label htmlFor="hero-location" className="sr-only">Location</label>
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl border border-white/10 hover:border-white/25 transition-colors">
                  <MapPin className="w-5 h-5 text-white/50 flex-shrink-0" aria-hidden="true" />
                  <input
                    id="hero-location"
                    type="text"
                    placeholder="City, state, or remote..."
                    value={searchLocation}
                    onChange={e => setSearchLocation(e.target.value)}
                    className="w-full text-white placeholder-white/40 focus:outline-none bg-transparent text-sm"
                  />
                </div>
                <label htmlFor="hero-workmode" className="sr-only">Work mode</label>
                <div className="sm:w-36 flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl border border-white/10 hover:border-white/25 transition-colors">
                  <Filter className="w-4 h-4 text-white/50 flex-shrink-0" aria-hidden="true" />
                  <select
                    id="hero-workmode"
                    value={workMode}
                    onChange={e => setWorkMode(e.target.value)}
                    className="w-full text-white bg-transparent focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="" className="text-slate-900">Any Mode</option>
                    <option value="remote" className="text-slate-900">Remote</option>
                    <option value="hybrid" className="text-slate-900">Hybrid</option>
                    <option value="on-site" className="text-slate-900">On-Site</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-400 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" /> Search Jobs
                </button>
              </div>
            </div>
          </form>

          {/* Popular tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 animate-fade-in animation-delay-400">
            <span className="text-white/50 text-sm">Popular:</span>
            {['React', 'Python', 'Remote', 'Node.js', 'Data Science', 'UI/UX'].map(tag => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-1 glass-card text-white/80 text-xs rounded-full hover:bg-white/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 mt-14 animate-fade-in animation-delay-600">
            {[{v:'10K+',l:'Active Jobs'},{v:'5K+',l:'Companies'},{v:'50K+',l:'Job Seekers'},{v:'95%',l:'Success Rate'}].map((s,i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">{s.v}</p>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 40L80 35C160 30 320 20 480 25C640 30 800 50 960 55C1120 60 1280 45 1360 37L1440 30V80H0V40Z" className="fill-white dark:fill-slate-950" />
          </svg>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-semibold mb-4">
              <Briefcase className="w-3.5 h-3.5" /> BROWSE BY CATEGORY
            </div>
            <h2 id="categories-heading" className="section-heading">Popular Job Categories</h2>
            <p className="section-subheading mx-auto">Explore opportunities across industries where talent meets opportunity.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.name}
                to={`/jobs?category=${encodeURIComponent(cat.value || cat.name)}`}
                className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <cat.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{cat.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.count} open roles</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/jobs" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all">
              View all categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED JOBS ═══ */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/50" aria-labelledby="jobs-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold mb-3">
                <Zap className="w-3.5 h-3.5" /> LIVE OPPORTUNITIES
              </div>
              <h2 id="jobs-heading" className="section-heading">Featured Jobs</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Latest from top companies, updated in real time.</p>
            </div>
            <Link
              to="/jobs"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:border-primary-400 hover:text-primary-600 transition-all text-sm font-medium flex-shrink-0"
            >
              View All Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array(6).fill(0).map((_, i) => <JobCardSkeleton key={i} />)
              : featuredJobs.length > 0
                ? featuredJobs.map(job => <FeaturedJobCard key={job._id} job={job} />)
                : (
                  <div className="col-span-full text-center py-20 text-slate-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No featured jobs right now. Check back soon!</p>
                    <Link to="/jobs" className="mt-4 inline-block text-primary-600 font-medium hover:underline">Browse all jobs</Link>
                  </div>
                )
            }
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link to="/jobs"><button className="btn-secondary">View All Jobs</button></Link>
          </div>
        </div>
      </section>

      {/* ═══ TOP COMPANIES ═══ */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950" aria-labelledby="companies-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full text-xs font-semibold mb-4">
              <Award className="w-3.5 h-3.5" /> TOP EMPLOYERS
            </div>
            <h2 id="companies-heading" className="section-heading">Companies Actively Hiring</h2>
            <p className="section-subheading mx-auto">Join world-class teams shaping the future of technology.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading
              ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="skeleton w-14 h-14 rounded-2xl mx-auto mb-3" />
                  <div className="skeleton h-4 rounded w-3/4 mx-auto mb-2" />
                  <div className="skeleton h-3 rounded w-1/2 mx-auto" />
                </div>
              ))
              : topCompanies.length > 0
                ? topCompanies.map(c => <CompanyCard key={c._id} company={c} />)
                : fallbackCompanies.map((c, i) => (
                  <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className={`w-14 h-14 rounded-2xl ${c.color} flex items-center justify-center mx-auto mb-3`}><c.icon className="w-8 h-8 text-white" /></div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{c.industry}</p>
                  </div>
                ))
            }
          </div>
          <div className="text-center mt-10">
            <Link to="/companies" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all">
              Explore all companies <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM STATS ═══ */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 relative overflow-hidden" aria-labelledby="stats-heading">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #4f46e5 0%, transparent 50%), radial-gradient(circle at 75% 20%, #7c3aed 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-semibold mb-4">
              <BarChart3 className="w-3.5 h-3.5" /> PLATFORM IMPACT
            </div>
            <h2 id="stats-heading" className="text-3xl sm:text-4xl font-bold text-white">Trusted by Thousands Worldwide</h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto">Connecting talent with opportunity at scale, every single day.</p>
          </div>
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {platformStats.map((stat, i) => <CountUpStat key={i} {...stat} isActive={statsInView} />)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { l: 'Avg time to hire', v: '14 days' },
              { l: 'Candidate satisfaction', v: '4.8/5 ★' },
              { l: 'Recruiter NPS', v: '72' },
              { l: 'Jobs filled/month', v: '2,400+' },
            ].map((m, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xl font-bold text-primary-400">{m.v}</p>
                <p className="text-xs text-white/50 mt-1">{m.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950" aria-labelledby="how-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold mb-4">
              <Rocket className="w-3.5 h-3.5" /> GET STARTED
            </div>
            <h2 id="how-heading" className="section-heading">How It Works</h2>
            <p className="section-subheading mx-auto">Simple steps to land your next opportunity or hire top talent.</p>
          </div>
          <div className="flex items-center justify-center mb-12">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl" role="tablist">
              {['seeker', 'recruiter'].map(tab => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {tab === 'seeker' ? '👤 For Job Seekers' : '🏢 For Recruiters'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-14">
            {(activeTab === 'seeker' ? seekerSteps : recruiterSteps).map((step, i) => (
              <div key={i} className="group text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                    <step.icon className="w-12 h-12 text-white" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-400 text-slate-900 text-sm font-extrabold flex items-center justify-center shadow-lg">{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/register">
              <button className="btn-primary px-8 py-3 text-base rounded-xl">
                {activeTab === 'seeker' ? 'Create Free Account' : 'Post Your First Job'} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/50" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-xs font-semibold mb-4">
              <Star className="w-3.5 h-3.5 fill-current" /> SUCCESS STORIES
            </div>
            <h2 id="testimonials-heading" className="section-heading">What Our Users Say</h2>
            <p className="section-subheading mx-auto">Real stories from people who found success on our platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <article key={i} className="group p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-0.5 mb-4" aria-label="5 stars">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-medium">{t.outcome}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950" aria-labelledby="cta-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="cta-heading" className="sr-only">Get Started</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Seeker CTA */}
            <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-primary-600 to-violet-700 text-white">
              <div className="absolute -top-12 -right-12 w-52 h-52 bg-white/10 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">Find Your Next Opportunity</h3>
                <p className="text-white/80 mb-8 text-sm leading-relaxed">
                  Join 50,000+ professionals who found their dream jobs. Create your free profile today and let AI match you to the best roles.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/jobs" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm">
                    Browse Jobs
                  </Link>
                </div>
              </div>
            </div>
            {/* Recruiter CTA */}
            <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="absolute -top-12 -right-12 w-52 h-52 bg-primary-500/10 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500/10 rounded-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">Hire Top Talent Faster</h3>
                <p className="text-white/60 mb-8 text-sm leading-relaxed">
                  AI-powered ATS, post jobs in minutes, and find pre-screened candidates who match your exact requirements.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 transition-colors text-sm">
                    Post a Job <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/companies" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm">
                    View Companies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ════════ STATIC DATA ════════ */
const categories = [
  { name: 'Technology', value: 'Technology', icon: Code2, color: 'bg-gradient-to-br from-blue-500 to-cyan-500', count: '1,200+' },
  { name: 'Design & UX', value: 'Design', icon: Palette, color: 'bg-gradient-to-br from-purple-500 to-pink-500', count: '580+' },
  { name: 'Marketing', value: 'Marketing', icon: Megaphone, color: 'bg-gradient-to-br from-emerald-500 to-teal-500', count: '430+' },
  { name: 'Finance', value: 'Finance', icon: LineChart, color: 'bg-gradient-to-br from-amber-500 to-orange-500', count: '320+' },
  { name: 'Healthcare', value: 'Healthcare', icon: HeartPulse, color: 'bg-gradient-to-br from-red-500 to-rose-500', count: '290+' },
  { name: 'Engineering', value: 'Engineering', icon: Cpu, color: 'bg-gradient-to-br from-indigo-500 to-violet-500', count: '750+' },
  { name: 'Data Science', value: 'Data Science', icon: Database, color: 'bg-gradient-to-br from-cyan-500 to-blue-500', count: '410+' },
  { name: 'Product Management', value: 'Product Management', icon: Package, color: 'bg-gradient-to-br from-pink-500 to-rose-500', count: '200+' },
];

const platformStats = [
  { value: 10000, suffix: '+', label: 'Active Job Listings', icon: Briefcase, color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { value: 5000, suffix: '+', label: 'Partner Companies', icon: Building2, color: 'bg-gradient-to-br from-violet-500 to-purple-500' },
  { value: 50000, suffix: '+', label: 'Registered Seekers', icon: Users, color: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
  { value: 95, suffix: '%', label: 'Placement Success Rate', icon: TrendingUp, color: 'bg-gradient-to-br from-amber-500 to-orange-500' },
];

const seekerSteps = [
  { icon: Users, title: 'Create Your Profile', description: 'Sign up in 2 minutes. Add skills, experience, and resume. Our AI profiles you instantly for better matches.' },
  { icon: Search, title: 'Discover Your Match', description: 'Browse 10,000+ jobs with smart filters. AI ranks results by your fit score — no guesswork needed.' },
  { icon: CheckCircle, title: 'Apply & Get Hired', description: 'One-click apply, real-time tracking, and interview scheduling — all in one place.' },
];

const recruiterSteps = [
  { icon: Building2, title: 'Set Up Company Profile', description: 'Create your company page with team photos, culture info, and benefits to attract the best candidates.' },
  { icon: Zap, title: 'Post Your Job', description: 'Write a job posting in minutes. Our quality checker ensures you get more qualified applicants.' },
  { icon: Target, title: 'Hire with AI ATS', description: 'AI ranks every applicant by match score. Use the Kanban board to move candidates through your pipeline.' },
];

const testimonials = [
  { name: 'Jagriti Kushwaha', role: 'Full Stack Developer at TechCorp', text: 'Found my dream job at a top tech company within two weeks. The AI matching was incredibly accurate — showing me roles I would never have found on my own.', gradient: 'from-primary-500 to-violet-600', outcome: '✅ Hired' },
  { name: 'Dev Sharma', role: 'Backend Engineer at DataFlow', text: 'The Kanban board kept me organized through 12 different interview processes. The platform is genuinely brilliant for staying on top of applications.', gradient: 'from-emerald-500 to-teal-600', outcome: '💰 +40% Salary' },
  { name: 'Amir Sohel', role: 'Data Scientist at CloudNine', text: 'Detailed company profiles and salary data helped me negotiate confidently. I knew exactly what the market rate was before every single conversation.', gradient: 'from-amber-500 to-orange-500', outcome: '🚀 Dream Role' },
];

const fallbackCompanies = [
  { name: 'TechCorp', industry: 'Software', icon: Code2, color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { name: 'DataFlow', industry: 'Analytics', icon: Database, color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
  { name: 'CloudNine', industry: 'Cloud Services', icon: Globe, color: 'bg-gradient-to-br from-sky-500 to-blue-600' },
  { name: 'DesignHub', industry: 'Creative', icon: Palette, color: 'bg-gradient-to-br from-pink-500 to-rose-600' },
  { name: 'FinEdge', industry: 'Fintech', icon: LineChart, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { name: 'MedTech', industry: 'Healthcare', icon: HeartPulse, color: 'bg-gradient-to-br from-red-500 to-rose-600' },
];
