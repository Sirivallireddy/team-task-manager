# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

## Features

- **Authentication**: Secure signup/login with JWT tokens
- **Project Management**: Create, update, and manage projects
- **Task Management**: Create, assign, and track tasks with priorities and due dates
- **Team Collaboration**: Add team members to projects with role-based permissions
- **Dashboard**: Overview of tasks, projects, and overdue items
- **Role-Based Access Control**: Admin and Member roles with different permissions

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL with Sequelize ORM
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- React Hot Toast for notifications

## Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   └── index.js        # Entry point
│   ├── .env.example
│   ├── package.json
│   └── railway.toml
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── railway.toml
└── README.md
```

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=team_task_manager
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

5. Create PostgreSQL database:
```sql
CREATE DATABASE team_task_manager;
```

6. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/deactivate` - Deactivate user
- `PUT /api/users/:id/reactivate` - Reactivate user

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/members` - Get project members
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Tasks
- `GET /api/tasks/my-tasks` - Get tasks assigned to user
- `GET /api/tasks/overdue` - Get overdue tasks
- `POST /api/tasks/project/:projectId` - Create task
- `GET /api/tasks/project/:projectId` - Get project tasks
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/assign` - Assign task

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Deployment on Railway

### Deploy Backend

1. Create a new project on [Railway](https://railway.app)

2. Add PostgreSQL database:
   - Click "New" > "Database" > "PostgreSQL"

3. Deploy backend:
   - Click "New" > "GitHub Repo"
   - Select your repository
   - Set root directory to `backend`

4. Add environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your_production_secret`
   - `JWT_EXPIRES_IN=7d`
   - `FRONTEND_URL=https://your-frontend-url.railway.app`
   - Railway auto-provides `DATABASE_URL`

### Deploy Frontend

1. In the same Railway project, add another service:
   - Click "New" > "GitHub Repo"
   - Select your repository
   - Set root directory to `frontend`

2. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.railway.app/api`

3. Update build command in Railway settings if needed

## Role-Based Permissions

### Admin
- Manage all users (update roles, activate/deactivate)
- Access all projects
- Full CRUD on all resources

### Member
- Create and manage own projects
- Access projects they're members of
- Create and manage tasks in their projects
- View other users (limited info)

### Project Admin (within a project)
- Add/remove team members
- Update project settings
- Full control over project tasks

### Project Member (within a project)
- View project details
- Create and manage tasks
- Update task status

## Screenshots

The application includes:
- Login/Register pages with form validation
- Dashboard with statistics and charts
- Projects list with progress indicators
- Project details with task management
- Task board with status updates
- User management (admin only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License
