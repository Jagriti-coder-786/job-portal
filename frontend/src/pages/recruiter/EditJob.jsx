import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { jobService } from '../../services/jobService';
import JobForm from '../../components/jobs/JobForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobService.getJob(id);
        setJob(res.data.data.job);
      } catch (err) {
        error('Failed to load job details');
        navigate('/recruiter/my-jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate, error]);

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      await jobService.updateJob(id, data);
      success('Job updated successfully!');
      navigate(`/jobs/${id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Job Posting</h1>
        <p className="text-slate-500 dark:text-slate-400">Update the details for "{job.title}".</p>
      </div>

      <JobForm initialData={job} onSubmit={handleSubmit} loading={saving} isEditing />
    </div>
  );
}

