# Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Installation Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment Variables**

   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager?schema=public"
     NEXTAUTH_URL="http://localhost:3000"
     NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
     ```
   - Generate a secure `NEXTAUTH_SECRET` using:
     - **Windows (PowerShell)**: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
     - **Linux/Mac**: `openssl rand -base64 32`

3. **Set Up Database**

   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database (for development)
   npm run db:push

   # OR create a migration (for production)
   npm run db:migrate
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

5. **Open the Application**
   - Navigate to `http://localhost:3000`
   - You'll be redirected to the login page
   - Create an account using the registration page

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── projects/        # Projects list and detail
│   │   ├── tasks/           # Task detail pages
│   │   └── gantt/           # Gantt chart views
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── projects/       # Project CRUD
│   │   ├── tasks/          # Task CRUD
│   │   ├── comments/       # Comment management
│   │   ├── time-entries/   # Time tracking
│   │   ├── subtasks/       # Subtask management
│   │   └── columns/        # Column management
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                 # Base UI components
│   ├── dashboard/          # Dashboard components
│   ├── projects/           # Project components
│   ├── kanban/             # Kanban board components
│   ├── gantt/              # Gantt chart components
│   └── tasks/              # Task components
├── lib/                     # Utilities and configurations
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth configuration
│   └── utils.ts            # Helper functions
└── prisma/                  # Database schema
    └── schema.prisma
```

## Key Features

### ✅ Implemented Features

1. **User Authentication**

   - Registration and login
   - Session management with NextAuth
   - Protected routes with middleware

2. **Project Management**

   - Create, read, update, delete projects
   - Project archiving
   - Project members with roles (admin, editor, viewer)
   - Project colors

3. **Kanban Board**

   - Drag-and-drop tasks between columns
   - Multiple columns per project
   - Task ordering within columns
   - Real-time updates

4. **Task Management**

   - Full CRUD operations
   - Task priorities (low, medium, high, urgent)
   - Due dates
   - Task assignment
   - Tags
   - Markdown descriptions

5. **Task Details**

   - Rich text description (Markdown)
   - Subtasks with completion tracking
   - Comments with Markdown support
   - Time tracking
   - File attachments (schema ready)

6. **Gantt Chart**

   - Timeline view of tasks
   - Visual representation of task durations
   - Date-based positioning

7. **Dashboard**

   - Project statistics
   - Task statistics
   - Charts (bar chart, pie chart)
   - Time tracking summary

8. **Time Tracking**
   - Start/stop timer
   - Manual time entry
   - Time entry history
   - Total time per task

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Projects

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks

- `GET /api/tasks?projectId=...` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/[id]` - Get task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `PATCH /api/tasks/[id]/move` - Move task (drag-and-drop)

### Comments

- `POST /api/comments` - Create comment
- `PATCH /api/comments/[id]` - Update comment
- `DELETE /api/comments/[id]` - Delete comment

### Time Entries

- `GET /api/time-entries` - List time entries
- `POST /api/time-entries` - Create time entry
- `PATCH /api/time-entries/[id]` - Update time entry
- `DELETE /api/time-entries/[id]` - Delete time entry

### Subtasks

- `POST /api/subtasks` - Create subtask
- `PATCH /api/subtasks/[id]` - Update subtask
- `DELETE /api/subtasks/[id]` - Delete subtask

### Columns

- `POST /api/columns` - Create column
- `PATCH /api/columns/[id]` - Update column
- `DELETE /api/columns/[id]` - Delete column

## Database Schema

The application uses Prisma with PostgreSQL. Key models:

- **User** - User accounts
- **Project** - Projects
- **ProjectMember** - Project membership with roles
- **Column** - Kanban columns
- **Task** - Tasks
- **Subtask** - Task subtasks
- **Comment** - Task comments
- **TimeEntry** - Time tracking entries
- **FileUpload** - File attachments
- **TaskDependency** - Task dependencies for Gantt chart

## Development

### Running Prisma Studio

```bash
npm run db:studio
```

### Creating Migrations

```bash
npm run db:migrate
```

### Building for Production

```bash
npm run build
npm start
```

## Notes

- The application uses React Query for server state management
- Drag-and-drop is implemented with @dnd-kit
- Charts are rendered with Recharts
- UI components are built with Radix UI and Tailwind CSS
- Markdown rendering uses react-markdown
- All API routes are protected and verify user permissions

## Next Steps (Optional Enhancements)

- [ ] Add real-time collaboration with Pusher/WebSockets
- [ ] Implement file upload to S3 or similar
- [ ] Add email notifications
- [ ] Add task dependencies UI in Gantt chart
- [ ] Add user profile pages
- [ ] Add project templates
- [ ] Add task filters and search
- [ ] Add export functionality (PDF, CSV)
- [ ] Add dark mode toggle
- [ ] Add mobile responsive improvements
