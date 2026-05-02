# Photo Gallery

Personal photo gallery with Cloudflare R2 storage, auto-thumbnails, and a secret upload page.

## Setup

### 1. Cloudflare R2

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Create a bucket (e.g. `my-photos`)
3. Enable **Public access** on the bucket → copy the public URL
4. Go to **Manage R2 API Tokens** → Create token with **Object Read & Write** on your bucket
5. Copy Account ID, Access Key ID, Secret Access Key

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=my-photos
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
UPLOAD_SECRET=my-secret-upload-key-123
```

### 3. Install & run

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
vercel
```

Add all env variables in Vercel Dashboard → Project → Settings → Environment Variables.

## Usage

- **Gallery**: `https://yoursite.com/`
- **Upload** (only you): `https://yoursite.com/upload/my-secret-upload-key-123`

The upload page works great on mobile — tap the drop zone to open your camera roll or camera directly.

## How it works

- Photos are stored in R2 under `originals/` at full quality
- A compressed thumbnail (max 800px, 75% JPEG) is auto-generated and stored under `thumbnails/`
- Gallery shows thumbnails for fast loading
- Lightbox shows the full-res original
- Download generates a signed URL to the original file
