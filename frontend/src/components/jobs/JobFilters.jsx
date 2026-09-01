import { Search, MapPin, X } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { JOB_TYPES, EXPERIENCE_LEVELS, WORK_MODES, JOB_CATEGORIES } from '../../utils/constants';

export default function JobFilters({ filters, setFilters, onSearch, className = '' }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({
      search: '',
      location: '',
      jobType: '',
      experienceLevel: '',
      workMode: '',
      category: '',
      sort: 'newest'
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== 'newest').length;

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="space-y-5">
        <Input
          name="search"
          placeholder="Job title, keywords..."
          icon={Search}
          value={filters.search}
          onChange={handleChange}
        />

        <Input
          name="location"
          placeholder="City, state, or remote..."
          icon={MapPin}
          value={filters.location}
          onChange={handleChange}
        />

        <hr className="border-slate-100 dark:border-slate-800" />

        <Select
          name="category"
          label="Category"
          placeholder="All Categories"
          options={JOB_CATEGORIES.map(c => ({ label: c, value: c }))}
          value={filters.category}
          onChange={handleChange}
        />

        <Select
          name="jobType"
          label="Job Type"
          placeholder="Any Type"
          options={JOB_TYPES}
          value={filters.jobType}
          onChange={handleChange}
        />

        <Select
          name="experienceLevel"
          label="Experience Level"
          placeholder="Any Level"
          options={EXPERIENCE_LEVELS}
          value={filters.experienceLevel}
          onChange={handleChange}
        />

        <Select
          name="workMode"
          label="Work Mode"
          placeholder="Any Mode"
          options={WORK_MODES}
          value={filters.workMode}
          onChange={handleChange}
        />

        <hr className="border-slate-100 dark:border-slate-800" />
        
        <Select
          name="sort"
          label="Sort By"
          options={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'salary-desc', label: 'Highest Salary' }
          ]}
          value={filters.sort}
          onChange={handleChange}
        />

        <Button type="submit" className="w-full">
          Apply Filters
        </Button>
      </form>
    </div>
  );
}
