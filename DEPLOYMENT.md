# Student API - Deployment Guide

## Deployment Checklist ✅

### Before Deploying to Render

1. **Environment Variables Setup**
   - [ ] Create MongoDB Atlas account and get connection string
   - [ ] Create GitHub OAuth app and get credentials
   - [ ] Generate a secure `SESSION_SECRET` (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - [ ] Set `CALLBACK_URL` to your Render deployment URL

2. **Update .env on Render**
   - [ ] `MONGO_URI`: MongoDB Atlas connection string
   - [ ] `GITHUB_CLIENT_ID`: From GitHub OAuth app
   - [ ] `GITHUB_CLIENT_SECRET`: From GitHub OAuth app
   - [ ] `CALLBACK_URL`: `https://your-app-name.onrender.com/github/callback`
   - [ ] `SESSION_SECRET`: Secure random string
   - [ ] `NODE_ENV`: `production`
   - [ ] `ALLOWED_ORIGINS`: Your frontend URL(s) if needed

3. **GitHub OAuth Configuration**
   - [ ] Create OAuth app at: https://github.com/settings/developers
   - [ ] Set Authorization callback URL to: `https://your-app-name.onrender.com/github/callback`
   - [ ] Copy Client ID and Client Secret to Render environment

4. **Database Setup**
   - [ ] Create MongoDB Atlas cluster (free tier available)
   - [ ] Create database user with strong password
   - [ ] Whitelist Render IP addresses (or allow all: `0.0.0.0/0`)
   - [ ] Get connection string in format: `mongodb+srv://user:password@cluster.mongodb.net/studentDB`

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add all required environment variables
   - Deploy

3. **Verify Deployment**
   - Check logs for: "MongoDB connected" and "Server running on port 5000"
   - Test API endpoints via Swagger UI: `https://your-app.onrender.com/api-docs`

### Known Issues & Solutions

**Issue: "Missing required environment variables"**
- Solution: Check Render dashboard and ensure all env vars are set

**Issue: MongoDB connection timeout**
- Solution: Whitelist Render IPs in MongoDB Atlas → Network Access

**Issue: GitHub OAuth not working**
- Solution: Update `CALLBACK_URL` in GitHub OAuth app settings

## Security Notes

- ✅ Session secrets are now environment variables
- ✅ CORS properly configured for production
- ✅ Error stack traces hidden in production
- ✅ Secure session cookies in production
- ✅ Environment variable validation on startup
- ✅ Unhandled rejection and exception handlers added

## Local Development

```bash
# Install dependencies
npm install

# Create .env file with local values:
# MONGO_URI=mongodb://localhost:27017/studentDB
# GITHUB_CLIENT_ID=your_id
# GITHUB_CLIENT_SECRET=your_secret
# CALLBACK_URL=http://localhost:5000/github/callback
# SESSION_SECRET=dev-secret-key
# NODE_ENV=development
# PORT=5000

# Start with nodemon
npm run dev
```

## Testing the API

```bash
# Get Swagger UI
curl http://your-app.onrender.com/api-docs

# Create student
curl -X POST http://your-app.onrender.com/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","course":"CS","level":200}'

# Update student
curl -X PUT http://your-app.onrender.com/api/students/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe"}'
```
