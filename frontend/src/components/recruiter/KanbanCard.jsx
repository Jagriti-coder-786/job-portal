import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Briefcase, FileText, Calendar as CalendarIcon } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatRelativeDate } from '../../utils/formatters';

export default function KanbanCard({ application, isOverlay, onScheduleInterview }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application._id, data: application });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const getMatchScoreColor = (score) => {
    if (!score) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (score >= 50) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border ${
        isOverlay ? 'shadow-lg border-primary-500 scale-105 rotate-2' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
      } cursor-grab active:cursor-grabbing transition-all group`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{application.applicant?.name}</h4>
        
        {application.matchScore !== undefined && (
          <div className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getMatchScoreColor(application.matchScore)}`} title={application.matchExplanation}>
            {application.matchScore}%
          </div>
        )}
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
        {application.applicant?.headline || 'No headline'}
      </p>

      <div className="flex flex-col gap-2 mt-auto text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> 
          <span>Applied {formatRelativeDate(application.createdAt)}</span>
        </div>
        
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button 
            className="flex items-center gap-1 hover:text-primary-600 transition-colors pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              if (application.applicant?.resume) {
                window.open(application.applicant.resume, '_blank');
              }
            }}
          >
            <FileText className="w-3.5 h-3.5" /> 
            <span>Resume</span>
          </button>

          {application.status === 'interview' && onScheduleInterview && (
            <button 
              className="ml-auto flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors pointer-events-auto bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onScheduleInterview(application);
              }}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> 
              <span>Schedule</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
