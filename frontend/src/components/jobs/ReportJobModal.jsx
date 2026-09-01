import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { jobService } from '../../services/jobService';
import { useToast } from '../../hooks/useToast';

const REPORT_REASONS = [
  'Fraudulent or scam',
  'Inaccurate job description',
  'Discriminatory or offensive content',
  'Spam or duplicate posting',
  'Other'
];

export default function ReportJobModal({ isOpen, onClose, job }) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: REPORT_REASONS[0],
    description: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await jobService.reportJob(job._id, formData);
      success('Job reported successfully. We will review it shortly.');
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to report job');
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Job">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500 mb-4">
          Why are you reporting <strong>{job.title}</strong> at <strong>{job.company?.name}</strong>?
        </p>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
          <select 
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
          >
            {REPORT_REASONS.map(reason => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Additional Details (Optional)</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            rows="3"
            placeholder="Please provide any additional information..."
          ></textarea>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
