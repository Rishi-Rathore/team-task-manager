# TaskFlow — Team Task Manager

A full-stack collaborative task management web application built with **React**, **Node.js/Express**, and **MongoDB**. A simplified version of tools like Trello or Asana where teams can manage projects and tasks efficiently.

---

## 🚀 Live Demo

> Deployed on Railway — [Add your live URL here after deployment]

---

## 📸 Screenshots

| Login | Dashboard | Projects | Tasks |
|-------|-----------|----------|-------|
| ![login](https://via.placeholder.com/200x120?text=Login) | ![dashboard](https://via.placeholder.com/200x120?text=Dashboard) | ![projects](https://via.placeholder.com/200x120?text=Projects) | ![tasks](https://via.placeholder.com/200x120?text=Tasks) |

---

## ✨ Features

### 🔐 User Authentication
- Signup with Name, Email, and Password
- Secure login using **JWT (JSON Web Token)**
- Protected routes — only logged-in users can access the app
- Token stored in localStorage with auto-expiry (7 days)

### 📁 Project Management
- Create projects — creator automatically becomes **Admin**
- Admin can **add members** by their registered email
- Admin can **remove members** from the project
- Members can only view projects they are assigned to
- Each project shows member count, creation date, and your role

### ✅ Task Management
- Create tasks with:
  - **Title** (required)
  - **Description**
  - **Due Date**
  - **Priority** — Low / Medium / High
  - **Status** — To Do / In Progress / Done
  - **Assigned To** — any project member
- Admin can create, edit, and delete tasks
- Members can update the status of their own assigned tasks
- Overdue tasks are highlighted in red

### 📊 Dashboard
- Total projects and tasks count
- Tasks breakdown by status with progress bars
- Tasks assigned per team member
- Overdue tasks list
- Recent tasks overview

### 🔒 Role-Based Access Control

| Action | Admin | Member |
|--------|-------|--------|
| Create / Edit / Delete tasks | ✅ | ❌ |
| Update status of assigned tasks | ✅ | ✅ |
| Add / Remove members | ✅ | ❌ |
| View all project tasks | ✅ | ❌ |
| View own assigned tasks | ✅ | ✅ |
| Delete project | ✅ | ❌ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, React Hot Toast |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT + bcryptjs (salt rounds: 12) |
| Build Tool | Vite |
| Deployment | Railway |

---

## 📁 Project Structure

```
team-task-manager/
├── server/                        # Express Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # JWT verification
│   │   │   └── role.middleware.js     # Admin/Member check
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── task.routes.js
│   │   │   └── dashboard.routes.js
│   │   └── index.js               # App entry point
│   ├── .env.example
│   ├── package.json
│   └── railway.toml
│
└── client/                        # React Frontend
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance with interceptors
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── components/
    │   │   └── Layout.jsx         # Sidebar + topbar layout
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   ├── ProjectDetailPage.jsx
    │   │   └── TaskDetailPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    └── railway.toml
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free) or local MongoDB

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd server
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/team-task-manager
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

```bash
npm install
npm run dev
```

Server runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd client
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login & get JWT | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | Get all user's projects | Private |
| POST | `/api/projects` | Create new project | Private |
| GET | `/api/projects/:id` | Get project details | Member |
| PUT | `/api/projects/:id` | Update project | Admin |
| DELETE | `/api/projects/:id` | Delete project + tasks | Admin |
| POST | `/api/projects/:id/members` | Add member by email | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/tasks` | Create task | Admin |
| GET | `/api/tasks/project/:projectId` | Get project tasks | Member |
| GET | `/api/tasks/:id` | Get task details | Member |
| PUT | `/api/tasks/:id` | Update task | Admin / Member* |
| DELETE | `/api/tasks/:id` | Delete task | Admin |

*Members can only update the status of their own assigned tasks.

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard` | Get stats & overview | Private |

---

## 🗄️ Database Schema

### User
```
name       String  (required, 2-50 chars)
email      String  (unique, required)
password   String  (hashed with bcrypt, salt: 12)
createdAt  Date
updatedAt  Date
```

### Project
```
name        String   (required, 2-100 chars)
description String
createdBy   ObjectId → User
members     [{ user: ObjectId → User, role: 'Admin' | 'Member' }]
createdAt   Date
updatedAt   Date
```

### Task
```
title       String   (required, 2-150 chars)
description String
project     ObjectId → Project  (required)
assignedTo  ObjectId → User
createdBy   ObjectId → User
status      'To Do' | 'In Progress' | 'Done'
priority    'Low' | 'Medium' | 'High'
dueDate     Date
createdAt   Date
updatedAt   Date
```

---

## 🚀 Deployment on Railway

### Step 1 — MongoDB Atlas
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free cluster
2. Create a database user with username & password
3. Allow network access from anywhere (`0.0.0.0/0`)
4. Copy the connection string

### Step 2 — Deploy Backend
1. Go to [railway.app](https://railway.app) → Login with GitHub
2. New Project → Deploy from GitHub repo
3. Set **Root Directory** to `team-task-manager/server`
4. Add environment variables:
```
MONGO_URI     = mongodb+srv://...
JWT_SECRET    = your_strong_secret
JWT_EXPIRES_IN = 7d
CLIENT_URL    = https://your-frontend.railway.app
```
5. Railway auto-detects `railway.toml` and runs `node src/index.js`

### Step 3 — Deploy Frontend
1. New Service in same Railway project → same repo
2. Set **Root Directory** to `team-task-manager/client`
3. Add environment variable:
```
VITE_API_URL = https://your-backend.railway.app/api
```
4. Railway runs `npm run build` and serves the `dist/` folder

### Step 4 — Update CORS
- Go back to backend service → update `CLIENT_URL` to your frontend Railway URL
- Redeploy backend

---

## 🔐 Security Features
- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens with configurable expiry
- All sensitive routes protected with auth middleware
- Role-based authorization on every endpoint
- Input validation with Mongoose schema validators
- Global error handler — no stack traces exposed in production
- CORS configured for specific origins only

---

## 👤 How to Use

### As Admin
1. Sign up and create a new project
2. Go to **Members** tab → Add members by their registered email
3. Go to **Tasks** tab → Create tasks, assign to members, set priority & due date
4. Monitor progress on the **Dashboard**

### As Member
1. Sign up with your email
2. Ask the Admin to add you to the project
3. Login → You will see projects you are assigned to
4. Open a project → View your assigned tasks
5. Update task status as you progress (To Do → In Progress → Done)

---

## 📋 Submission

- **Live URL:** [Add Railway frontend URL]
- **GitHub Repository:** [Add GitHub URL]
- **Demo Video:** [Add 2-5 minute demo video link]

---

## 📄 License

MIT License — feel free to use and modify.
