import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Briefcase, Clock, Calendar, CheckCircle2, ChevronLeft, ArrowRight, Zap, Share2, Bookmark, BookmarkCheck, Users } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { savedJobService } from '../services/savedJobService';
import { aiService } from '../services/aiService';
import { formatSalary, formatRelativeDate, formatDate } from '../utils/formatters';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ReportJobModal from '../components/jobs/ReportJobModal';
import { Flag } from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isSeeker } = useAuth();
  const { success, error } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  
  const [matchScore, setMatchScore] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadJobDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const res = await jobService.getJob(id);
      setJob(res.data.data.job);
      
      if (isAuthenticated && isSeeker) {
        checkUserStatus();
      }
    } catch (err) {
      error('Job not found or has been removed');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    try {
      const [savedRes, appliedRes] = await Promise.all([
        savedJobService.checkSaved(id),
        applicationService.getMyApplications({ job: id })
      ]);
      
      setIsSaved(savedRes.data.data.isSaved);
      setHasApplied(appliedRes.data.data.applications.length > 0);
    } catch (err) {
      console.error('Failed to check user status', err);
    }
  };

  const handleSaveJob = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (!isSeeker) return;
    
    try {
      setSavingJob(true);
      await savedJobService.toggleSave(id);
      setIsSaved(!isSaved);
      success(isSaved ? 'Job removed from saved' : 'Job saved successfully');
    } catch (err) {
      error('Failed to save job');
    } finally {
      setSavingJob(false);
    }
  };

  const getAIMatch = async () => {
    try {
      setMatchLoading(true);
      const res = await aiService.getMatch(id);
      setMatchScore(res.data.data);
    } catch (err) {
      error(err.response?.data?.message || 'AI matching failed');
    } finally {
      setMatchLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user.resume) {
      error('Please upload a resume to your profile before applying');
      navigate('/seeker/profile');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('job', id);
      // Optional: Add cover letter from state if we added a textarea in the modal
      
      await applicationService.apply(formData);
      success('Application submitted successfully!');
      setHasApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 pt-24"><LoadingSpinner size="lg" /></main>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Breadcrumbs items={[
            { label: 'Jobs', href: '/jobs' },
            { label: job.category || 'Category', href: `/jobs?category=${encodeURIComponent(job.category || '')}` },
            { label: job.title }
          ]} />

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Details */}
            <div className="lg:w-2/3 space-y-6">
              
              {/* Header Card */}
              <Card className="p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                
                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                    {job.company?.logo ? (
                      <img src={job.company.logo} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <Building2 className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">{job.title}</h1>
                    <Link to={`/companies/${job.company?._id}`} className="text-lg text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-2">
                      {job.company?.name} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge variant="primary" className="text-sm px-3 py-1"><Briefcase className="w-4 h-4 mr-1.5" /> {job.jobType}</Badge>
                  <Badge variant="default" className="text-sm px-3 py-1"><MapPin className="w-4 h-4 mr-1.5" /> {job.workMode}</Badge>
                  <Badge variant="default" className="text-sm px-3 py-1">{job.experienceLevel}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-slate-100 dark:border-slate-800 mb-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Salary Range</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{formatSalary(job.salary)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Location</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Posted</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{formatRelativeDate(job.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Applicants</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{job.applicationsCount || 0} applied</p>
                  </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-4">
                  {isSeeker || !isAuthenticated ? (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => isAuthenticated ? setShowApplyModal(true) : navigate('/login')}
                        disabled={hasApplied}
                        className={hasApplied ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                      >
                        {hasApplied ? (
                          <><CheckCircle2 className="w-5 h-5 mr-1" /> Applied</>
                        ) : 'Apply Now'}
                      </Button>
                      <Button 
                        size="lg" 
                        variant="secondary" 
                        onClick={handleSaveJob} 
                        loading={savingJob}
                      >
                        {isSaved ? 'Saved' : 'Save Job'}
                      </Button>
                    </>
                  ) : null}
                  <div className="flex items-center ml-auto gap-2">
                    <Button size="lg" variant="ghost" aria-label="Share">
                      <Share2 className="w-5 h-5 text-slate-500" />
                    </Button>
                    {isAuthenticated && isSeeker && (
                      <Button size="lg" variant="ghost" className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Report" onClick={() => setShowReportModal(true)}>
                        <Flag className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Job Description</h2>
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>

                {job.requirements?.length > 0 && (
                  <>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Requirements</h2>
                    <ul className="space-y-2">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:w-1/3 space-y-6">
              
              {/* AI Match Card */}
              {isAuthenticated && isSeeker && (
                <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-indigo-900 dark:text-indigo-100">AI Profile Match</h3>
                      <p className="text-sm text-indigo-700/80 dark:text-indigo-300">Compare your skills with this job</p>
                    </div>
                  </div>
                  
                  {matchScore ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">{matchScore.score}%</span>
                        <span className="text-indigo-600 dark:text-indigo-300 font-medium mb-1">Match</span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Matching Skills:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchScore.matchingSkills.map(skill => (
                            <Badge key={skill} variant="success" className="text-xs py-0.5">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      {matchScore.missingSkills.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Missing Skills:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {matchScore.missingSkills.map(skill => (
                              <Badge key={skill} variant="danger" className="text-xs py-0.5 opacity-80">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-indigo-800 dark:text-indigo-200 mt-2 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                        {matchScore.recommendation}
                      </p>
                    </div>
                  ) : (
                    <Button 
                      onClick={getAIMatch} 
                      loading={matchLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Calculate Match Score
                    </Button>
                  )}
                </Card>
              )}

              {/* Company Info */}
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">About the Company</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {job.company?.logo ? (
                      <img src={job.company.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{job.company?.name}</h4>
                    <p className="text-sm text-slate-500">{job.company?.industry}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                  {job.company?.description}
                </p>
                <div className="space-y-2 text-sm text-slate-500 mb-6">
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.company?.location}</p>
                  <p className="flex items-center gap-2"><Users className="w-4 h-4" /> {job.company?.size} employees</p>
                </div>
                <Link to={`/companies/${job.company?._id}`}>
                  <Button variant="outline" className="w-full">View Company Profile</Button>
                </Link>
              </Card>

              {/* Skills */}
              {job.skills?.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(skill => (
                      <Badge key={skill} className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40">
        <div className="flex gap-3 max-w-7xl mx-auto">
          {isSeeker || !isAuthenticated ? (
            <>
              <Button 
                variant="secondary" 
                className="w-12 h-12 p-0 flex-shrink-0"
                onClick={handleSaveJob}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary-600" /> : <Bookmark className="w-5 h-5" />}
              </Button>
              <Button 
                className={`flex-1 h-12 ${hasApplied ? 'bg-emerald-500' : ''}`}
                onClick={() => isAuthenticated ? setShowApplyModal(true) : navigate('/login')}
                disabled={hasApplied}
              >
                {hasApplied ? 'Applied' : 'Apply Now'}
              </Button>
            </>
          ) : (
            <div className="text-center w-full text-sm text-slate-500 py-2">
              Recruiters cannot apply for jobs.
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Apply Modal */}
      <ConfirmDialog
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onConfirm={handleApply}
        title="Apply for this position"
        message={`You are applying for the ${job.title} position at ${job.company?.name}. We will send your current profile details and resume to the employer.`}
        confirmText="Submit Application"
        variant="primary"
      />

      {/* Report Modal */}
      <ReportJobModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        job={job} 
      />
    </div>
  );
}

