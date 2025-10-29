# Firestore Security Rules Setup

## Overview
To ensure your users' API keys are secure, you need to deploy Firestore security rules that restrict access to each user's own data.

## Quick Setup

### Option 1: Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: `final-vacation-project`

2. **Navigate to Firestore Rules**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top

3. **Copy and Paste Rules**
   - Open the `firestore.rules` file in this project
   - Copy all the contents
   - Paste into the Firebase Console rules editor
   - Click "Publish"

4. **Verify Deployment**
   - Rules should be active immediately
   - Test by logging in and saving API keys

### Option 2: Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Security Rules Explained

```javascript
// User API Keys - users can only read/write their own keys
match /userApiKeys/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### What This Does:
- ✅ **Authenticated users only** - Must be logged in
- ✅ **Own data only** - Can only access their own userId document
- ✅ **Full CRUD** - Can create, read, update, delete their own keys
- ❌ **No cross-access** - Cannot see or modify other users' keys
- ❌ **No anonymous access** - Must authenticate first

## Testing Security Rules

### Test in Firebase Console

1. Go to Firestore Database → Rules tab
2. Click "Rules Playground" button
3. Test different scenarios:

**Test 1: Authenticated User Reading Own Keys**
```
Location: /userApiKeys/{userId}
Auth: Authenticated (simulate with userId)
Operation: Read
Result: ✅ Allowed
```

**Test 2: Authenticated User Reading Other's Keys**
```
Location: /userApiKeys/{differentUserId}
Auth: Authenticated (with different userId)
Operation: Read
Result: ❌ Denied
```

**Test 3: Unauthenticated Access**
```
Location: /userApiKeys/{userId}
Auth: None
Operation: Read
Result: ❌ Denied
```

### Test in Your App

1. **Login** to your account
2. **Open Developer Console** (F12)
3. **Add API keys** - Should see success messages
4. **Check Firestore** in Firebase Console - Should see your userId document
5. **Logout and try again** - Should load keys successfully

## Verifying Data in Firestore

1. Go to Firebase Console
2. Click "Firestore Database"
3. Look for collection: `userApiKeys`
4. You should see documents with userId as the document ID
5. Each document contains the API keys for that user

### Example Data Structure:
```
userApiKeys (collection)
  └── abc123xyz (document - userId)
      ├── openai: "sk-proj-..."
      ├── serper: "858a4fe..."
      ├── hotelbedsKey: "your-key"
      └── hotelbedsSecret: "your-secret"
```

## Important Security Notes

### ⚠️ Before Deploying to Production

1. **Deploy Security Rules First**
   - Rules must be active before users save keys
   - Default rules may be too permissive

2. **Backup Existing Rules**
   - Download current rules before modifying
   - Keep a version history

3. **Test Thoroughly**
   - Test with multiple user accounts
   - Verify cross-user access is blocked
   - Test both read and write operations

4. **Monitor Usage**
   - Check Firebase Console for unauthorized access attempts
   - Review Firestore usage metrics
   - Set up alerts for suspicious activity

## Additional Security Measures

### Consider Adding:

1. **Rate Limiting**
   ```javascript
   // Limit writes to prevent abuse
   allow write: if request.auth != null 
     && request.auth.uid == userId
     && request.time > resource.data.lastWrite + duration.value(1, 'm');
   ```

2. **Data Validation**
   ```javascript
   // Validate API key format
   allow write: if request.auth != null 
     && request.auth.uid == userId
     && request.resource.data.openai.matches('sk-.*');
   ```

3. **Field-level Security**
   ```javascript
   // Only allow specific fields
   allow write: if request.auth != null 
     && request.auth.uid == userId
     && request.resource.data.keys().hasOnly([
       'openai', 'serper', 'hotelbedsKey', 'hotelbedsSecret'
     ]);
   ```

## Troubleshooting

### "Missing or insufficient permissions" Error

**Cause:** Security rules not deployed or too restrictive

**Solution:**
1. Verify rules are published in Firebase Console
2. Check that user is authenticated
3. Verify userId matches in code and Firestore
4. Check browser console for detailed error

### Rules Not Taking Effect

**Cause:** Rules can take a few seconds to propagate

**Solution:**
1. Wait 10-30 seconds after publishing
2. Refresh your app
3. Clear browser cache if needed
4. Check "Rules" tab shows your latest rules

### Cannot Read Own Data

**Cause:** User ID mismatch or authentication issue

**Solution:**
1. Log `user.uid` in console to verify
2. Check Firestore document ID matches exactly
3. Verify auth token is valid
4. Try logging out and back in

## Current Rule Status

After setup, your rules should be:
- ✅ Users can only access their own API keys
- ✅ Must be authenticated to read/write
- ✅ No anonymous access
- ✅ No cross-user access
- ✅ Secure by default

## Next Steps

1. ✅ Deploy the rules to Firebase Console
2. ✅ Test with your account
3. ✅ Verify security works as expected
4. ✅ Monitor usage in Firebase Console
5. ✅ Consider additional security measures for production

---

**Need Help?** Check Firebase Console → Firestore → Rules for detailed error messages and the Rules Playground for testing.

