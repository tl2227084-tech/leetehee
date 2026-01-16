# Danawa Auto Sales Surge Tracker

## Overview

This is a Korean automotive sales tracking dashboard that monitors and displays "surge" models - vehicles with rapidly increasing sales. The application analyzes data from Danawa (a Korean price comparison site) to calculate and rank car models based on month-over-month sales growth, using a weighted scoring algorithm that considers absolute sales increase, percentage change, and rank movement.

The project supports dual deployment: Express backend for Replit and Netlify Functions for static hosting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with path aliases (`@/` for client source, `@shared/` for shared code)

### Backend Architecture
- **Framework**: Express.js with TypeScript (Replit) / Netlify Functions (Netlify)
- **API Design**: RESTful endpoints under `/api/` prefix
- **Schema Location**: Shared schema in `shared/schema.ts` using Zod for validation
- **Storage Pattern**: In-memory storage with sample data for demonstration

### Key Design Patterns
1. **Shared Types**: Zod schemas in `shared/schema.ts` provide type-safe validation for both frontend and backend
2. **Scoring Algorithm**: Weighted z-score calculation for ranking surge models (55% month-over-month absolute, 35% percentage change, 10% rank movement)
3. **Filter System**: Configurable filters for nation (domestic/export), minimum sales threshold, and new entry exclusion

### Build & Deployment

#### Replit Deployment
- **Development**: `npm run dev` uses tsx for hot-reload on port 5000
- **Production Build**: Custom esbuild script bundles server

#### Netlify Deployment
- **Configuration**: `netlify.toml` in project root
- **Build Command**: `npx vite build`
- **Publish Directory**: `dist/public`
- **Functions Directory**: `netlify/functions`
- **API Redirects**: `/api/*` redirects to `/.netlify/functions/:splat`

To deploy to Netlify:
1. Connect your repository to Netlify
2. Netlify will auto-detect the `netlify.toml` configuration
3. Deploy - frontend is served from `dist/public`, API from Netlify Functions

### API Endpoints
- `GET /api/radar` - Fetch radar entries with filters
  - Query params: `month`, `nation` (domestic/export), `minSales`, `excludeNewEntries`, `limit`
- `GET /api/radar/months` - Get available months

## Data Source

- **Danawa Auto**: Korean automotive sales data source
  - Domestic models: `https://auto.danawa.com/auto/?Month=YYYY-MM-00&Nation=domestic&Tab=Model&Work=record`
  - Import models: `https://auto.danawa.com/auto/?Month=YYYY-MM-00&Nation=export&Tab=Model&Work=record`
  - Data includes: sales volume, market share, month-over-month change, year-over-year change

## UI Framework

- **shadcn/ui**: Pre-built accessible components using Radix UI primitives
- **Tailwind CSS**: Utility-first CSS with custom automotive/professional blue theme
- **Lucide React**: Icon library

## Development Tools

- **Vite**: Frontend build and dev server with HMR
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner (development only)
- **@netlify/functions**: Serverless function support for Netlify deployment
