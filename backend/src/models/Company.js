import mongoose from 'mongoose';
import { COMPANY_STATUS } from '../utils/constants.js';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Company description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  website: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  logo: {
    type: String,
    default: '',
  },
  industry: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', ''],
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(COMPANY_STATUS),
    default: COMPANY_STATUS.PENDING,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ owner: 1 });
companySchema.index({ status: 1 });

const Company = mongoose.model('Company', companySchema);
export default Company;
