# Phase 4 Sub-Plan: tRPC and Prisma Dependencies Update

## Objective
Downgrade tRPC from release candidate versions to stable versions compatible with Next.js 14, and update Prisma for Node.js 18 compatibility.

## Current Issues
- `tRPC`: 11.0.0-rc.553 (release candidate, Next.js 16 focused)
- `Prisma`: 5.22.0 (newer version, may have Node.js 18 compatibility issues)
- Need stable tRPC versions compatible with Next.js 14

## Detailed Steps

### Step 4.1: tRPC Package Analysis
- [ ] Document current tRPC package versions and dependencies
- [ ] Identify all tRPC packages requiring downgrade
- [ ] Check compatibility with NextAuth v4
- [ ] Assess API breaking changes

### Step 4.2: Target tRPC Version Planning
**Target Versions (Next.js 14 Compatible):**
- `@trpc/client`: 11.0.0-rc.553 → **10.45.2** (stable)
- `@trpc/next`: 11.0.0-rc.553 → **10.45.2** (stable)
- `@trpc/react-query`: 11.0.0-rc.553 → **10.45.2** (stable)
- `@trpc/server`: 11.0.0-rc.553 → **10.45.2** (stable)

### Step 4.3: Prisma Version Analysis
- [ ] Check current Prisma version for Node.js 18 compatibility
- [ ] Identify any engine version conflicts
- [ ] Plan Prisma downgrade if needed

### Step 4.4: Package Updates
- [ ] Update all tRPC packages to stable versions
- [ ] Update Prisma if compatibility issues found
- [ ] Update any related dependencies

### Step 4.5: API Compatibility Review
- [ ] Check tRPC client setup and configuration
- [ ] Review server-side tRPC router implementations
- [ ] Validate React Query integration
- [ ] Test NextAuth-tRPC integration

## tRPC Package Analysis

### Currently Installed (Release Candidate)
```
@trpc/client: ^11.0.0-rc.553
@trpc/next: ^11.0.0-rc.553
@trpc/react-query: ^11.0.0-rc.553
@trpc/server: ^11.0.0-rc.553
```

### Target Versions (Stable)
```
@trpc/client: 10.45.2
@trpc/next: 10.45.2
@trpc/react-query: 10.45.2
@trpc/server: 10.45.2
```

## Prisma Analysis
### Current Version
```
prisma: ^5.22.0
@prisma/client: ^5.22.0
```

### Target Considerations
- Check Node.js 18 compatibility
- Validate database connector compatibility
- Assess migration compatibility

## Key API Changes to Check

### tRPC Client Setup
- Configuration object structure
- React Query integration patterns
- Error handling changes

### Server-Side Implementation
- Router structure and exports
- Middleware compatibility
- Next.js API route integration

### NextAuth Integration
- Session context in tRPC procedures
- Authentication middleware patterns
- Protected procedure configuration

## Files to Review
1. **`src/lib/trpc/`** - tRPC client and server setup
2. **`src/server/`** - tRPC routers and procedures
3. **`src/app/api/trpc/`** - tRPC API route handlers
4. **Database schemas** - Prisma model compatibility

## Risk Assessment
- **Medium Risk**: tRPC API compatibility between RC and stable
- **Low Risk**: Prisma basic functionality
- **Medium Risk**: NextAuth-tRPC integration patterns

## Breaking Changes to Investigate
- [ ] tRPC client initialization
- [ ] React Query provider setup
- [ ] Server router export patterns
- [ ] Error boundary integration
- [ ] Middleware configuration

## Success Criteria
✅ All tRPC packages downgraded to stable versions
✅ No compilation errors in tRPC setup
✅ Client-side tRPC queries functional
✅ Server-side tRPC procedures working
✅ NextAuth integration preserved
✅ Prisma operations functional

## Rollback Plan
- Restore tRPC RC versions from `package.json.backup`
- Revert any tRPC configuration changes
- Document specific breaking changes

---
**Estimated Duration:** 30-45 minutes
**Critical Success Factor:** Maintain tRPC functionality while achieving Next.js 14 compatibility
**Risk Level:** MEDIUM - API differences between RC and stable versions
