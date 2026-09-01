import mongoose from 'mongoose';

const companyReviewSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    maxlength: 100,
  },
  review: {
    type: String,
    required: [true, 'Review content is required'],
    maxlength: 2000,
  },
  pros: String,
  cons: String,
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  }
}, {
  timestamps: true,
});

companyReviewSchema.index({ company: 1, status: 1 });
companyReviewSchema.index({ user: 1 });

// Prevent multiple reviews from same user for same company
companyReviewSchema.index({ company: 1, user: 1 }, { unique: true });

const CompanyReview = mongoose.model('CompanyReview', companyReviewSchema);
export default CompanyReview;
