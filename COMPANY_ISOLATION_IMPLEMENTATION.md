# Company-Based Data Isolation Implementation Guide

## Overview

This implementation enforces company-level data isolation in your Firestore database to prevent users from accessing or modifying data belonging to other companies.

### What Was Fixed

**Vulnerabilities Addressed:**
1. ✅ **updatePerson()** - Now validates that the person belongs to the current user's company before updating
2. ✅ **deletePerson()** - Now validates ownership before deletion (prevents IDOR attacks)
3. ✅ **deleteMultiplePersons()** - Now batch-validates that all persons belong to current company before bulk deletion

**Security Improvements:**
- All CRUD operations now verify `companyId` ownership at the application layer
- Firestore Security Rules enforce access control at the database layer (defense-in-depth)
- Users cannot modify or access data from other companies even if they know the document ID

---

## Phase 1: Application Layer ✅ COMPLETE

### Changes Made

**File: `src/store/personStore.ts`**
- Added `getDoc` import to verify document ownership
- Modified function signatures:
  - `updatePerson(id, input, companyId)` → now requires companyId
  - `deletePerson(id, companyId)` → now requires companyId
  - `deleteMultiplePersons(ids, companyId)` → now requires companyId
  
- Added validation logic:
  - Each function now calls `getDoc()` to fetch the person record
  - Verifies `person.companyId === companyId` before proceeding
  - Throws `Unauthorized` error if validation fails

**File: `src/hooks/usePersons.ts`**
- Updated hook to wrap store functions and inject `companyId` automatically
- Developers using the hook don't need to pass `companyId` manually
- The hook reads companyId from `useAuthStore()` context

### Result
- Application now prevents IDOR attacks at the code level
- Error messages clearly indicate authorization failures
- TypeScript types enforce proper usage

---

## Phase 2: Database Layer Security Rules 📋 READY TO DEPLOY

### File: `firestore.rules`

A new Firestore Security Rules file has been created with:

**Person Records Protection:**
```
- READ: User can read only if person.companyId == user.companyId
- CREATE: Person must be created with user's companyId
- UPDATE: Update allowed only if companyId doesn't change (prevent company hopping)
- DELETE: User can delete only if person.companyId == user.companyId
- LIST: Query allowed (client-side filtering by companyId happens automatically)
```

**Companies Collection:**
- Only authenticated users belonging to the company can read

**Users Collection:**
- Users can read their own profile
- Cannot directly modify (only via admin SDK)

**Invitations Collection:**
- Cannot be directly modified by clients (admin SDK only)

---

## 🚀 Deployment Instructions

### Step 1: Deploy Firestore Security Rules

#### Option A: Using Firebase CLI (Recommended)

```bash
# 1. Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase in your project (if not done)
firebase init

# 4. Deploy the rules
firebase deploy --only firestore:rules
```

#### Option B: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` and paste into the console
5. Click **Publish**

### Step 2: Configure Custom Claims (Required)

For the Security Rules to work, you need to set custom claims on user tokens. This is done in your backend/admin SDK:

```typescript
// In your backend (Node.js Admin SDK example)
import admin from 'firebase-admin';

admin.initializeApp();

// After user registration or login, set custom claims
export const setUserCompanyClaims = async (uid: string, companyId: string, role: string) => {
  await admin.auth().setCustomUserClaims(uid, {
    companyId,
    role, // 'admin' or 'collaborator'
  });
};
```

**When to set claims:**
- After user registration (set their company)
- After company creation (set creator as admin)
- After user invitation acceptance (set company and role)

### Step 3: Verify Custom Claims

Check that custom claims are being set correctly:

```typescript
const user = await admin.auth().getUser(uid);
console.log(user.customClaims);
// Should output: { companyId: "company-id-here", role: "admin" }
```

### Step 4: Test the Rules

#### Manual Test in Firebase Console:

1. Go to Firestore Database → **Rules** tab
2. Click **Test Rules** (or use **Firestore Emulator** for local testing)
3. Create a test case:
   - **UID**: Create a test user ID
   - **Custom Claims**: `{"companyId": "test-company-1", "role": "admin"}`
   - **Method**: `get`
   - **Path**: `/persons/person-id-from-company-1`
   - **Result**: ✅ Should **ALLOW** (user in same company)

