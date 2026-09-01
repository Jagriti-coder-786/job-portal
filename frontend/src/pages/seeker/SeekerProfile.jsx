import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Upload, X, Plus, FileText, User, Link as LinkIcon, Wand2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { userService } from '../../services/userService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SeekerProfile() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  
  const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      location: '',
      headline: '',
      bio: '',
      skills: '',
      education: [],
      experience: []
    }
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userService.getProfile();
      const profile = res.data.data.user;
      
      reset({
        name: profile.name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        skills: profile.skills ? profile.skills.join(', ') : '',
        education: profile.education || [],
        experience: profile.experience || []
      });
    } catch (err) {
      error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      // Parse skills from comma-separated string to array
      const formattedData = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await userService.updateProfile(formattedData);
      updateUser(res.data.data.user);
      success('Profile updated successfully');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await userService.uploadAvatar(formData);
      updateUser({ avatar: res.data.data.avatar });
      success('Profile picture updated');
    } catch (err) {
      error('Failed to upload picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append('resume', file);
      
      const res = await userService.uploadResume(formData);
      updateUser({ 
        resume: res.data.data.resume,
        resumeOriginalName: res.data.data.resumeOriginalName
      });
      success('Resume uploaded successfully');
    } catch (err) {
      error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleParseResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setParsingResume(true);
      const formData = new FormData();
      formData.append('resume', file);
      
      success('Parsing resume, this may take a few seconds...');
      const res = await userService.parseResume(formData);
      const parsedData = res.data.data;
      
      // Update form fields
      if (parsedData.name) setValue('name', parsedData.name);
      if (parsedData.phone) setValue('phone', parsedData.phone);
      if (parsedData.location) setValue('location', parsedData.location);
      if (parsedData.headline) setValue('headline', parsedData.headline);
      if (parsedData.bio) setValue('bio', parsedData.bio);
      if (parsedData.skills && parsedData.skills.length > 0) setValue('skills', parsedData.skills.join(', '));
      
      // We don't overwrite experience/education arrays directly to avoid erasing existing data completely,
      // but if the arrays are currently empty, we can just replace them.
      // Wait, let's just append or replace them entirely. For simplicity, we'll replace.
      if (parsedData.experience && parsedData.experience.length > 0) {
        // remove existing
        while(expFields.length > 0) removeExp(0);
        parsedData.experience.forEach(exp => appendExp(exp));
      }
      
      if (parsedData.education && parsedData.education.length > 0) {
        while(eduFields.length > 0) removeEdu(0);
        parsedData.education.forEach(edu => {
          // Map school->institution, fieldOfStudy->field
          appendEdu({
            institution: edu.school || '',
            degree: edu.degree || '',
            field: edu.fieldOfStudy || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || ''
          });
        });
      }
      
      success('Profile autofilled from resume! Please review the changes.');
    } catch (err) {
      error('Failed to parse resume');
    } finally {
      setParsingResume(false);
      // reset file input
      e.target.value = '';
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your personal information, resume, and experience.</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/profile/${user._id}`);
            success('Public profile link copied to clipboard!');
          }}
        >
          <LinkIcon className="w-4 h-4" /> Copy Public Profile Link
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Media */}
        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-300 mx-auto mt-8" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                <Upload className="w-6 h-6" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" /> Resume
            </h3>
            
            {user?.resumeOriginalName ? (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div className="truncate flex-1 mr-4">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.resumeOriginalName}</p>
                  <p className="text-xs text-slate-500">Uploaded</p>
                </div>
                <a href={user.resume} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm font-medium shrink-0">
                  View
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mb-4">No resume uploaded yet. A resume is required to apply for jobs.</p>
            )}

            <label className="w-full">
              <div className={`btn-secondary w-full cursor-pointer ${uploadingResume ? 'opacity-50' : ''}`}>
                {uploadingResume ? <LoadingSpinner size="sm" /> : <><Upload className="w-4 h-4 mr-2" /> Upload New Resume</>}
              </div>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={uploadingResume} />
            </label>
            <p className="text-xs text-slate-400 mt-2 text-center mb-4">PDF, DOC, DOCX up to 5MB</p>

            <div className="relative pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="w-full">
                <div className={`btn-outline w-full cursor-pointer flex justify-center text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${parsingResume ? 'opacity-50' : ''}`}>
                  {parsingResume ? <LoadingSpinner size="sm" /> : <><Wand2 className="w-4 h-4 mr-2" /> Autofill from PDF Resume</>}
                </div>
                <input type="file" accept=".pdf" className="hidden" onChange={handleParseResume} disabled={parsingResume} />
              </label>
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">Uses AI to extract your details</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Basic Information</h2>
              
              <div className="space-y-4">
                <Input label="Full Name" {...register('name')} error={errors.name?.message} />
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Phone Number" {...register('phone')} />
                  <Input label="Location (City, Country)" {...register('location')} />
                </div>
                
                <Input label="Professional Headline" placeholder="e.g. Senior Frontend Developer" {...register('headline')} />
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">About Me (Bio)</label>
                  <textarea 
                    {...register('bio')}
                    rows={4} 
                    className="input-field resize-none"
                    placeholder="Tell employers about yourself..."
                  />
                </div>
                
                <Input 
                  label="Skills" 
                  placeholder="React, Node.js, Python (comma separated)" 
                  {...register('skills')} 
                  error={errors.skills?.message} 
                />
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Experience</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ company: '', title: '', location: '', startDate: '', current: false, description: '' })}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              
              <div className="space-y-8">
                {expFields.map((field, index) => (
                  <div key={field.id} className="relative p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <button type="button" onClick={() => removeExp(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mb-4 mt-2 pr-8">
                      <Input label="Job Title" required {...register(`experience.${index}.title`)} />
                      <Input label="Company" required {...register(`experience.${index}.company`)} />
                      <Input label="Location" {...register(`experience.${index}.location`)} />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <Input label="Start Date" type="date" required {...register(`experience.${index}.startDate`)} />
                      <Input label="End Date" type="date" {...register(`experience.${index}.endDate`)} />
                    </div>
                    
                    <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register(`experience.${index}.current`)} className="rounded text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">I currently work here</span>
                      </label>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                      <textarea {...register(`experience.${index}.description`)} rows={3} className="input-field resize-none" placeholder="What did you do?"></textarea>
                    </div>
                  </div>
                ))}
                {expFields.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No experience added yet.</p>}
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Education</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ institution: '', degree: '', field: '', startDate: '' })}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              
              <div className="space-y-8">
                {eduFields.map((field, index) => (
                  <div key={field.id} className="relative p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <button type="button" onClick={() => removeEdu(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mb-4 mt-2 pr-8">
                      <Input label="Institution" required {...register(`education.${index}.institution`)} />
                      <Input label="Degree (e.g. Bachelor's)" required {...register(`education.${index}.degree`)} />
                    </div>
                    
                    <div className="mb-4">
                      <Input label="Field of Study" required {...register(`education.${index}.field`)} />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Start Date" type="date" required {...register(`education.${index}.startDate`)} />
                      <Input label="End Date" type="date" {...register(`education.${index}.endDate`)} />
                    </div>
                  </div>
                ))}
                {eduFields.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No education added yet.</p>}
              </div>
            </Card>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" loading={saving}>Save Profile Changes</Button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}

