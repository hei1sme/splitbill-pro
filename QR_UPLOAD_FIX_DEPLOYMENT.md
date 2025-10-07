# QR Upload Fix - Deployment Guide

## 🎯 Problem Summary
- QR images uploaded successfully but returned 404 errors
- Preview image not showing after upload
- QR modal not displaying uploaded images
- Production site at `https://splitbill.heiisme.duckdns.org` was missing the fix

## ✅ Solution Implemented

### 1. Created Dynamic API Route
**File:** `src/app/api/uploads/[type]/[filename]/route.ts`
- Serves uploaded files with proper MIME types
- Handles security validation
- Returns proper cache headers

### 2. Updated Upload API
**File:** `src/app/api/upload/route.ts`  
- Changed from returning `/uploads/qr/...` (static path)
- Now returns `/api/uploads/qr/...` (dynamic API route)
- Ensures files are served through our API with correct headers

### 3. Fixed QR Display Component
**File:** `src/components/people/PersonCard.tsx`
- Changed from Next.js `<Image>` to regular `<img>` tag
- Prevents image optimization errors for uploaded content
- QR modal now displays correctly

### 4. Dependencies Updated
**File:** `package.json`
- Added `mime@^3.0.0` for MIME type detection

### 5. Docker Build Fixed
**File:** `Dockerfile`
- Changed from `npm ci` to `npm install` for development
- Handles package-lock.json sync issues

## 📦 How to Deploy to Production

### Option 1: Update Existing Production Server
```bash
# SSH into your production server
cd /path/to/splitbill-pro

# Pull latest changes
git pull origin restore/e3847b4

# Rebuild Docker containers
docker compose build app
docker compose up -d app

# Verify it's running
docker compose logs app --tail=20
```

### Option 2: Create New Repository (Your Preference)
Since you mentioned wanting to create a new repo:

1. **Create new repository on GitHub**
2. **Push this code:**
```bash
# Add new remote
git remote add new-origin https://github.com/YOUR-USERNAME/NEW-REPO.git

# Push to new repo
git push new-origin restore/e3847b4:main --force
```

3. **Deploy from new repository**

## 🧪 Testing After Deployment

1. Go to: `https://splitbill.heiisme.duckdns.org/people`
2. Click "Add Person"
3. Upload a QR code image
4. ✅ Preview should appear immediately
5. Save the person
6. ✅ Click the QR button on the person card
7. ✅ QR image should display in modal

## 🔍 Verify API Route Works

Test the dynamic API route:
```bash
curl -I https://splitbill.heiisme.duckdns.org/api/uploads/qr/test.jpg
```

Should return `200 OK` (if file exists) or `404` with proper JSON (if file doesn't exist).

## 📁 Files Changed in This Fix

```
src/app/api/uploads/[type]/[filename]/route.ts   (NEW)
src/app/api/upload/route.ts                       (MODIFIED)
src/components/people/PersonCard.tsx              (MODIFIED)
package.json                                      (MODIFIED - added mime)
Dockerfile                                        (MODIFIED - npm install)
```

## 🚨 Important Notes

1. **Upload Directory Persistence**: 
   - Uploaded files are stored in `/app/public/uploads/qr/`
   - Make sure this directory persists across container restarts
   - Consider using Docker volumes for production

2. **File Size Limit**: 5MB (configured in upload API)

3. **Supported Formats**: PNG, JPG, JPEG, WebP

## ✨ What's Working Now

✅ File upload to server  
✅ Upload success message  
✅ Preview image displays after upload  
✅ QR modal shows uploaded image  
✅ Images persist after page reload  
✅ Multiple QR codes supported  
✅ Proper MIME type handling  
✅ Security validation  

## 📊 Local Testing Results

```
✅ Docker build: SUCCESS
✅ App container: RUNNING
✅ Upload API: 200 OK
✅ Dynamic API route: 200 OK (for existing files)
✅ Preview display: WORKING
✅ Modal display: WORKING
```

## 🔄 Current Status

**Local Environment:** ✅ All fixes working  
**Production Server:** ⏳ Awaiting deployment  

**Next Step:** Deploy these changes to production server at `https://splitbill.heiisme.duckdns.org`
