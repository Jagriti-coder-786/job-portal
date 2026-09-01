import fs from 'fs';
import path from 'path';

const pages = [
  'pages/LoginPage.jsx',
  'pages/RegisterPage.jsx',
  'pages/JobsPage.jsx',
  'pages/JobDetailPage.jsx',
  'pages/CompaniesPage.jsx',
  'pages/NotFoundPage.jsx',
  'pages/seeker/SeekerDashboard.jsx',
  'pages/seeker/SeekerProfile.jsx',
  'pages/seeker/AppliedJobs.jsx',
  'pages/seeker/SavedJobs.jsx',
  'pages/seeker/Notifications.jsx',
  'pages/seeker/ChangePassword.jsx',
  'pages/recruiter/RecruiterDashboard.jsx',
  'pages/recruiter/CompanyProfile.jsx',
  'pages/recruiter/PostJob.jsx',
  'pages/recruiter/EditJob.jsx',
  'pages/recruiter/MyJobs.jsx',
  'pages/recruiter/ViewApplicants.jsx',
  'pages/recruiter/RecruiterAnalytics.jsx',
  'pages/admin/AdminDashboard.jsx',
  'pages/admin/ManageUsers.jsx',
  'pages/admin/ManageRecruiters.jsx',
  'pages/admin/ManageCompanies.jsx',
  'pages/admin/ManageJobs.jsx',
  'pages/admin/PlatformStats.jsx',
];

const basePath = 'd:\\Coding\\Job Portal\\frontend\\src';

pages.forEach((pagePath) => {
  const fullPath = path.join(basePath, pagePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const componentName = path.basename(pagePath, '.jsx');
  const content = `export default function ${componentName}() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">${componentName}</h1>
      <p className="mt-4 text-slate-500">This page is under construction.</p>
    </div>
  );
}
`;

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Created:', fullPath);
  }
});
