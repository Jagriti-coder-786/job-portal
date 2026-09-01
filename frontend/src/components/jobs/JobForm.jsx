import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, MapPin, DollarSign, ListPlus, X } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { JOB_TYPES, EXPERIENCE_LEVELS, WORK_MODES, JOB_CATEGORIES } from '../../utils/constants';

const jobSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(2, 'Location is required'),
  jobType: z.string().min(1, 'Job type is required'),
  experienceLevel: z.string().min(1, 'Experience level is required'),
  workMode: z.string().min(1, 'Work mode is required'),
  category: z.string().min(1, 'Category is required'),
  salary: z.object({
    min: z.number().optional().nullable(),
    max: z.number().optional().nullable(),
    currency: z.string().default('USD')
  }).optional(),
});

export default function JobForm({ initialData, onSubmit, loading, isEditing }) {
  const [skills, setSkills] = useState(initialData?.skills || []);
  const [requirements, setRequirements] = useState(initialData?.requirements || []);
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      jobType: initialData?.jobType || '',
      experienceLevel: initialData?.experienceLevel || '',
      workMode: initialData?.workMode || '',
      category: initialData?.category || '',
      salary: {
        min: initialData?.salary?.min || null,
        max: initialData?.salary?.max || null,
        currency: initialData?.salary?.currency || 'USD'
      }
    }
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      skills,
      requirements
    });
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addRequirement = (e) => {
    e.preventDefault();
    if (reqInput.trim()) {
      setRequirements([...requirements, reqInput.trim()]);
      setReqInput('');
    }
  };

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      
      <Card className="p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary-500" /> Basic Details
        </h2>
        
        <div className="space-y-6">
          <Input 
            label="Job Title" 
            placeholder="e.g. Senior React Developer" 
            {...register('title')} 
            error={errors.title?.message}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              {...register('description')}
              rows={8} 
              className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Describe the role, responsibilities, and ideal candidate..."
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Input 
              label="Location" 
              placeholder="e.g. New York, NY" 
              icon={MapPin}
              {...register('location')} 
              error={errors.location?.message}
              required
            />
            
            <Select
              label="Category"
              options={JOB_CATEGORIES.map(c => ({ label: c, value: c }))}
              {...register('category')}
              error={errors.category?.message}
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Employment Types & Salary</h2>
        
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <Select
            label="Job Type"
            options={JOB_TYPES}
            {...register('jobType')}
            error={errors.jobType?.message}
            required
          />
          <Select
            label="Work Mode"
            options={WORK_MODES}
            {...register('workMode')}
            error={errors.workMode?.message}
            required
          />
          <Select
            label="Experience Level"
            options={EXPERIENCE_LEVELS}
            {...register('experienceLevel')}
            error={errors.experienceLevel?.message}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Salary Range (Optional)
          </label>
          <div className="flex items-center gap-4">
            <Controller
              name="salary.min"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  placeholder="Min" 
                  icon={DollarSign}
                  className="w-full"
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              )}
            />
            <span className="text-slate-400">to</span>
            <Controller
              name="salary.max"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  placeholder="Max" 
                  icon={DollarSign}
                  className="w-full"
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              )}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <ListPlus className="w-5 h-5 text-primary-500" /> Skills & Requirements
        </h2>
        
        <div className="space-y-8">
          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Required Skills</label>
            <div className="flex gap-2 mb-3">
              <Input 
                placeholder="e.g. React" 
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addSkill(e)}
                className="flex-1"
              />
              <Button type="button" onClick={addSkill}>Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
              {skills.map((skill, index) => (
                <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && <span className="text-sm text-slate-500">No skills added yet.</span>}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Requirements</label>
            <div className="flex gap-2 mb-3">
              <Input 
                placeholder="e.g. 5+ years of experience in frontend development" 
                value={reqInput}
                onChange={e => setReqInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addRequirement(e)}
                className="flex-1"
              />
              <Button type="button" onClick={addRequirement}>Add</Button>
            </div>
            
            <div className="space-y-2 min-h-[60px] p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="flex-1 text-sm">{req}</span>
                  <button type="button" onClick={() => removeRequirement(index)} className="text-slate-400 hover:text-red-500 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {requirements.length === 0 && <span className="text-sm text-slate-500 block">No requirements added yet.</span>}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="ghost" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" size="lg" loading={loading}>
          {isEditing ? 'Save Changes' : 'Publish Job'}
        </Button>
      </div>

    </form>
  );
}
