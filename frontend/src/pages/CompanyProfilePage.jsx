import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Globe, Users, Building2, Star, MessageSquare } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import JobCard from '../components/jobs/JobCard';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { companyService } from '../services/companyService';
import { jobService } from '../services/jobService';
import WriteReviewModal from '../components/companies/WriteReviewModal';

export default function CompanyProfilePage() {
  const { id } = useParams();
  const { error } = useToast();
  const { isAuthenticated, isSeeker } = useAuth();
  
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchCompanyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const [companyRes, jobsRes, reviewsRes] = await Promise.all([
        companyService.getCompany(id),
        jobService.getJobs({ company: id, limit: 5 }),
        companyService.getReviews(id).catch(() => ({ data: { data: { reviews: [] } } }))
      ]);
      setCompany(companyRes.data.data.company);
      setJobs(jobsRes.data.data.jobs);
      setReviews(reviewsRes.data.data.reviews || []);
    } catch (err) {
      error('Company not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews([newReview, ...reviews]);
    // Optionally refetch company to update average rating, or update locally
    fetchCompanyData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 pt-24"><LoadingSpinner size="lg" /></main>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center text-slate-500">Company not found</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Card */}
          <Card className="p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-slate-800 to-slate-900"></div>
            
            <div className="relative pt-16 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="w-32 h-32 rounded-xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-cover p-2" />
                ) : (
                  <Building2 className="w-16 h-16 text-slate-300" />
                )}
              </div>
              
              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-500">
                  {company.industry && (
                    <span className="flex items-center gap-1.5 font-medium text-primary-600">{company.industry}</span>
                  )}
                  {company.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {company.location}</span>
                  )}
                  {company.size && (
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {company.size} employees</span>
                  )}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary-600">
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                  <span className="flex items-center gap-1.5 text-yellow-500 font-medium">
                    <Star className="w-4 h-4 fill-current" /> {company.averageRating || 'No ratings'} ({company.reviewCount || 0})
                  </span>
                </div>
              </div>
            </div>
            
            {company.description && (
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About Us</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {company.description}
                </p>
              </div>
            )}
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Jobs Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Open Roles</h2>
                  <Link to={`/jobs?company=${company._id}`} className="text-primary-600 hover:underline font-medium text-sm">
                    View All
                  </Link>
                </div>
                {jobs.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {jobs.map(job => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center text-slate-500">
                    No open roles at the moment.
                  </Card>
                )}
              </div>

              {/* Reviews Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reviews</h2>
                  {isAuthenticated && isSeeker && (
                    <Button onClick={() => setShowReviewModal(true)} size="sm">
                      Write Review
                    </Button>
                  )}
                </div>
                
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <Card key={review._id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                              {review.user?.avatar ? (
                                <img src={review.user.avatar} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <span className="font-bold text-slate-400">{review.user?.name?.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{review.user?.name}</p>
                              <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                            ))}
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">{review.title}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{review.comment}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center flex flex-col items-center">
                    <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">No reviews yet for this company.</p>
                    {isAuthenticated && isSeeker && (
                      <Button onClick={() => setShowReviewModal(true)} variant="outline">Be the first to review</Button>
                    )}
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Sidebar Info */}
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Company Overview</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Industry</p>
                    <p className="font-medium text-slate-900 dark:text-white">{company.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Company Size</p>
                    <p className="font-medium text-slate-900 dark:text-white">{company.size ? `${company.size} employees` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Headquarters</p>
                    <p className="font-medium text-slate-900 dark:text-white">{company.location}</p>
                  </div>
                  {company.website && (
                    <div>
                      <p className="text-slate-500 mb-1">Website</p>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {company && (
        <WriteReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          company={company}
          onReviewAdded={handleReviewAdded}
        />
      )}
    </div>
  );
}
