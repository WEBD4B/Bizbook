# Comprehensive SaaS Finance Platform

## Overview

This is a comprehensive SaaS financial management platform that serves both personal users and business owners. The application features personal finance tracking, business expense management, tax document generation, sales tax tracking with Shopify integration, and QuickBooks-style financial reporting. It uses PostgreSQL for persistence, Drizzle ORM for database operations, and modern React with TypeScript.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)
- **Major Scope Expansion**: Transformed from personal finance tracker to comprehensive SaaS platform
- **Business Features**: Added business expense tracking, revenue management, and payout tracking
- **Tax Management**: Implemented sales tax tracking, tax document generation, and Shopify integration
- **Enhanced Dashboard**: Full-width layout with comprehensive financial metrics including available cash, available credit, and total liquidity
- **Modern Architecture**: Maintained TypeScript-first approach with shadcn/ui components

## System Architecture

### Full-Stack TypeScript Architecture
The application follows a monorepo structure with shared types and schemas between frontend and backend:
- **Frontend**: React with Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state

### Directory Structure
```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared schemas and types
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Key Components

### Backend Architecture
- **Express Server** (`server/index.ts`): Main application server with middleware setup
- **Route Handler** (`server/routes.ts`): RESTful API endpoints for credit cards and loans
- **Storage Layer** (`server/storage.ts`): Abstract storage interface with in-memory implementation
- **Development Server** (`server/vite.ts`): Vite integration for development mode

### Frontend Architecture
- **React SPA**: Single-page application with client-side routing using wouter
- **Component Library**: shadcn/ui components for consistent UI
- **State Management**: TanStack Query for API state management
- **Responsive Design**: Mobile-first approach with desktop sidebar navigation

### Database Schema
The application uses Drizzle ORM with PostgreSQL dialect:
- **Credit Cards Table**: Tracks balance, credit limit, interest rate, minimum payment, and due dates
- **Loans Table**: Manages loan balances, terms, interest rates, and payment schedules
- **Users Table**: Prepared for future authentication implementation

### Shared Type System
- **Schema Definitions** (`shared/schema.ts`): Drizzle table definitions with Zod validation
- **Type Safety**: Full TypeScript coverage from database to frontend
- **Validation**: Runtime validation using Zod schemas

## Data Flow

### API Communication
1. **Frontend** makes HTTP requests to `/api` endpoints
2. **Backend** validates requests using Zod schemas
3. **Storage Layer** handles data persistence (currently in-memory)
4. **Response** returns JSON data with proper error handling

### State Management
1. **TanStack Query** manages server state and caching
2. **React Hook Form** handles form state and validation
3. **Optimistic Updates** provide responsive user experience
4. **Error Boundaries** catch and display user-friendly errors

### Financial Calculations
- **Payoff Calculations**: Client-side calculations for debt payoff scenarios
- **Debt Visualization**: Pie charts showing debt distribution
- **Credit Utilization**: Real-time calculation of credit card usage

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Data visualization components

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Static type checking
- **ESBuild**: Fast bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer

### Database and Validation
- **Drizzle ORM**: Type-safe database toolkit
- **Neon Database**: Serverless PostgreSQL
- **Zod**: Runtime type validation
- **Connect PG Simple**: PostgreSQL session store

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations run via `npm run db:push`

### Environment Configuration
- **Development**: Uses Vite dev server with HMR
- **Production**: Serves static files from Express server
- **Database**: Requires `DATABASE_URL` environment variable

### Development Workflow
- **Hot Reload**: Frontend changes reflect immediately
- **API Logging**: Request/response logging for debugging
- **Type Checking**: Continuous TypeScript validation
- **Error Overlay**: Runtime error display in development

The architecture prioritizes type safety, developer experience, and scalability while maintaining a clean separation between frontend, backend, and data layers. The in-memory storage can be easily replaced with a full database implementation when needed.