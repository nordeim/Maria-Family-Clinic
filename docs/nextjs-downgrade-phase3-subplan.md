# Phase 3 Sub-Plan: NextAuth Beta Version Conflicts Resolution

## Objective
Downgrade NextAuth from 5.0.0-beta.25 to stable 4.24.8 for Next.js 14 compatibility.

## Critical Risk Assessment
**HIGH RISK PHASE**: NextAuth v5 to v4 migration involves significant API changes

## Current Issues
- `next-auth`: 5.0.0-beta.25 (beta version with Next.js 16 requirement)
- `next-auth@5.0.0-beta.25` peer dependency: `next@^14.0.0-0 || ^15.0.0-0`
- Need stable version compatible with Next.js 14.2.22

## Detailed Steps

### Step 3.1: NextAuth Package Analysis
- [ ] Document current NextAuth v5 configuration
- [ ] Identify API routes using NextAuth
- [ ] Analyze authentication providers setup
- [ ] Check Prisma adapter usage

### Step 3.2: Target Version Planning
**Target Version:**
- `next-auth`: 5.0.0-beta.25 → **4.24.8**

**Associated Updates:**
- `@auth/prisma-adapter`: Ensure compatibility with NextAuth v4
- Remove any NextAuth v5 specific features

### Step 3.3: API Routes Migration
**NextAuth v5 → v4 Migration Checklist:**
- [ ] Update `src/app/api/auth/[...nextauth]/route.ts` → `src/pages/api/auth/[...nextauth].js`
- [ ] Change import statements
- [ ] Update export patterns
- [ ] Modify configuration object structure

### Step 3.4: Authentication Configuration Updates
**Changes Required:**
- [ ] Update `src/server/auth.ts` for NextAuth v4 API
- [ ] Modify session strategy if needed
- [ ] Update provider configurations
- [ ] Fix callback function signatures

### Step 3.5: Client-Side Updates
- [ ] Update `SessionProvider` usage
- [ ] Fix `useSession` hook patterns
- [ ] Update authentication page components
- [ ] Modify sign-in/sign-out flows

## Key API Changes (v5 → v4)

### Import Statements
```typescript
// v5 (current)
import NextAuth from 'next-auth'

// v4 (target)
import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
```

### Configuration Object
```typescript
// v5 (current)
export const authConfig = {
  // v5 config structure
}

// v4 (target)
export const authOptions: NextAuthOptions = {
  // v4 config structure
}
```

### API Route Structure
```typescript
// v5 (current)
import { handlers } from '@/server/auth'
export const { GET, POST } = handlers

// v4 (target)
import NextAuth from 'next-auth'
export default NextAuth(authOptions)
```

### Provider Configuration
- OAuth providers: Update provider-specific configurations
- Email provider: Check email sending implementation
- Session callbacks: Update callback function signatures

## Authentication Files to Update
1. **`src/server/auth.ts`** - Main auth configuration
2. **`src/app/api/auth/[...nextauth]/route.ts`** - API route handlers
3. **Client components** - Session provider and hooks usage
4. **Auth pages** - Sign-in/sign-out page components

## Risk Mitigation
### High Risk Areas
- **API Route Migration**: Complete restructure needed
- **Session Management**: Callback signature changes
- **Provider Configuration**: OAuth and email provider updates
- **Client Integration**: Session provider refactoring

### Fallback Strategy
If migration fails:
1. **Partial Migration**: Keep core NextAuth v4, add v5 features incrementally
2. **Alternative Auth**: Consider other authentication solutions
3. **Manual Implementation**: Custom auth with Supabase Auth

## Testing Strategy
- [ ] Test basic authentication flow (sign in/out)
- [ ] Verify OAuth providers work correctly
- [ ] Check session persistence across pages
- [ ] Validate session callbacks and JWT handling
- [ ] Test protected route middleware

## Success Criteria
✅ NextAuth v4.24.8 installed successfully
✅ Authentication API routes functional
✅ OAuth providers (Google) working
✅ Session management operational
✅ Email provider functional
✅ Client-side auth integration working
✅ No TypeScript compilation errors

## Rollback Plan
- Restore NextAuth v5 from `package.json.backup`
- Revert all API route and configuration changes
- Document specific breaking points for future reference

## Estimated Impact
- **API Routes**: Complete restructure required
- **Configuration**: Moderate updates needed
- **Client Integration**: Minor to moderate updates
- **Testing**: Extensive validation required

---
**Estimated Duration:** 60-90 minutes
**Critical Success Factor:** Maintain authentication functionality while achieving Next.js 14 compatibility
**Risk Level:** HIGH - Requires careful testing and validation
