# Production Deployment Guide

Deploy the Job Portal full-stack application to production using **MongoDB Atlas**, **Render** (Backend API), and **Vercel** (Frontend SPA).

---

## 📌 Repository & Cluster Details

- **GitHub Repository**: [https://github.com/Jagriti-coder-786/job-portal](https://github.com/Jagriti-coder-786/job-portal)
- **Primary Branch**: `main`
- **MongoDB Atlas Cluster**: `Cluster0` (Database: `jobportal`) — *Already seeded and ready!*

---

## 🚀 Quick Reference: Environment Variables

### Backend Environment Variables (Paste into Render)

| Key | Exact Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://jagritikushwaha95_db_user:SevPlzUngktllCi5@cluster0.ta7bgdu.mongodb.net/jobportal?appName=Cluster0` |
| `JWT_SECRET` | `71faafe736b12ceee9ad7f667209923f63db078385f0a8dfd2763818bb42d8a3` |
| `JWT_REFRESH_SECRET` | `6a54c0d74f0c9722e40bdb179bc057932a63e90416c003c03030267c1c5bd0d4` |
| `FRONTEND_URL` | `https://temporary.vercel.app` *(update with your real Vercel URL after Step 2)* |
| `CLOUDINARY_CLOUD_NAME` | *(Optional - add when enabling file uploads)* |
| `CLOUDINARY_API_KEY` | *(Optional)* |
| `CLOUDINARY_API_SECRET` | *(Optional)* |
| `GEMINI_API_KEY` | *(Optional - add for AI resume/match features)* |

### Frontend Environment Variables (Paste into Vercel)

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` *(must end with `/api`)* |
| `VITE_SOCKET_URL` | `https://<your-render-service>.onrender.com` *(optional, for WebSockets)* |

---

## 📋 Step-by-Step Deployment Walkthrough

```
[ Step 1: Deploy Backend to Render ] ──> [ Step 2: Deploy Frontend to Vercel ] ──> [ Step 3: Link CORS ]
```

---

### Step 1: Backend API Deployment (Render)

1. Sign in to [Render](https://render.com/).
2. Click **New +** → **Web Service**.
3. Select your repository: **`Jagriti-coder-786/job-portal`**.
4. Configure service settings:
   - **Name**: `job-portal-api` (or your preferred name)
   - **Region**: Closest to you (e.g., Singapore, Frankfurt, or Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Advanced** and set:
   - **Health Check Path**: `/health`
6. Under **Environment Variables**, add the 6 required backend keys:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://jagritikushwaha95_db_user:SevPlzUngktllCi5@cluster0.ta7bgdu.mongodb.net/jobportal?appName=Cluster0
   JWT_SECRET=71faafe736b12ceee9ad7f667209923f63db078385f0a8dfd2763818bb42d8a3
   JWT_REFRESH_SECRET=6a54c0d74f0c9722e40bdb179bc057932a63e90416c003c03030267c1c5bd0d4
   FRONTEND_URL=https://temporary.vercel.app
   ```
7. Click **Create Web Service**.
8. Wait 1-2 minutes for the build and deployment logs to finish. Once you see:
   ```
   🚀 Server running in production mode on port 5000
   ```
   Copy your Render API service URL (e.g., `https://job-portal-api-xxxx.onrender.com`).

---

### Step 2: Frontend UI Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your repository: **`Jagriti-coder-786/job-portal`**.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build` *(auto-detected)*
   - **Output Directory**: `dist` *(auto-detected)*
5. Open the **Environment Variables** section and add:
   - **`VITE_API_URL`**: `https://<your-render-service>.onrender.com/api`
     *(Replace `<your-render-service>` with the actual URL from Step 1; remember the `/api` suffix)*
   - **`VITE_SOCKET_URL`**: `https://<your-render-service>.onrender.com`
6. Click **Deploy**.
7. Vercel will build the frontend in ~30 seconds. Once complete, copy your live frontend URL (e.g., `https://job-portal-frontend-xxxx.vercel.app`).

---

### Step 3: Link CORS (Frontend ↔ Backend Handshake)

To allow your frontend on Vercel to securely communicate with your backend on Render:

1. Open your backend service on the [Render Dashboard](https://dashboard.render.com/).
2. Click the **Environment** tab on the left menu.
3. Edit the **`FRONTEND_URL`** variable:
   - Change `https://temporary.vercel.app` to your live Vercel URL from Step 2:
     ```env
     FRONTEND_URL=https://job-portal-frontend-xxxx.vercel.app
     ```
   - ⚠️ **Important**: Do **not** include a trailing slash at the end (`/`).
4. Click **Save Changes**. Render will automatically redeploy with the updated CORS policy in ~30 seconds.

---

### Step 4: Verify Your Live Application

Open your Vercel URL in your browser and log in with any of the pre-seeded demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `Admin@123` |
| **Recruiter** | `recruiter@demo.com` | `Demo@123` |
| **Job Seeker** | `seeker@demo.com` | `Demo@123` |

*(If you ever need to re-seed or reset demo data on MongoDB Atlas, run `npm run seed` in your backend directory or from the Render Shell tab).*

---

### Step 5: Optional Media Uploads (Cloudinary)

To enable profile avatar photos and PDF resume uploads:

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
3. In your Render Dashboard → **Environment**, add:
   - `CLOUDINARY_CLOUD_NAME=your_cloud_name`
   - `CLOUDINARY_API_KEY=your_api_key`
   - `CLOUDINARY_API_SECRET=your_api_secret`
4. Click **Save Changes**. File upload features will immediately activate.

---

## 🛠️ Troubleshooting & Tips

- **Initial request takes 30-50 seconds**: Render's free tier spins down web services after 15 minutes of inactivity. When someone visits the site after a pause, the first request wakes up the server. Subsequent requests are fast.
- **CORS Error**: Check browser DevTools console. Ensure `FRONTEND_URL` on Render matches your Vercel domain without trailing `/`.
- **Page refresh returns 404**: Single Page Applications require rewrite rules. `frontend/vercel.json` is already present in your repository to handle routing automatically.
- **Database IP whitelist**: Ensure `0.0.0.0/0` (Allow access from anywhere) is configured in your MongoDB Atlas **Network Access** tab since Render free instances use dynamic IPs.
