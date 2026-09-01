import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Lazy load pages
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const JobsPage = lazy(() => import('../pages/JobsPage'));
const JobDetailPage = lazy(() => import('../pages/JobDetailPage'));
const CompaniesPage = lazy(() => import('../pages/CompaniesPage'));
const CompanyProfilePage = lazy(() => import('../pages/CompanyProfilePage'));
const PublicProfile = lazy(() => import('../pages/PublicProfile'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Seeker pages
const SeekerDashboard = lazy(() => import('../pages/seeker/SeekerDashboard'));
const SeekerProfile = lazy(() => import('../pages/seeker/SeekerProfile'));
const AppliedJobs = lazy(() => import('../pages/seeker/AppliedJobs'));
const SavedJobs = lazy(() => import('../pages/seeker/SavedJobs'));
const Notifications = lazy(() => import('../pages/seeker/Notifications'));
const ChangePassword = lazy(() => import('../pages/seeker/ChangePassword'));
const JobAlerts = lazy(() => import('../pages/seeker/JobAlerts'));

// Recruiter pages
const RecruiterDashboard = lazy(() => import('../pages/recruiter/RecruiterDashboard'));
const CompanyProfile = lazy(() => import('../pages/recruiter/CompanyProfile'));
const PostJob = lazy(() => import('../pages/recruiter/PostJob'));
const EditJob = lazy(() => import('../pages/recruiter/EditJob'));
const MyJobs = lazy(() => import('../pages/recruiter/MyJobs'));
const ViewApplicants = lazy(() => import('../pages/recruiter/ViewApplicants'));
const RecruiterAnalytics = lazy(() => import('../pages/recruiter/RecruiterAnalytics'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));
const ManageRecruiters = lazy(() => import('../pages/admin/ManageRecruiters'));
const ManageCompanies = lazy(() => import('../pages/admin/ManageCompanies'));
const ManageJobs = lazy(() => import('../pages/admin/ManageJobs'));
const PlatformStats = lazy(() => import('../pages/admin/PlatformStats'));

const Fallback = () => <LoadingSpinner size="lg" className="min-h-screen" />;

export default function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyProfilePage />} />
        <Route path="/profile/:id" element={<PublicProfile />} />

        {/* Seeker routes */}
        <Route element={<RoleRoute roles={['seeker']}><DashboardLayout /></RoleRoute>}>
          <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
          <Route path="/seeker/profile" element={<SeekerProfile />} />
          <Route path="/seeker/applied-jobs" element={<AppliedJobs />} />
          <Route path="/seeker/saved-jobs" element={<SavedJobs />} />
          <Route path="/seeker/notifications" element={<Notifications />} />
          <Route path="/seeker/change-password" element={<ChangePassword />} />
          <Route path="/seeker/alerts" element={<JobAlerts />} />
        </Route>

        {/* Recruiter routes */}
        <Route element={<RoleRoute roles={['recruiter']}><DashboardLayout /></RoleRoute>}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/company" element={<CompanyProfile />} />
          <Route path="/recruiter/post-job" element={<PostJob />} />
          <Route path="/recruiter/edit-job/:id" element={<EditJob />} />
          <Route path="/recruiter/my-jobs" element={<MyJobs />} />
          <Route path="/recruiter/jobs/:id/applicants" element={<ViewApplicants />} />
          <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
        </Route>

        {/* Admin routes */}
        <Route element={<RoleRoute roles={['admin']}><DashboardLayout /></RoleRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/recruiters" element={<ManageRecruiters />} />
          <Route path="/admin/companies" element={<ManageCompanies />} />
          <Route path="/admin/jobs" element={<ManageJobs />} />
          <Route path="/admin/stats" element={<PlatformStats />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
