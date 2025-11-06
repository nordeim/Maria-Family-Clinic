# Next.js Downgrade Plan: 16.0.1 → 14.2.22 & React 19 → 18.3.1

## Executive Summary
Comprehensive plan to downgrade Next.js and React to Node.js 18 compatible versions to resolve dependency conflicts and enable application execution.

## Current Issues
- **Next.js 16.0.1**: Requires Node.js 20.9.0+ (Current environment: 18.19.0)
- **React 19.2.0**: Requires Node.js 20.9.0+ (Current environment: 18.19.0)
- **Supabase packages**: Require Node.js 20.0.0+ (Current environment: 18.19.0)
- **next-auth beta**: Incompatible peer dependency with Next.js 16

## Target Versions (Node.js 18 Compatible)
- **Next.js**: 14.2.22 (LTS, Node.js 18 compatible)
- **React**: 18.3.1 (Stable, Node.js 18 compatible)
- **React DOM**: 18.3.1 (Stable, Node.js 18 compatible)

## Detailed Downgrade Strategy

### Phase 1: Core Framework Downgrade

#### 1.1 Next.js Dependencies
```json
{
  "next": "14.2.22",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "eslint-config-next": "14.2.22"
}
```

#### 1.2 TypeScript Types
```json
{
  "@types/react": "18.3.1",
  "@types/react-dom": "18.3.1"
}
```

#### 1.3 Next.js Configuration Updates
- Update `next.config.js` for Next.js 14 compatibility
- Remove any Next.js 16 specific features
- Update API route handlers if needed

### Phase 2: Authentication System Downgrade

#### 2.1 Next-Auth Version
```json
{
  "next-auth": "4.24.8"
}
```

#### 2.2 Auth Configuration Updates
- Update `pages/api/auth/[...nextauth].js` for Next.js 14
- Update Prisma adapter compatibility
- Fix any API route changes between versions

### Phase 3: Supabase Compatibility

#### 3.1 Supabase Package Downgrade
```json
{
  "@supabase/supabase-js": "2.39.7"
}
```

#### 3.2 Supabase Edge Functions
- Update edge function code for Node.js 18
- Test Supabase client initialization
- Verify database operations

### Phase 4: tRPC System Downgrade

#### 4.1 tRPC Package Updates
```json
{
  "@trpc/client": "10.45.2",
  "@trpc/next": "10.45.2",
  "@trpc/react-query": "10.45.2",
  "@trpc/server": "10.45.2"
}
```

#### 4.2 tRPC Configuration
- Update server configuration for Next.js 14
- Fix API route handlers
- Test API integration

### Phase 5: Database System Downgrade

#### 5.1 Prisma Updates
```json
{
  "prisma": "5.11.0",
  "@prisma/client": "5.11.0"
}
```

#### 5.2 Database Operations
- Update Prisma schema if needed
- Test database connections
- Verify migration compatibility

### Phase 6: UI Component System

#### 6.1 Radix UI Compatibility
- Radix UI versions should be compatible with React 18
- Test component functionality
- Update any React 19 specific features

#### 6.2 Additional Dependencies
```json
{
  "@tanstack/react-query": "5.28.6",
  "date-fns": "3.3.1"
}
```

### Phase 7: Testing & Validation

#### 7.1 Build System
- Clean install: `rm -rf node_modules package-lock.json`
- Fresh install: `npm install`
- Build test: `npm run build`

#### 7.2 Development Server
- Start server: `npm run dev`
- Test core features
- Verify API endpoints

## Compatibility Matrix

| Package | Current Version | Target Version | Compatibility Notes |
|---------|----------------|----------------|-------------------|
| Next.js | 16.0.1 | 14.2.22 | Major version downgrade |
| React | 19.2.0 | 18.3.1 | Major version downgrade |
| React DOM | 19.2.0 | 18.3.1 | Major version downgrade |
| next-auth | 5.0.0-beta.25 | 4.24.8 | Beta → Stable |
| @types/react | 19 | 18.3.1 | Type definition update |
| @types/react-dom | 19 | 18.3.1 | Type definition update |
| @supabase/supabase-js | 2.46.1 | 2.39.7 | Node.js 18 compatible |
| @trpc/* | 11.0.0-rc.553 | 10.45.2 | RC → Stable |
| prisma | 5.22.0 | 5.11.0 | Minor downgrade |
| @types/node | 20 | 18 | Node version compatible |

## Potential Breaking Changes

### 1. Next.js 14 Specific Changes
- **API Routes**: Some API route patterns may need updates
- **Image Component**: `next/image` may have different configuration options
- **Build Output**: Different build optimization settings
- **Middleware**: Check if custom middleware needs updates

### 2. React 18 Specific Changes
- **Server-Side Rendering**: Some SSR patterns may need adjustment
- **Hooks**: Update any React 19 specific hooks
- **Strict Mode**: React 18 strict mode behavior differences

### 3. Authentication Flow Changes
- **Session Management**: NextAuth.js v4 uses different session handling
- **API Routes**: Authentication API routes may need updates
- **Providers**: Authentication provider configuration changes

## Risk Assessment

### High Risk Areas
1. **NextAuth.js authentication system** - Complete rewrite of auth flow
2. **tRPC API system** - API route compatibility issues
3. **Supabase integration** - Edge function compatibility

### Medium Risk Areas
1. **UI components** - React 18 specific features
2. **Database operations** - Prisma version compatibility
3. **TypeScript types** - Type definition changes

### Low Risk Areas
1. **Styling (Tailwind CSS)** - Minimal impact expected
2. **Component structure** - Most React components should work
3. **Business logic** - Backend logic should remain intact

## Rollback Plan

If downgrade fails:
1. **Git reset** to previous state
2. **Backup current package.json** before changes
3. **Incremental downgrade** - test each major change
4. **Environment isolation** - test in separate branch

## Success Criteria

✅ **Build Success**: `npm run build` completes without errors
✅ **Dev Server**: `npm run dev` starts and serves application
✅ **Core Features**: Doctor scheduling, service search, contact forms work
✅ **API Integration**: tRPC and Supabase endpoints functional
✅ **Authentication**: NextAuth.js login/logout works
✅ **Database**: Prisma queries execute successfully

## Execution Timeline

1. **Phase 1-2** (30 min): Core framework downgrade
2. **Phase 3-4** (45 min): Authentication and tRPC updates
3. **Phase 5-6** (30 min): Database and UI compatibility
4. **Phase 7** (45 min): Testing and validation
5. **Total Estimated Time**: 2.5 hours

## Next Steps

1. **User Approval**: Confirm downgrade strategy
2. **Backup Current State**: Save package.json and node_modules
3. **Execute Plan**: Follow phases sequentially
4. **Test Thoroughly**: Verify each component works
5. **Document Results**: Record any issues and solutions
