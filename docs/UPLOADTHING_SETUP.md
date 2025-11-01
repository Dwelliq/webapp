# UploadThing Setup Guide

## Option 1: UploadThing Managed Storage (Recommended - Easiest)

UploadThing handles S3/R2 storage for you. You just need to:

1. **Sign up for UploadThing**
   - Go to https://uploadthing.com
   - Sign up for a free account

2. **Get your API keys**
   - Go to Dashboard → API Keys
   - Copy your `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`

3. **Add to `.env.local`**
   ```bash
   UPLOADTHING_SECRET=sk_live_...
   UPLOADTHING_APP_ID=...
   ```

4. **That's it!** UploadThing manages S3 storage automatically.

---

## Option 2: Custom S3 Bucket with UploadThing

If you want to use your own S3 bucket:

### Step 1: Create S3 Bucket

1. Go to AWS Console → S3
2. Click "Create bucket"
3. **Bucket name**: `your-project-listing-photos` (must be globally unique)
4. **Region**: Choose closest to your users (e.g., `ap-southeast-2` for Australia)
5. **Block Public Access**: Uncheck "Block all public access" (you'll need public reads for images)
6. Acknowledge the warning
7. **Bucket Versioning**: Disable (unless needed)
8. **Default encryption**: Enable (SSE-S3 is fine)
9. Click "Create bucket"

### Step 2: Configure Bucket CORS

1. Open your bucket → Permissions → CORS
2. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 3: Create IAM User for UploadThing

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. **User name**: `uploadthing-s3-user`
4. **Access type**: Programmatic access
5. Click "Next: Permissions"

6. **Attach policies**: Click "Create policy"
   - Switch to JSON tab
   - Paste this policy (replace `your-bucket-name`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name/*",
                "arn:aws:s3:::your-bucket-name"
            ]
        }
    ]
}
```

7. Name it `UploadThingS3Policy` and create
8. Attach this policy to your user
9. **Create user** and save:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### Step 4: Configure Bucket Policy for Public Reads

1. Go to your bucket → Permissions → Bucket policy
2. Add this policy (replace `your-bucket-name`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### Step 5: Configure UploadThing

In UploadThing dashboard:
1. Go to Settings → Storage
2. Select "Custom S3"
3. Enter your bucket details:
   - **Bucket Name**: `your-bucket-name`
   - **Region**: `ap-southeast-2` (or your chosen region)
   - **Access Key ID**: Your `AWS_ACCESS_KEY_ID`
   - **Secret Access Key**: Your `AWS_SECRET_ACCESS_KEY`

### Step 6: Environment Variables

Add to `.env.local`:

```bash
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET_NAME=your-bucket-name
```

---

## Option 3: Direct S3 Integration (No UploadThing)

If you want to bypass UploadThing and use S3 directly, you'd need to:

1. Install AWS SDK: `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
2. Create presigned URLs for uploads
3. Handle file uploads directly to S3
4. Manage file serving/CDN

This is more complex but gives full control.

---

## Recommendation

**Start with Option 1** (UploadThing managed storage) - it's the simplest and handles all the complexity for you. You can always migrate to a custom bucket later if needed.

