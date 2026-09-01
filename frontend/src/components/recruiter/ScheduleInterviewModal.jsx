import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { applicationService } from '../../services/applicationService';
import { useToast } from '../../hooks/useToast';

export default function ScheduleInterviewModal({ isOpen, onClose, application, onScheduled }) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    link: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await applicationService.scheduleInterview(application._id, formData);
      success('Interview scheduled successfully');
      onScheduled();
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  if (!application) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Interview">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500 mb-4">
          Scheduling interview for <strong>{application.applicant?.name}</strong>.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <Input 
            label="Time"
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>
        
        <Input 
          label="Meeting Link (Google Meet / Zoom)"
          type="url"
          name="link"
          placeholder="https://meet.google.com/..."
          value={formData.link}
          onChange={handleChange}
        />
        
        <div className="space-y-1 text-sm">
          <label className="block font-medium text-slate-700 dark:text-slate-300">Notes (Optional)</label>
          <textarea 
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            rows="3"
            placeholder="e.g. Please bring your portfolio..."
          ></textarea>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
