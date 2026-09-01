import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Briefcase, Award, GraduationCap, ChevronLeft, Building2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import { formatRelativeDate } from '../utils/formatters';

export default function PublicProfile() {
  const { id } = useParams();
  const { error } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/profile/${id}`);
      setProfile(res.data.data.user);
    } catch (err) {
      error('Profile not found or is private');
    } finally {
      setLoading(false);
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

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile Not Found</h1>
            <p className="text-slate-500 mb-6">The user you're looking for doesn't exist or is not a job seeker.</p>
            <Link to="/"><Button>Return Home</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
          
          <Card className="p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-500 to-accent-500"></div>
            
            <div className="relative pt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-slate-400">{profile.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium mt-1">
                  {profile.headline || 'Professional Job Seeker'}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-slate-500">
                  {profile.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {formatRelativeDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {profile.bio && (
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              {profile.skills?.length > 0 && (
                <Card className="p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                    <Award className="w-5 h-5 text-primary-500" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-3 py-1 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {profile.experience?.length > 0 && (
                <Card className="p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-6">
                    <Briefcase className="w-5 h-5 text-primary-500" /> Experience
                  </h3>
                  <div className="space-y-6">
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-primary-500">
                        <h4 className="font-bold text-slate-900 dark:text-white">{exp.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 my-1">
                          <Building2 className="w-4 h-4" /> {exp.company}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-2">
                          <Calendar className="w-4 h-4" /> {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div>
              {profile.education?.length > 0 && (
                <Card className="p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-6">
                    <GraduationCap className="w-5 h-5 text-primary-500" /> Education
                  </h3>
                  <div className="space-y-6">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-primary-500">
                        <h4 className="font-bold text-slate-900 dark:text-white">{edu.degree} in {edu.fieldOfStudy}</h4>
                        <p className="text-slate-600 dark:text-slate-400 font-medium my-1">{edu.institution}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" /> {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : new Date(edu.endDate).getFullYear()}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
