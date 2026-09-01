import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ id, title, items, onScheduleInterview }) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col min-w-[280px] w-[82vw] sm:w-[300px] bg-slate-50 dark:bg-slate-800/50 rounded-xl flex-shrink-0 border border-slate-200 dark:border-slate-700 snap-center">
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-100/50 dark:bg-slate-800 rounded-t-xl">
        <h3 className="font-semibold text-slate-900 dark:text-white capitalize">{title}</h3>
        <span className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
          {items.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar min-h-[200px]"
      >
        <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
          {items.map(app => (
            <KanbanCard key={app._id} application={app} onScheduleInterview={onScheduleInterview} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
