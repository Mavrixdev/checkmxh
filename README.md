# Phone Lookup Dashboard

A premium, production-ready phone information lookup and admin monitoring dashboard built with Next.js 16, featuring a cinematic design with glassmorphism effects and real-time data monitoring.

## Features

### Landing Page
- **Advanced Search**: Beautiful search interface with phone number validation and search history
- **Multi-source Results**: Display information from Facebook, Telegram, Zalo, banking data, and scam detection
- **Real-time Feedback**: Loading states, error handling, and cached result indicators
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Admin Dashboard
- **Session-based Authentication**: Secure login with password-protected admin area
- **System Monitoring**: Real-time health status, uptime tracking, and queue monitoring
- **Statistics Dashboard**: Track total lookups, cache hits, fresh scans, and scammer detections
- **Recent Activity**: View latest lookup history with detailed information
- **Database Connection Status**: Monitor MongoDB connection status

### Design System
- **Dark Mode First**: Professional dark theme with cyan/blue accents
- **Glassmorphism**: Modern UI with blur effects and transparent cards
- **Smooth Animations**: Framer Motion transitions and micro-interactions
- **Premium Polish**: Apple/Tesla-inspired spacing and shadows

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom utilities
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Charts**: Recharts

## Project Structure

```
/app
  /admin
    /login          # Admin login page
    page.tsx        # Admin dashboard
  layout.tsx        # Root layout with providers
  page.tsx          # Landing page
  globals.css       # Global styles and design tokens
  providers.tsx     # React Query setup

/components
  /admin            # Admin-specific components
    health-widget.tsx
    stats-card.tsx
    latest-lookups.tsx
  /ui              # shadcn/ui components
  search-input.tsx # Search component
  result-card.tsx  # Results display component

/lib
  api.ts           # API client and endpoints
  store.ts         # Zustand stores
  utils-dashboard.ts # Utility functions

/hooks
  useLookup.ts     # Phone lookup hook
  useAdminData.ts  # Admin data hooks

/types
  index.ts         # TypeScript type definitions
```

## Environment Setup

### Requirements
- Node.js 18+
- pnpm (or npm/yarn)
- Running backend server (Express.js with APIs)

### Installation

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Create `.env.local` file:
```env
# API Configuration - Update to match your backend server
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
pnpm dev
```

4. Open http://localhost:3000 in your browser

## Backend API Integration

This frontend integrates with the provided Express.js backend. The API endpoints used are:

### Public Endpoints
- `GET /api/check-all` - Perform comprehensive phone lookup
- `GET /api/check-bank` - Lookup banking information

### Admin Endpoints (requires authentication)
- `POST /api/login` - Admin login
- `GET /api/logout` - Admin logout
- `GET /api/stats` - Get system statistics
- `GET /api/health` - Get system health status
- `GET /api/latest` - Get recent lookups
- `GET /api/logs` - Get system logs
- `GET /api/search` - Search database
- `GET /api/clear-cache` - Clear cache
- `GET /api/export` - Export data

## Usage

### Searching for Phone Information
1. Enter a phone number in the search input
2. Press Enter or click Search button
3. View results across multiple cards (Facebook, Telegram, Banking, etc.)
4. Recent searches appear in dropdown history

### Admin Dashboard
1. Navigate to `/admin`
2. Enter the admin password on login page
3. View system statistics and real-time monitoring
4. Track queue status and latest lookups
5. Monitor database and service health

## API Configuration

Update the `NEXT_PUBLIC_API_URL` in `.env.local` to point to your backend server:

```env
NEXT_PUBLIC_API_URL=http://your-backend-url:5000
```

The client automatically includes credentials in all requests for cookie-based session management.

## Authentication

The admin dashboard uses simple session-based authentication:
- Password is checked server-side against `ADMIN_PASS` environment variable
- Session ID is stored in HTTP-only cookie
- Sessions persist for 24 hours

## Performance Optimizations

- **React Query Caching**: Automatic caching and revalidation of API responses
- **Lazy Loading**: Components load on demand
- **Optimized Queries**: Stale time and garbage collection configured
- **Shimmer Loading**: Skeleton screens for better perceived performance

## Styling & Customization

### Design Tokens
Edit colors in `app/globals.css` for consistency across the app:
- Primary: Cyan/Blue gradient
- Backgrounds: Dark slate tones
- Accents: Cyan glow effects

### Tailwind Configuration
Tailwind CSS is configured in `tailwind.config.ts` with custom utilities and semantic tokens.

### Adding New Components
Use the provided pattern for creating new components:
```tsx
'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export function MyComponent() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="glass border-glow p-6">
        {/* Content */}
      </Card>
    </motion.div>
  );
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Production Deployment

1. Set environment variables on your hosting platform
2. Ensure backend API URL is accessible from your deployment
3. Build and deploy:
```bash
pnpm build
pnpm start
```

## Troubleshooting

### "API Connection Failed"
- Verify `NEXT_PUBLIC_API_URL` is correct and accessible
- Check backend server is running
- Check CORS settings on backend

### "Admin Login Not Working"
- Verify password matches server's `ADMIN_PASS`
- Check cookies are enabled in browser
- Verify backend login endpoint is working

### "No Search Results"
- Check phone number format is valid
- Verify backend APIs are responding
- Check browser console for API errors

## Development Notes

- Use `console.log("[v0] ...")` for debugging
- TypeScript strict mode is enabled
- All components are client-side to support interactivity
- React Query DevTools available in development

## License

Created with v0.app

## Support

For issues or feature requests, contact development team or check backend documentation.
