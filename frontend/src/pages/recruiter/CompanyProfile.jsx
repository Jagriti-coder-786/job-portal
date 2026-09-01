import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Upload, ExternalLink, MapPin, Users, Info } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { companyService } from '../../services/companyService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CompanyProfile() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      website: '',
      location: '',
      industry: '',
      size: '1-10',
    }
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await companyService.getMyCompany();
      const company = res.data.data.company;
      
      if (company) {
        setCompanyId(company._id);
        setLogoPreview(company.logo);
        reset({
          name: company.name || '',
          description: company.description || '',
          website: company.website || '',
          location: company.location || '',
          industry: company.industry || '',
          size: company.size || '1-10',
        });
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        error('Failed to load company profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      if (companyId) {
        await companyService.updateCompany(companyId, data);
        success('Company profile updated');
      } else {
        const res = await companyService.createCompany(data);
        setCompanyId(res.data.data.company._id);
        success('Company profile created. Pending admin approval.');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    if (!companyId) {
      error('Please create your company profile first before uploading a logo');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('logo', file);
      
      const res = await companyService.uploadLogo(companyId, formData);
      setLogoPreview(res.data.data.logo);
      success('Company logo updated');
    } catch (err) {
      error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Company Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your organization's public information.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Logo & Status */}
        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-6 group cursor-pointer w-full aspect-square max-w-[200px]">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity cursor-pointer">
                <Upload className="w-8 h-8" />
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading || !companyId} />
              </label>
            </div>
            
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{companyId ? 'Upload Logo' : 'Setup Profile First'}</h3>
            <p className="text-xs text-slate-500 mb-4">Recommended size: 400x400px (JPG, PNG)</p>
            {uploading && <LoadingSpinner size="sm" />}
          </Card>

          {!companyId && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                You must create your company profile before you can upload a logo or post any jobs.
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <Input 
                label="Company Name" 
                placeholder="Acme Corp" 
                icon={Building2}
                required
                {...register('name', { required: 'Company name is required' })} 
                error={errors.name?.message} 
              />
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Company Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  {...register('description', { required: 'Description is required', minLength: { value: 50, message: 'Must be at least 50 characters' } })}
                  rows={6} 
                  className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="What does your company do? What is your mission and culture?"
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <Input 
                  label="Website" 
                  type="url"
                  placeholder="https://example.com" 
                  icon={ExternalLink}
                  {...register('website')} 
                />
                
                <Input 
                  label="Location (Headquarters)" 
                  placeholder="San Francisco, CA" 
                  icon={MapPin}
                  {...register('location')} 
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <Input 
                  label="Industry" 
                  placeholder="e.g. Technology, Healthcare" 
                  {...register('industry')} 
                />
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select {...register('size')} className="input-field pl-10">
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" size="lg" loading={saving}>
                  {companyId ? 'Save Changes' : 'Create Company Profile'}
                </Button>
              </div>
              
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

