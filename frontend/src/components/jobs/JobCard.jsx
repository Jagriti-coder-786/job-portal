import { Link } from 'react-router-dom';
import { MapPin, Building2, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatSalary, formatRelativeDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { savedJobService } from '../../services/savedJobService';
import { useToast } from '../../hooks/useToast';
import { Target } from 'lucide-react';

export default function JobCard({ job, isSaved: initialIsSaved = false, onSaveToggle }) {
  const { isAuthenticated, isSeeker } = useAuth();
  const { success, error } = useToast();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !isSeeker) return;
    
    try {
      setLoading(true);
      await savedJobService.toggleSave(job._id);
      const newState = !isSaved;
      setIsSaved(newState);
      if (onSaveToggle) onSaveToggle(job._id, newState);
      success(newState ? 'Job saved' : 'Job removed from saved');
    } catch (err) {
      error('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/jobs/${job._id}`} className="group block h-full">
      <Card hover className="p-4 sm:p-6 h-full flex flex-col relative">
        {/* Save Button */}
        {isAuthenticated && isSeeker && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400" />
            )}
          </button>
        )}

        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4 pr-10">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            {job.company?.logo ? (
              <img src={job.company.logo} alt="" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover" />
            ) : (
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
              {job.title}
            </h3>
            <Link to={`/companies/${job.company?._id}`} className="text-xs sm:text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 truncate block mt-0.5">
              {job.company?.name}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <Badge variant="primary" className="text-xs">{job.jobType}</Badge>
          <Badge variant="default" className="text-xs">{job.workMode}</Badge>
          <Badge variant="default" className="text-xs">{job.experienceLevel}</Badge>
          {job.matchScore !== undefined && (
            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-md border border-indigo-100 dark:border-indigo-800/60 flex items-center gap-1">
              <Target className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              {job.matchScore}% Match
            </span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
            {job.description}
          </p>
        </div>

        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <div className="flex flex-col gap-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary-600 dark:text-primary-400">{formatSalary(job.salary)}</p>
              <p className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> {formatRelativeDate(job.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