4. Test unauthorized access:
   - Same setup but test path from different company
   - **Result**: ❌ Should **DENY**

#### Via Application:

1. Start your dev server: `npm run dev`
2. Login as User A (Company 1)
3. In browser DevTools console, try to access person from Company 2:
   ```typescript
   // This should now fail with Firestore error
   import { doc, getDoc } from 'firebase/firestore';
   const docRef = doc(db, 'persons', 'person-from-company-2');
   getDoc(docRef); // ❌ Permission denied
   ```

---

## 🔍 Verification Checklist

- [ ] **Application Layer**: Build passes without errors
  ```bash
  npm run build
  # Should show 0 errors
  ```

- [ ] **Firestore Rules Deployed**: Rules are live in Firebase Console
  
- [ ] **Custom Claims Set**: Users have `companyId` and `role` in their custom claims
  
- [ ] **User A Can't Access Company B**: Test cross-company access is blocked
  
- [ ] **User A Can Access Company A**: Legitimate access still works
  
- [ ] **Delete Multiple Works**: Batch deletion validates all persons
  
- [ ] **Update Prevents Company Change**: Attempting to modify `companyId` field is rejected

---

## 📝 Important Notes

### Custom Claims vs. Token Claims

- **Setting custom claims**: Use `admin.auth().setCustomUserClaims()` in your backend
- **Reading custom claims**: Available in `request.auth.token` in Firestore Rules
- **In frontend**: Custom claims are not automatically in `user.getIdTokenResult()` until token is refreshed
- **Force token refresh**: `await user.getIdToken(true)` in frontend after role changes

### Performance Considerations

- **Validation overhead**: Each `updatePerson()` and `deletePerson()` now makes an extra `getDoc()` call
  - Impact: Negligible for most use cases
  - Alternative: Batch operations could be optimized with composite operations
  
- **Firestore Rules cost**: Rules are evaluated for every read/write operation
  - Impact: Minimal; same as before (rules always execute)

### Backward Compatibility

- Existing data with `companyId` field works immediately
- Older records without `companyId` will be blocked by rules (recommend running migration)

---

## 🐛 Troubleshooting

### "Permission denied" on valid operations
**Issue**: User can't access their own company's data  
**Solution**: Check custom claims are set with correct `companyId`
```typescript
// Verify in Firebase Admin SDK
const user = await admin.auth().getUser(uid);
console.log(user.customClaims); // Should show companyId
```

### Rules deployment fails
**Issue**: Firestore rules syntax error  
**Solution**: Copy the entire `firestore.rules` file and validate syntax:
```bash
firebase firestore:delete <collection> --only-rules
firebase deploy --only firestore:rules
```

### Error: "Property 'companyId' does not exist"
**Issue**: Person record missing `companyId` field  
**Solution**: Ensure all person records have `companyId` set
```typescript
// Migration example
db.collection('persons').where('companyId', '==', null).get()
  .then(snap => {
    snap.forEach(doc => {
      doc.ref.update({ companyId: 'correct-company-id' });
    });
  });
```

---

## 📚 Files Modified/Created

| File | Status | Change |
|------|--------|--------|
| `src/store/personStore.ts` | ✅ Modified | Added companyId validation to CRUD operations |
| `src/hooks/usePersons.ts` | ✅ Modified | Auto-inject companyId in hook wrappers |
| `firestore.rules` | ✅ Created | Security rules for database-level access control |

---

## Next Steps

1. **Deploy firestore.rules** to your Firebase project
2. **Configure custom claims** in your backend (if not already done)
3. **Test thoroughly** before deploying to production
4. **Monitor Firestore logs** for any denied access attempts
5. **Consider backend Cloud Functions** - ensure they also validate companyId

---

## Questions?

Refer to:
- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin-setup)
- [Firestore Rules Reference](https://firebase.google.com/docs/firestore/security/rules-reference)
