import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { jobService } from '../../services/jobService';
import { companyService } from '../../services/companyService';
import JobForm from '../../components/jobs/JobForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function PostJob() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);

  useEffect(() => {
    const checkCompany = async () => {
      try {
        const res = await companyService.getMyCompany();
        if (res.data.data.company) {
          setHasCompany(true);
        } else {
          error('You must create a company profile first');
          navigate('/recruiter/company');
        }
      } catch (err) {
        error('You must create a company profile first');
        navigate('/recruiter/company');
      } finally {
        setChecking(false);
      }
    };
    checkCompany();
  }, [navigate, error]);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await jobService.createJob(data);
      success('Job posted successfully!');
      navigate(`/jobs/${res.data.data.job._id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <LoadingSpinner size="lg" />;
  if (!hasCompany) return null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Post a New Job</h1>
        <p className="text-slate-500 dark:text-slate-400">Fill out the details to create a new job listing.</p>
      </div>

      <JobForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

