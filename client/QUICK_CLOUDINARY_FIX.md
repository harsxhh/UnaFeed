# 🚀 QUICK FIX: Create Cloudinary Upload Preset

## Step 1: Go to Cloudinary Dashboard
1. Open: https://cloudinary.com/console
2. Login with your account

## Step 2: Create Upload Preset
1. Click **Settings** (gear icon) in the top right
2. Click **Upload** tab
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**

## Step 3: Configure Preset
Set these values:
- **Preset name**: `ml_default`
- **Signing Mode**: **Unsigned** (IMPORTANT!)
- **Use filename**: No
- **Unique filename**: Yes
- **Folder**: `unafeed`
- **Resource type**: Image
- **Access mode**: Public
- **Delivery type**: Upload

## Step 4: Save
Click **Save** button

## Step 5: Test Upload
1. Go back to your app
2. Try uploading an image
3. Check browser console (F12) for detailed logs

---

## Alternative: Use Default Preset
If the above doesn't work, try changing the preset name in the code to one of these common defaults:
- `ml_default`
- `unsigned_preset`
- Or check your Cloudinary dashboard for existing presets

The upload should work once the preset is created!
