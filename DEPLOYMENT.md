# Deployment Guide

This guide will help you deploy the OrbitPort Password Generator to various platforms.

## Prerequisites

- Git repository with your code
- OrbitPort API key (optional but recommended)

## Vercel (Recommended)

### Step 1: Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure your repository is public or you have a Vercel account

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your repository
4. Configure environment variables:
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_ORBITPORT_API_KEY` with your API key
5. Click "Deploy"

### Step 3: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions

## Netlify

### Step 1: Build Settings

```bash
# Build command
npm run build

# Publish directory
.next
```

### Step 2: Environment Variables

Add in Netlify dashboard:

- `ORBITPORT_API_URL`: https://api.orbitport.io
- `ORBITPORT_CLIENT_ID`: Your OAuth client ID
- `ORBITPORT_CLIENT_SECRET`: Your OAuth client secret
- `ORBITPORT_TOKEN_URL`: https://api.orbitport.io/oauth/token

### Step 3: Deploy

1. Connect your repository to Netlify
2. Configure build settings
3. Add environment variables
4. Deploy

## Railway

### Step 1: Connect Repository

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Railway will auto-detect Next.js

### Step 2: Environment Variables

Add in Railway dashboard:

- `ORBITPORT_API_URL`: https://api.orbitport.io
- `ORBITPORT_CLIENT_ID`: Your OAuth client ID
- `ORBITPORT_CLIENT_SECRET`: Your OAuth client secret
- `ORBITPORT_TOKEN_URL`: https://api.orbitport.io/oauth/token

### Step 3: Deploy

Railway will automatically deploy on every push to main branch.

## Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Build and Run

```bash
# Build image
docker build -t orbitport-password-generator .

# Run container
docker run -p 3000:3000 \
  -e ORBITPORT_API_URL=https://api.orbitport.io \
  -e ORBITPORT_CLIENT_ID=your_client_id_here \
  -e ORBITPORT_CLIENT_SECRET=your_client_secret_here \
  -e ORBITPORT_TOKEN_URL=https://api.orbitport.io/oauth/token \
  orbitport-password-generator
```

## Environment Variables

| Variable                  | Description         | Required | Example                                |
| ------------------------- | ------------------- | -------- | -------------------------------------- |
| `ORBITPORT_API_URL`       | OrbitPort API URL   | No       | `https://api.orbitport.io`             |
| `ORBITPORT_CLIENT_ID`     | OAuth client ID     | No       | `your_client_id`                       |
| `ORBITPORT_CLIENT_SECRET` | OAuth client secret | No       | `your_client_secret`                   |
| `ORBITPORT_TOKEN_URL`     | OAuth token URL     | No       | `https://api.orbitport.io/oauth/token` |

## Post-Deployment Checklist

- [ ] Test password generation
- [ ] Verify fallback works without API key
- [ ] Check responsive design on mobile
- [ ] Test copy functionality
- [ ] Verify accessibility features
- [ ] Monitor error logs

## Troubleshooting

### Common Issues

1. **Build Fails**: Check Node.js version (18+ required)
2. **API Errors**: Verify environment variables are set correctly
3. **Styling Issues**: Ensure Tailwind CSS is properly configured
4. **Performance**: Consider enabling Next.js optimizations

### Support

- Check the [README.md](./README.md) for detailed setup instructions
- Review the [Next.js documentation](https://nextjs.org/docs)
- Contact OrbitPort support for API issues
