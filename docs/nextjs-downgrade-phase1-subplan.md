# Phase 1 Sub-Plan: Core Framework Downgrade (Next.js Downgrade)

## Objective
Downgrade Next.js from 16.0.1 to 14.2.22 and React from 19.2.0 to 18.3.1 for Node.js 18 compatibility.

## Detailed Steps

### Step 1.1: Backup Current State
- [ ] Save current `package.json` to `package.json.backup`
- [ ] Document current dependency versions
- [ ] Note any custom configurations

### Step 1.2: Core Framework Updates
**Target Versions:**
- `next`: 16.0.1 → 14.2.22
- `react`: 19.2.0 → 18.3.1
- `react-dom`: 19.2.0 → 18.3.1
- `@types/react`: 19 → 18.3.1
- `@types/react-dom`: 19 → 18.3.1
- `eslint-config-next`: 16.0.1 → 14.2.22
- `@types/node`: 20 → 18 (for compatibility)

### Step 1.3: Clean Installation
- [ ] Remove existing `node_modules` directory
- [ ] Remove `package-lock.json` file
- [ ] Install updated dependencies with `npm install`

### Step 1.4: Basic Compatibility Test
- [ ] Run `npm run type-check` to verify TypeScript compatibility
- [ ] Run `npm run lint` to check for linting issues
- [ ] Attempt basic build with `npm run build`

### Step 1.5: Configuration Assessment
- [ ] Check `next.config.js` for Next.js 16 specific features
- [ ] Review API routes for compatibility
- [ ] Identify any breaking changes requiring fixes

## Validation Criteria
✅ Package.json updated with target versions
✅ Dependencies install without major errors
✅ TypeScript compilation successful
✅ Basic linting passes
✅ No immediate build failures

## Risk Mitigation
- If Next.js 14.2.22 fails: Try 14.2.20 as fallback
- If React 18.3.1 fails: Try 18.2.0 as fallback
- Keep backup for rollback if needed

## Rollback Plan
- Restore `package.json.backup`
- Reinstall original dependencies
- Document specific failure points

## Success Confirmation
- [ ] `npm install` completes successfully
- [ ] `npm run type-check` shows no errors
- [ ] `npm run build` starts without critical failures
- [ ] Basic Next.js functionality accessible

---
**Estimated Duration:** 20-30 minutes
**Critical Success Factor:** Clean installation without dependency conflicts
