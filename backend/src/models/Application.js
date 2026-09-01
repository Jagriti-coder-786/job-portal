import mongoose from 'mongoose';
import { APPLICATION_STATUS } from '../utils/constants.js';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: {
    type: String,
    required: [true, 'Resume is required'],
  },
  resumeOriginalName: {
    type: String,
    default: '',
  },
  coverLetter: {
    type: String,
    maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
  },
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    default: APPLICATION_STATUS.APPLIED,
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  timeline: [{
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  }],
  interview: {
    date: Date,
    time: String,
    link: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: String
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  matchDetails: {
    type: Object, // Store the breakdown (skills, experience, location)
  },
  matchExplanation: {
    type: String,
  }
}, {
  timestamps: true,
});

// Auto-populate timeline on creation
applicationSchema.pre('save', function(next) {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: this.status,
      date: new Date(),
      updatedBy: this.applicant
    });
  }
  next();
});

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
