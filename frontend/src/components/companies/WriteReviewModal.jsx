import { useState } from 'react';
import { Star } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { companyService } from '../../services/companyService';
import { useToast } from '../../hooks/useToast';

export default function WriteReviewModal({ isOpen, onClose, company, onReviewAdded }) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    comment: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      error('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      const res = await companyService.addReview(company._id, { ...formData, rating });
      success('Review submitted successfully');
      onReviewAdded(res.data.data.review);
      setFormData({ title: '', comment: '' });
      setRating(5);
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!company) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review ${company.name}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Overall Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
              </button>
            ))}
          </div>
        </div>

        <Input 
          label="Review Title" 
          name="title"
          placeholder="Summarize your experience"
          value={formData.title}
          onChange={handleChange}
          required 
        />
        
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Your Review</label>
          <textarea 
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className="input-field min-h-[120px]"
            placeholder="What was it like working here?"
            required
          ></textarea>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} loading={loading}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
