# AEROAWARE - Netlify Deployment Guide

## Prerequisites
1. **Netlify Account**: Sign up at [netlify.com](https://www.netlify.com)
2. **API Keys**: Obtain the following free-tier API keys before deployment

## Required API Keys

### 1. OpenRouter API Key (AI Features)
**Purpose**: Powers AI-enhanced forecasts, health recommendations, and analysis

**How to Get**:
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Navigate to [Keys](https://openrouter.ai/keys)
4. Click "Create Key" and copy your API key
5. **Free Models Available**: `mistralai/mistral-7b-instruct:free`, `meta-llama/llama-3-8b-instruct:free`

**Environment Variable Name**: `OPENROUTER_API_KEY`

---

### 2. OpenAQ API Key (Optional - Not Currently Used)
**Purpose**: Real-time air quality monitoring station data (currently using Open-Meteo instead)

**How to Get**:
1. Visit [OpenAQ Docs](https://docs.openaq.org)
2. Sign up for API access
3. Follow their authentication guide

**Environment Variable Name**: `OPENAQ_API_KEY`

**Note**: Currently optional as the app uses Open-Meteo Air Quality API for real-time data

---

### 3. Hugging Face API Key (Optional - Future Enhancement)
**Purpose**: Advanced ML model integration for future time-series predictions

**How to Get**:
1. Visit [huggingface.co](https://huggingface.co)
2. Sign up for a free account
3. Navigate to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token with "Read" permissions

**Environment Variable Name**: `HUGGINGFACE_API_KEY`

**Note**: Currently optional, reserved for future ML enhancements

---

## Free APIs (No Key Required)

The following APIs are used and **do not require API keys**:

1. **Open-Meteo Air Quality API** - Real-time air quality data worldwide
   - Endpoint: `https://air-quality-api.open-meteo.com/v1/air-quality`
   - Rate Limits: 10,000 requests/day (free tier)

2. **Open-Meteo Geocoding API** - Location search
   - Endpoint: `https://geocoding-api.open-meteo.com/v1/search`

3. **NASA FIRMS** - Active fire detection data
   - Endpoint: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/...`
   - No authentication required

---

## Netlify Deployment Steps

### Step 1: Connect Repository to Netlify

1. **Login to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign in with your account

2. **Import Project**:
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git provider (GitHub, GitLab, Bitbucket)
   - Select your AEROAWARE repository

### Step 2: Configure Build Settings

Use these build settings:

```
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

**Build Settings in Netlify UI**:
- Base directory: (leave blank)
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

### Step 3: Set Environment Variables

In Netlify Dashboard:
1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable** and add each of the following:

#### Required Variables:

| Variable Name | Value | Required? |
|--------------|-------|-----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | ✅ YES |
| `NODE_ENV` | `production` | ✅ YES |

#### Optional Variables:

| Variable Name | Value | Required? |
|--------------|-------|-----------|
| `OPENAQ_API_KEY` | Your OpenAQ API key | ❌ No (not currently used) |
| `HUGGINGFACE_API_KEY` | Your Hugging Face token | ❌ No (future feature) |

### Step 4: Deploy

1. **Trigger Deployment**:
   - Click "Deploy site" in Netlify
   - Wait for build to complete (usually 2-5 minutes)

2. **Verify Deployment**:
   - Once deployed, click on the generated URL
   - Test location search and AQI display
   - Check that AI features (Forecast, Health pages) work correctly

### Step 5: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow Netlify's DNS configuration instructions
4. Example: `aeroaware.yourdomain.com`

---

## Architecture Overview

### Frontend (React + Vite)
- Built into static files in `dist/` folder
- Served directly by Netlify CDN
- Fast, global edge delivery

### Backend (Express API → Serverless Function)
- Express routes wrapped in `netlify/functions/api.ts`
- Each API endpoint becomes a serverless function
- Automatically scales with traffic

### API Endpoints Available After Deployment

All API endpoints are accessible at: `https://your-site.netlify.app/.netlify/functions/api/[endpoint]`

Example endpoints:
- `/.netlify/functions/api/air-quality/realtime?lat=28.6139&lon=77.2090`
- `/.netlify/functions/api/air-quality/forecast?lat=51.5074&lon=-0.1278`
- `/.netlify/functions/api/locations/search?query=Mumbai`
- `/.netlify/functions/api/ai/health-advice`

---

## Troubleshooting

### Build Fails

**Issue**: Build command errors
**Solution**: 
- Check that all dependencies are in `package.json`
- Ensure Node version is compatible (v18+)
- Review build logs in Netlify dashboard

### API Returns 500 Errors

**Issue**: Serverless function errors
**Solution**:
- Verify all required environment variables are set
- Check function logs in Netlify dashboard
- Ensure API keys are valid and not expired

### CORS Errors

**Issue**: Frontend can't access API
**Solution**:
- Netlify automatically handles CORS for functions
- Ensure you're using relative paths like `/api/...` not absolute URLs

### AI Features Not Working

**Issue**: Forecast/Health pages show errors
**Solution**:
- Verify `OPENROUTER_API_KEY` is set correctly
- Check OpenRouter dashboard for API usage/errors
- Try switching to different free model in code if rate limited

---

## Performance Optimization

### Current Configuration

The `netlify.toml` file includes optimizations:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### Caching Strategy

- **Static Assets**: Cached at CDN edge (HTML, CSS, JS, images)
- **API Responses**: No caching (Cache-Control: no-cache) for real-time data
- **Functions**: Cold start ~50-200ms, warm start ~10-50ms

### Rate Limits

Monitor your API usage to stay within free tiers:

| API | Free Tier Limit |
|-----|----------------|
| Open-Meteo | 10,000 requests/day |
| OpenRouter | Varies by model (check dashboard) |
| NASA FIRMS | Unlimited |

---

## Monitoring & Analytics

### Netlify Analytics (Optional Paid Feature)
- Real-time traffic monitoring
- Bandwidth usage tracking
- Top pages and sources

### Function Logs
Access in Netlify Dashboard:
1. Go to **Functions** tab
2. Click on `api` function
3. View real-time logs and errors

### Error Tracking
Consider integrating (optional):
- Sentry for error monitoring
- Google Analytics for user analytics
- LogRocket for session replay

---

## Cost Estimate

### Free Tier (Netlify)
- **Bandwidth**: 100 GB/month
- **Build Minutes**: 300 minutes/month
- **Functions**: 125,000 invocations/month
- **Concurrent Builds**: 1

**Expected Usage for AEROAWARE**:
- Small to medium traffic: **FREE** ✅
- ~1000 users/month: **FREE** ✅
- High traffic (10,000+ users/month): May need paid plan (~$19/month)

### API Costs
- **Open-Meteo**: FREE (10k requests/day)
- **OpenRouter**: FREE models available (with rate limits)
- **NASA FIRMS**: FREE unlimited

**Total Monthly Cost**: **$0** for typical usage 🎉

---

## Security Best Practices

1. **Never commit API keys** to Git
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** (every 3-6 months)
4. **Monitor API usage** for unusual spikes
5. **Set up rate limiting** if needed (Netlify Edge Functions)

---

## Updating the Deployment

### Automatic Deployments
- Every push to `main` branch triggers automatic deployment
- Netlify rebuilds and redeploys automatically
- Takes ~2-5 minutes

### Manual Deployments
1. Go to Netlify Dashboard
2. Click **Deploys** tab
3. Click **Trigger deploy** → **Deploy site**

### Rollback
1. Go to **Deploys** tab
2. Find previous successful deployment
3. Click **...** menu → **Publish deploy**

---

## Support & Resources

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Open-Meteo API Docs**: [open-meteo.com](https://open-meteo.com/en/docs)
- **OpenRouter Docs**: [openrouter.ai/docs](https://openrouter.ai/docs)
- **AEROAWARE Issues**: Report in your repository's Issues tab

---

## Quick Start Checklist

- [ ] Create Netlify account
- [ ] Get OpenRouter API key
- [ ] Connect Git repository to Netlify
- [ ] Configure build settings (`npm run build`, `dist`)
- [ ] Set environment variables (`OPENROUTER_API_KEY`, `NODE_ENV=production`)
- [ ] Deploy and test
- [ ] (Optional) Configure custom domain
- [ ] Monitor function logs and usage

---

**Deployment Status**: Ready for production ✅  
**Last Updated**: November 2025  
**Estimated Setup Time**: 15-20 minutes
