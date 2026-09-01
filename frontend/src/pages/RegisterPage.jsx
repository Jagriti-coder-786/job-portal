import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Briefcase, Building2, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['seeker', 'recruiter']),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('seeker');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'seeker',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const user = await registerUser(data);
      success('Account created successfully!');
      
      if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/seeker/dashboard');
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Job<span className="text-primary-500">Portal</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create an account</h1>
          <p className="text-slate-500 dark:text-slate-400">Join thousands of professionals and companies</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('seeker')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedRole === 'seeker'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary-200 dark:hover:border-primary-800'
                  }`}
                >
                  <UserCircle className="w-6 h-6" />
                  <span className="text-sm font-medium">Find a Job</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('recruiter')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedRole === 'recruiter'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary-200 dark:hover:border-primary-800'
                  }`}
                >
                  <Building2 className="w-6 h-6" />
                  <span className="text-sm font-medium">Hire Talent</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Ruhi"
                icon={User}
                {...register('name')}
                error={errors.name?.message}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
