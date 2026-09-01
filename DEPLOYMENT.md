# Production Deployment Guide

Deploy the Job Portal full-stack application to production using **MongoDB Atlas**, **Render** (Backend API), and **Vercel** (Frontend SPA).

---

## Quick Reference: Environment Variables

Before starting, keep these key rules in mind:

- **Local Development**: Your local `.env` files already have working defaults (`localhost`). You do not need to edit them right now.
- **Production Git**: Never commit `.env` files to GitHub. You will paste environment variables directly into Render and Vercel dashboards.
- **Minimal Launch Setup**: You only need **4 variables** to launch the app live:
  - Backend: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`
  - Frontend: `VITE_API_URL`
  *(Cloudinary and Gemini AI are optional and can be plugged in later at any time).*

---

## Deployment Steps

```
[ Step 1: MongoDB Atlas ] ──> [ Step 2: Render API ] ──> [ Step 3: Vercel UI ] ──> [ Step 4: Link CORS ]
```

---

### Step 1: Database Setup (MongoDB Atlas)

1. **Create Free Cluster**:
   - Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Click **Create**, select the **M0 Free** tier, and choose your preferred region.

2. **Add Database User**:
   - Go to **Security** → **Database Access** → **Add New Database User**.
   - Select **Password** authentication.
   - Enter a username (e.g., `jobportal_admin`) and a secure password.
   - Set privileges to **Read and write to any database**, then save.

3. **Whitelist Network Access**:
   - Go to **Security** → **Network Access** → **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *Note: Render's free tier uses dynamic outgoing IPs, so 0.0.0.0/0 is required.*

4. **Copy Connection String**:
   - Go to **Database** → **Deployments** → **Connect** → **Drivers** (Node.js).
   - Copy the SRV URI and replace `<username>` and `<password>`:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/jobportal?retryWrites=true&w=majority
     ```

---

### Step 2: Backend API Deployment (Render)

1. **Create Service**:
   - Sign in to [Render](https://render.com/) and click **New +** → **Web Service**.
   - Connect your GitHub repository.

2. **Configure Service**:
   - **Name**: `job-portal-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

3. **Add Environment Variables**:
   In the **Environment** section of the Render dashboard, add:

   **Required to Boot:**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/jobportal?retryWrites=true&w=majority
   JWT_SECRET=super_secret_jwt_random_key_min_32_characters
   JWT_REFRESH_SECRET=super_secret_refresh_key_min_32_characters
   FRONTEND_URL=https://temporary.vercel.app
   ```
   *(You will update `FRONTEND_URL` in Step 4 once Vercel gives you your frontend URL).*

   **Optional (Can add later):**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GEMINI_API_KEY=your_gemini_key
   ```

4. **Deploy**:
   - Click **Create Web Service**.
   - Once logs indicate `Server running on port 5000`, copy your backend URL (e.g., `https://job-portal-api.onrender.com`).

---

### Step 3: Frontend UI Deployment (Vercel)

1. **Import Project**:
   - Sign in to [Vercel](https://vercel.com/) and click **Add New...** → **Project**.
   - Import your GitHub repository.

2. **Configure Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Add Environment Variables**:
   In the Vercel **Environment Variables** section, add:
   - `VITE_API_URL` = `https://job-portal-api.onrender.com/api` *(Your Render URL + `/api`)*
   - `VITE_SOCKET_URL` = `https://job-portal-api.onrender.com` *(Your Render URL, optional)*

4. **Verify SPA Routing (`vercel.json`)**:
   Ensure `frontend/vercel.json` exists in your code to prevent 404s when refreshing pages:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

5. **Deploy**:
   - Click **Deploy**.
   - Once complete, copy your live frontend URL (e.g., `https://job-portal-frontend.vercel.app`).

---

### Step 4: Link Frontend & Backend (CORS Handshake)

To allow the frontend to communicate with the backend securely:

1. Open your backend service on **Render Dashboard**.
2. Go to **Environment** tab.
3. Update `FRONTEND_URL` with your actual Vercel URL (do **not** include a trailing slash):
   ```env
   FRONTEND_URL=https://job-portal-frontend.vercel.app
   ```
4. Click **Save Changes**. Render will automatically redeploy with the updated CORS rule.

---

### Step 5: Seed Demo Data (Optional)

To populate your live database with sample companies, job listings, and test accounts:

- **Via Render Shell**:
  1. Open your backend service in Render.
  2. Click the **Shell** tab on the left menu.
  3. Run `npm run seed`.

**Pre-seeded Demo Logins:**
- **Admin**: `admin@demo.com` / `Admin@123`
- **Recruiter**: `recruiter@demo.com` / `Demo@123`
- **Job Seeker**: `seeker@demo.com` / `Demo@123`

---

### Step 6: Media Storage Setup (Cloudinary) — *Add Later*

When you are ready to enable user resume PDF uploads and profile picture changes:

1. Sign up at [Cloudinary](https://cloudinary.com/).
2. Copy **Cloud Name**, **API Key**, and **API Secret** from your dashboard.
3. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to your Render environment variables.
4. Render will redeploy and uploads will become active immediately.

---

## Environment Variables Summary

### Backend (Set in Render Dashboard)
| Variable | Status | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | Required | Set to `production` |
| `PORT` | Required | Set to `5000` |
| `MONGODB_URI` | Required | MongoDB Atlas connection string |
| `JWT_SECRET` | Required | Secret for signing auth tokens (32+ chars) |
| `JWT_REFRESH_SECRET` | Required | Secret for refresh tokens (32+ chars) |
| `FRONTEND_URL` | Required | Vercel frontend URL for CORS (no trailing `/`) |
| `CLOUDINARY_*` | Optional / Later | For avatar and resume PDF uploads |
| `GEMINI_API_KEY` | Optional / Later | For AI-assisted features |

### Frontend (Set in Vercel Dashboard)
| Variable | Status | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | Required | Backend API endpoint (must end in `/api`) |
| `VITE_SOCKET_URL` | Optional | Backend URL for real-time WebSocket connection |

---

## Troubleshooting

- **First request takes 30-50 seconds**: Render's free tier spins down after 15 minutes of inactivity. The initial wake-up delay is normal.
- **CORS error in browser console**: Verify `FRONTEND_URL` in Render matches your Vercel URL exactly with **no trailing slash** (`https://myapp.vercel.app`).
- **404 error when refreshing pages on Vercel**: Ensure `frontend/vercel.json` exists in your repository with rewrite rules to `/index.html`.
- **Database connection failed**: Check that `0.0.0.0/0` is allowed under MongoDB Atlas Network Access.
