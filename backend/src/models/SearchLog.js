import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null for anonymous searches
  },
  location: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

searchLogSchema.index({ keyword: 1 });
searchLogSchema.index({ createdAt: 1 });

const SearchLog = mongoose.model('SearchLog', searchLogSchema);
export default SearchLog;
