# Phase 2 Sub-Plan: Supabase Compatibility Resolution

## Objective
Downgrade Supabase packages from versions requiring Node.js 20+ to Node.js 18 compatible versions.

## Current Issues
- `@supabase/supabase-js`: 2.46.1 requires Node.js 20.0.0+
- Multiple Supabase packages showing "EBADENGINE" warnings
- Supabase Edge Functions may need Node.js 18 compatibility updates

## Detailed Steps

### Step 2.1: Analyze Current Supabase Dependencies
- [ ] Document current Supabase package versions
- [ ] Check compatibility requirements for Node.js 18
- [ ] Identify all Supabase-related packages requiring downgrade

### Step 2.2: Target Supabase Version Planning
**Target Versions (Node.js 18 Compatible):**
- `@supabase/supabase-js`: 2.39.7 (Node.js 18 compatible)
- `@supabase/auth-js`: Downgrade if needed for compatibility
- `@supabase/functions-js`: Downgrade if needed for compatibility
- `@supabase/postgrest-js`: Downgrade if needed for compatibility
- `@supabase/realtime-js`: Downgrade if needed for compatibility
- `@supabase/storage-js`: Downgrade if needed for compatibility

### Step 2.3: Package.json Supabase Updates
- [ ] Update `@supabase/supabase-js` to compatible version
- [ ] Check and update related Supabase packages
- [ ] Verify no breaking changes in API usage

### Step 2.4: Supabase Client Configuration Review
- [ ] Review Supabase client initialization code
- [ ] Check for version-specific API usage
- [ ] Update edge function code if needed

### Step 2.5: Integration Testing Plan
- [ ] Test Supabase connection with downgraded packages
- [ ] Verify database operations work correctly
- [ ] Test authentication flow compatibility
- [ ] Validate edge function deployment compatibility

## Supabase Package Analysis

### Currently Installed Versions
```
@supabase/supabase-js: ^2.46.1
@supabase/auth-js: (included in supabase-js)
@supabase/functions-js: (included in supabase-js) 
@supabase/postgrest-js: (included in supabase-js)
@supabase/realtime-js: (included in supabase-js)
@supabase/storage-js: (included in supabase-js)
```

### Target Versions
```
@supabase/supabase-js: 2.39.7
```

### Breaking Changes to Check
- [ ] API method signatures
- [ ] Configuration options
- [ ] Authentication flow
- [ ] Real-time subscription patterns
- [ ] Storage operation methods

## Risk Assessment
- **High Risk**: Authentication system compatibility
- **Medium Risk**: Real-time features and edge functions
- **Low Risk**: Basic database operations

## Alternative Approaches
If downgrading fails:
1. **Use Supabase CLI** for edge functions
2. **Manual package management** for critical features
3. **Environment upgrade** to Node.js 20 for full compatibility

## Success Criteria
✅ All Supabase packages compatible with Node.js 18
✅ No "EBADENGINE" warnings for Supabase packages
✅ Supabase client initializes successfully
✅ Database operations functional
✅ Authentication flow works
✅ Edge functions deployable

## Rollback Plan
- Restore Supabase packages from `package.json.backup`
- Document specific incompatibility issues
- Consider environment upgrade if needed

---
**Estimated Duration:** 30-45 minutes
**Critical Success Factor:** Maintained Supabase functionality with Node.js 18 compatibility
