# Illuma Health - Hospital Management System

A modern, secure, and full-stack Hospital Management System (HMS) built with FastAPI, MySQL, and React.

## 🚀 Features

- **Portals**: Dedicated dashboards for Admin, Doctor, Nurse, and Patients.
- **Security**: JWT-based Authentication, Role-Based Access Control (RBAC), and Bcrypt password hashing.
- **Modules**:
  - Appointments & Scheduling
  - Admissions & Ward Management
  - Lab Orders & Abnormal Result Alerts
  - Pharmacy & Inventory Tracking
  - Billing & Finance Summary
  - Automated Diet Plan generation from prescriptions
- **Aesthetics**: Premium Glassmorphism UI with Lavender theme.

## 🛠️ Tech Stack

- **Backend**: FastAPI, SQLAlchemy (ORM), MySQL
- **Frontend**: React 19, Vite, Lucide React
- **Auth**: JWT, Bcrypt, OAuth2 (OAuth2PasswordBearer)

## 📦 Setup & Installation

### 1. Database Setup
1. Install MySQL and create a database named `HospitalManagement`.
2. Run `schema.sql` to create tables.
3. Run `seed.sql` to populate initial data.
   - **Default Staff Password**: `Illuma@2026`

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=mysql+pymysql://root:ROOT@localhost/hospitalmanagement
JWT_SECRET_KEY=generate_a_long_random_string_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Running Locally
Simply double-click the `start_all.bat` file in the root directory. It will:
- Activate the backend virtual environment and start the FastAPI server.
- Start the React development server.

Alternatively, run manually:
**Backend**:
```bash
cd backend
venv\Scripts\activate
pip install -r ../requirements.txt
uvicorn app.main:app --reload
```
**Frontend**:
```bash
cd hms-frontend
npm install
npm run dev
```

## 🌐 Deployment

### Backend (Render)
1. Create a "Web Service" on Render.
2. Link your GitHub repository.
3. Root Directory: `backend`.
4. Build Command: `pip install -r ../requirements.txt`.
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add Environment Variables in the Render dashboard.

### Frontend (Vercel)
1. Create a new project on Vercel.
2. Link your GitHub repository.
3. Root Directory: `hms-frontend`.
4. Vercel will auto-detect Vite. Add `VITE_API_URL` environment variable pointing to your backend.

## 🔒 Security Note
This system follows HIPAA/DPDP guidelines by ensuring:
- No plain-text passwords.
- No public/unauthenticated API access.
- Audit trails via `created_at` timestamps.
- Explicit CORS policy.

## 📄 License
MIT
