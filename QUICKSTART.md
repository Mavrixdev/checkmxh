# Quick Start Guide

## Get Started in 3 Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create `.env.local` and set your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

### Search for Phone Information
1. Enter a phone number (10-15 digits)
2. Press Enter or click Search
3. View results from multiple sources

### Access Admin Dashboard
1. Click **Admin Dashboard** button on landing page
2. Or navigate directly to `/admin`
3. Enter your admin password
4. Monitor system health and recent lookups

---

## Backend Requirements

This frontend requires a running Express.js backend with the following endpoints:

### Required APIs
- `GET /api/check-all?phone=<number>` - Main lookup
- `GET /api/check-bank?phone=<number>` - Bank info
- `POST /api/login` - Admin auth
- `GET /api/logout` - Sign out
- `GET /api/stats` - Statistics
- `GET /api/health` - System status
- `GET /api/latest?limit=10` - Recent lookups
- `GET /api/logs?limit=50` - System logs
- `GET /api/search?q=<query>` - Database search
- `GET /api/clear-cache` - Clear cache
- `GET /api/export` - Export data

---

## Project Structure

```
/app                    - Next.js app directory
/components            - React components
/lib                   - Utilities, API, store
/hooks                 - Custom React hooks
/types                 - TypeScript definitions
/public                - Static assets
```

---

## Common Tasks

### Add a New Page
1. Create file: `app/features/page.tsx`
2. Export a default component
3. File-based routing works automatically

### Create a New Component
1. Create: `components/my-component.tsx`
2. Use `'use client'` for interactivity
3. Import and use in pages

### Add API Call
1. Add endpoint to `lib/api.ts`
2. Create hook in `hooks/`
3. Use hook in components

### Update Styles
1. Edit `app/globals.css` for global styles
2. Use Tailwind classes in JSX
3. Use CSS variables for theming

---

## Environment Variables

### Required
- `NEXT_PUBLIC_API_URL` - Backend API base URL

### Optional
- `NODE_ENV` - Production/Development mode

---

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
pnpm dev -- -p 3001
```

### Dependencies Issue
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors
```bash
# Rebuild types
pnpm tsc --noEmit
```

### Styling Not Applied
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```

---

## Deployment

### Vercel (Recommended)
```bash
# Connect repository and deploy
git push
```

### Self-Hosted
```bash
pnpm build
pnpm start
```

Set environment variables in your hosting platform before deploying.

---

## Performance Tips

1. **Search Optimization**
   - Results are cached for 5 minutes
   - Repeated searches use cache immediately

2. **Admin Dashboard**
   - Stats refresh every 30 seconds
   - Health check every 15 seconds
   - Configure intervals in `hooks/useAdminData.ts`

3. **Development**
   - Use React Query DevTools
   - Monitor network requests
   - Check bundle size

---

## Next Steps

1. Read the full [README.md](./README.md)
2. Check [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md)
3. Review backend API documentation
4. Customize design tokens in `app/globals.css`
5. Deploy to production

---

## Support

For issues:
1. Check error messages in browser console
2. Verify backend is running
3. Check environment variables
4. Review console logs
5. Check network requests in DevTools

Good luck with your phone lookup dashboard!
