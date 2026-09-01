import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { savedJobService } from '../../services/savedJobService';
import JobCard from '../../components/jobs/JobCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Card from '../../components/ui/Card';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchSavedJobs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await savedJobService.getSavedJobs({ page, limit: 12 });
      setSavedJobs(res.data.data.savedJobs);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleSaveToggle = (jobId, isSaved) => {
    if (!isSaved) {
      // Remove from list if unsaved
      setSavedJobs(prev => prev.filter(sj => sj.job._id !== jobId));
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Saved Jobs</h1>
        <p className="text-slate-500 dark:text-slate-400">Jobs you've bookmarked to apply later.</p>
      </div>

      {savedJobs.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((sj) => (
              sj.job ? (
                <JobCard 
                  key={sj._id} 
                  job={sj.job} 
                  isSaved={true} 
                  onSaveToggle={handleSaveToggle} 
                />
              ) : null
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchSavedJobs} />
        </>
      ) : (
        <Card className="p-12">
          <EmptyState 
            icon={Bookmark}
            title="No saved jobs"
            description="You haven't saved any jobs yet. When you find a job you like, click the bookmark icon to save it for later."
            action={() => window.location.href = '/jobs'}
            actionLabel="Browse Jobs"
          />
        </Card>
      )}
    </div>
  );
}

