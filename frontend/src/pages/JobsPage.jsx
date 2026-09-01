import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { Search, BellRing, SlidersHorizontal, X } from 'lucide-react';
import { jobService } from '../services/jobService';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { error } = useToast();
  const { isAuthenticated, isSeeker } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Active filters count
  const activeFiltersCount = ['location', 'category', 'jobType', 'experienceLevel', 'workMode']
    .filter(k => !!searchParams.get(k)).length;

  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showMobileFilters]);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    workMode: searchParams.get('workMode') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const fetchJobs = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      
      // Add active filters to params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await jobService.getJobs(params);
      setJobs(res.data.data.jobs);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const queryKey = searchParams.toString();

  useEffect(() => {
    const currentFilters = {
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      category: searchParams.get('category') || '',
      jobType: searchParams.get('jobType') || '',
      experienceLevel: searchParams.get('experienceLevel') || '',
      workMode: searchParams.get('workMode') || '',
      sort: searchParams.get('sort') || 'newest',
    };
    setFilters(currentFilters);
    fetchJobs(1, currentFilters);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const handleSearch = () => {
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    setSearchParams(newParams);
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    fetchJobs(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1 pt-20 sm:pt-24 pb-24 md:pb-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Find Jobs</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {loading ? 'Searching opportunities...' : `Showing ${pagination.total} opportunities`}
              </p>
            </div>
            {isAuthenticated && isSeeker && (
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2 min-h-[40px] w-full sm:w-auto"
                onClick={() => navigate('/seeker/alerts')}
              >
                <BellRing className="w-4 h-4" /> Set Job Alert
              </Button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <button 
                className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-200 shadow-sm min-h-[48px] active:scale-[0.99] transition-all"
                onClick={() => setShowMobileFilters(true)}
              >
                <span className="flex items-center gap-2.5 text-sm font-semibold">
                  <SlidersHorizontal className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  Filter Opportunities
                </span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-full">
                    {activeFiltersCount} active
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filter Drawer / Bottom Sheet */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 z-50">
                <div 
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                  onClick={() => setShowMobileFilters(false)} 
                />
                <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col z-50 animate-slide-up">
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">Filter Jobs</h3>
                    </div>
                    <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Drawer Body */}
                  <div className="p-4 overflow-y-auto flex-1">
                    <JobFilters 
                      filters={filters} 
                      setFilters={setFilters} 
                      onSearch={handleSearch} 
                    />
                  </div>

                  {/* Sticky Apply Button */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 pb-[max(env(safe-area-inset-bottom),1rem)]">
                    <button
                      type="button"
                      onClick={() => {
                        const clear = { search: '', location: '', category: '', jobType: '', experienceLevel: '', workMode: '', sort: 'newest' };
                        setFilters(clear);
                        fetchJobs(1, clear);
                        setSearchParams(new URLSearchParams());
                        setShowMobileFilters(false);
                      }}
                      className="btn-secondary flex-1 min-h-[44px]"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="btn-primary flex-1 min-h-[44px]"
                    >
                      Show Results
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="sticky top-24">
                <JobFilters 
                  filters={filters} 
                  setFilters={setFilters} 
                  onSearch={handleSearch} 
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                </div>
              ) : jobs.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {jobs.map(job => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>
                  <Pagination 
                    page={pagination.page} 
                    pages={pagination.pages} 
                    onPageChange={handlePageChange} 
                  />
                </>
              ) : (
                <Card className="mt-0">
                  <EmptyState
                    icon={Search}
                    title="No jobs found"
                    description="Try adjusting your search criteria, removing some filters, or checking back later for new opportunities."
                    action={() => {
                      const clear = { search: '', location: '', category: '', jobType: '', experienceLevel: '', workMode: '', sort: 'newest' };
                      setFilters(clear);
                      fetchJobs(1, clear);
                      setSearchParams(new URLSearchParams());
                    }}
                    actionLabel="Clear Filters"
                  />
                </Card>
              )}
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
