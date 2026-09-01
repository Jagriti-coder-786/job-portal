import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { applicationService } from '../../services/applicationService';
import { useToast } from '../../hooks/useToast';

const COLUMNS = [
  { id: 'applied', title: 'Applied' },
  { id: 'screening', title: 'Screening' },
  { id: 'under-review', title: 'Under Review' },
  { id: 'shortlisted', title: 'Shortlisted' },
  { id: 'interview', title: 'Interview' },
  { id: 'offer', title: 'Offer' },
  { id: 'hired', title: 'Hired' },
  { id: 'rejected', title: 'Rejected' }
];

export default function KanbanBoard({ initialApplications, jobId, onStatusChange, onScheduleInterview }) {
  const { success, error } = useToast();
  const [columns, setColumns] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  // Group applications by status
  useEffect(() => {
    const grouped = COLUMNS.reduce((acc, col) => {
      acc[col.id] = initialApplications.filter(app => app.status === col.id);
      return acc;
    }, {});
    setColumns(grouped);
  }, [initialApplications]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    // Find the item
    let item = null;
    for (const col in columns) {
      const found = columns[col].find(app => app._id === active.id);
      if (found) {
        item = found;
        break;
      }
    }
    setActiveItem(item);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id; // over.id could be the column itself

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex(item => item._id === active.id);
      const overIndex = overItems.findIndex(item => item._id === over.id);

      let newIndex;
      if (over.id in prev) {
        // Dropping over a column
        newIndex = overItems.length + 1;
      } else {
        // Dropping over an item
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(item => item._id !== active.id)
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length)
        ]
      };
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      // Reordering within the same column (if we care about order)
      const activeIndex = columns[activeContainer].findIndex(item => item._id === active.id);
      const overIndex = columns[overContainer].findIndex(item => item._id === over.id);

      if (activeIndex !== overIndex) {
        setColumns((prev) => ({
          ...prev,
          [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
        }));
      }
    } else {
      // Dropped into a different column, update backend
      try {
        await applicationService.updateApplicationStatus(active.id, overContainer);
        success(`Application moved to ${overContainer}`);
        if (onStatusChange) onStatusChange(active.id, overContainer);
      } catch (err) {
        error('Failed to move application');
        // Revert UI if needed (for simplicity we might just refetch or rely on robust UI state)
      }
    }
  };

  const findContainer = (id) => {
    if (id in columns) return id; // It's a column
    return Object.keys(columns).find(key => columns[key].some(item => item._id === id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {COLUMNS.map(col => (
          <KanbanColumn 
            key={col.id} 
            id={col.id} 
            title={col.title} 
            items={columns[col.id] || []} 
            onScheduleInterview={onScheduleInterview}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeItem ? <KanbanCard application={activeItem} isOverlay onScheduleInterview={onScheduleInterview} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
