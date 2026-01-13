# Task Management System

A production-quality collaborative project management tool built with Next.js, TypeScript, PostgreSQL, and Prisma.

## Features

- ✅ User authentication
- 📋 Kanban boards with drag-and-drop
- 📊 Gantt charts
- 👥 Team collaboration
- 💬 Task comments
- ⏱️ Time tracking
- 📈 Project dashboards

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **UI**: Tailwind CSS + Radix UI
- **State Management**: React Query + Server Actions
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database URL and NextAuth secret.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── kanban/           # Kanban board components
│   ├── gantt/            # Gantt chart components
│   └── dashboard/        # Dashboard components
├── lib/                   # Utilities and configurations
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   └── utils.ts          # Helper functions
└── prisma/                # Prisma schema and migrations
    └── schema.prisma
```

## Database Schema

The application uses Prisma with the following main models:
- User
- Project
- ProjectMember
- Column
- Task
- Subtask
- Comment
- TimeEntry
- FileUpload
- TaskDependency

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations

## License

MIT

