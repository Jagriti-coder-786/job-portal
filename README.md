# Smart Job Portal

A modern, production-quality, full-stack Job Portal web application. It connects Job Seekers with Recruiters, features an Admin dashboard for platform management, and integrates AI capabilities for job matching.

## Features

### For Job Seekers
- **Profile Management:** Create profiles, upload resumes (PDF/DOCX), and add skills, education, and experience.
- **Job Search & Filtering:** Browse jobs with advanced filters (location, type, experience, keywords) and pagination.
- **AI Matching:** Instantly compare your profile against job requirements to get a match score and skill gap analysis (powered by Google Gemini).
- **Application Tracking:** Apply to jobs and track application status (Applied, Under Review, Interview, Hired, etc.).
- **Saved Jobs:** Bookmark jobs to apply later.
- **Notifications:** Receive alerts when applications change status.

### For Recruiters
- **Company Profiles:** Create and manage company pages with logo uploads.
- **Job Management:** Post, edit, close, and delete job listings.
- **Applicant Tracking:** View candidate profiles, resumes, and manage application statuses in an intuitive dashboard.
- **Analytics:** View visual charts and metrics for job posting performance, views, and applicant pipeline.

### For Admins
- **Platform Analytics:** Comprehensive dashboard showing user growth, job trends, and category distribution.
- **User Management:** Manage and remove Seeker and Recruiter accounts.
- **Company Approval:** Review, approve, or reject new company registrations.
- **Job Oversight:** Monitor all active jobs across the platform.

### General
- **Beautiful UI:** Modern, responsive design with Tailwind CSS, Lucide icons, and micro-animations.
- **Dark Mode:** Full system-aware dark mode support.
- **Authentication:** Secure JWT-based authentication with role-based access control.

## Technology Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS v3
- Context API (State Management)
- React Router v6
- React Hook Form + Zod (Validation)
- Recharts (Data Visualization)
- Axios

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcrypt
- Cloudinary (File Uploads)
- Google Gemini API (AI Matching)

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)
- Cloudinary Account
- Google Gemini API Key

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd "Job Portal"
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

Create a \`.env\` file in the \`backend\` directory:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/job-portal
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
NODE_ENV=development

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Config
GEMINI_API_KEY=your_gemini_key
\`\`\`

Seed the database (Optional but recommended):
\`\`\`bash
npm run seed
\`\`\`

Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
\`\`\`

Create a \`.env\` file in the \`frontend\` directory:
\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

### 4. Access the Application
- Frontend: \`http://localhost:5173\`
- Backend API: \`http://localhost:5000/api\`

## Demo Accounts (If seeded)
- **Admin:** \`admin@demo.com\` / \`Admin@123\`
- **Recruiter:** \`recruiter@demo.com\` / \`Demo@123\`
- **Seeker:** \`seeker@demo.com\` / \`Demo@123\`

## License
MIT License
