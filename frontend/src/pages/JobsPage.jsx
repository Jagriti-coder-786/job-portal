import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { Search, BellRing } from 'lucide-react';
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
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Find Jobs</h1>
              <p className="text-slate-500 dark:text-slate-400">
                {loading ? 'Searching for opportunities...' : `Showing ${pagination.total} opportunities`}
              </p>
            </div>
            {isAuthenticated && isSeeker && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/seeker/alerts')}
              >
                <BellRing className="w-4 h-4" /> Set Job Alert
              </Button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <button 
              className="lg:hidden w-full flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-300"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              Filters
            </button>

            {/* Sidebar Filters */}
            <div className={`lg:w-1/4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
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
