# AEROAWARE - Air Quality Intelligence Platform for India

## Overview
AEROAWARE is a professional-grade air quality monitoring and prediction platform specifically designed for India, delivering hyperlocal real-time air quality data using **CPCB (Central Pollution Control Board) standards** with AI-powered forecasts. The platform serves Indian cities and towns, providing clear 24-72 hour predictions of AQI and key pollutants (PM2.5, PM10, NO₂, O₃) with uncertainty ranges and expert CPCB-compliant health recommendations.

## Tech Stack
- **Frontend**: React + TypeScript, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL with Drizzle ORM (optional, using in-memory storage by default)
- **APIs**: Open-Meteo (Air Quality & Geocoding), NASA FIRMS, OpenRouter AI
- **AQI Standards**: CPCB Indian AQI (primary), US AQI (secondary reference)
- **Deployment**: Netlify Serverless Functions ready, Replit Development
- **UI Framework**: Modern India-focused design with CPCB color schemes and health categories

## Recent Major Updates (November 2025)

### **CRITICAL BUG FIXED & INDIA ENHANCEMENTS** (Nov 5, 2025)
- ✅ **AQI Stuck at 85/88 Bug RESOLVED** - Eliminated all fallback values, fixed nullish coalescing
- ✅ **Real Location-Specific Data** - Delhi: 231 (Indian AQI), Mumbai: 234, Bangalore: varying values
- ✅ **Indian AQI (CPCB) Implementation** - Full CPCB calculation with proper breakpoints for PM2.5, PM10, NO₂, O₃
- ✅ **API Reliability** - Using Open-Meteo air quality API with proper null handling
- ✅ **Last Updated Timestamps** - Real-time display of when data was last fetched
- ✅ **API Health Indicators** - Green/Amber/Red status badges showing data source health
- ✅ **CPCB Health Advice** - Context-specific recommendations based on Indian AQI categories

### Branding & UI Overhaul
- ✅ **Rebranded to AEROAWARE** - Professional enterprise-level branding
- ✅ **Complete UI Redesign** - Modern, professional interface with animations
- ✅ **Enhanced Search Bar** - Highly visible white background with blue accents, larger text
- ✅ **Vibrant UI Elements** - Improved contrast, better shadows, prominent buttons
- ✅ **Custom Animations** - Fade-in-up, scale-in, slide-in, pulse-glow effects
- ✅ **Professional Typography** - Space Grotesk, Poppins, Inter font families
- ✅ **Glass Morphism** - Modern backdrop blur effects and shadows
- ✅ **Gradient Effects** - Primary gradients, mesh backgrounds, glow effects
- ✅ **Improved Navigation** - Enhanced header with animated logo and effects

### Performance & Data Fixes
- ✅ **Fixed React Query Caching** - Set staleTime: 0, gcTime: 0 for real-time updates
- ✅ **Fixed AQI Not Changing** - Switched to Open-Meteo API for location-specific data
- ✅ **Open-Meteo Integration** - Real-time air quality data from free, reliable API
- ✅ **Forecast Page Overhaul** - Now uses real API data instead of mock data
- ✅ **Location-Based Updates** - Forecast and realtime data update when location changes
- ✅ **Removed Fallback Data** - Only uses real measurements from Open-Meteo API

### Key Features Implemented

#### Real-Time Data (India-Specific)
- ✅ Open-Meteo Air Quality API integration (free, no auth required)
- ✅ Real-time air quality measurements for Indian cities and towns
- ✅ Hyperlocal data for urban and rural areas (PM2.5, PM10, NO₂, O₃, SO₂, CO)
- ✅ **Primary: CPCB Indian AQI breakpoints** (Good, Satisfactory, Moderate, Poor, Very Poor, Severe)
- ✅ Secondary: US AQI reference for comparison
- ✅ Live data badge indicator with API health status (green/amber/red)
- ✅ Location-specific timestamps in Indian Standard Time (IST)
- ✅ Compare feature to show AQI differences across Indian cities

#### AI Predictions
- ✅ AI-enhanced 24-72 hour forecasts using OpenRouter (Mistral-7b/other free models)
- ✅ Hyperlocal predictions based on current measurements + meteorological forecasts
- ✅ Uncertainty ranges (90% confidence intervals)
- ✅ Peak pollution period identification
- ✅ AI-generated forecast summaries and health recommendations

#### Data Visualization
- ✅ Professional AQI gauge with color-coded levels and animations
- ✅ Animated pollutant cards (PM2.5, PM10, NO₂, O₃) with sparklines
- ✅ 24/48/72-hour forecast charts with uncertainty bands
- ✅ Historical trends (7/30/90 days) - UI ready, API integration pending
- ✅ Location search and geolocation support
- ✅ Professional loading states with spinners

#### Health Advisory
- ✅ Plain-language health recommendations
- ✅ AI-powered personalized advice based on current conditions
- ✅ WHO and CPCB standard compliance messaging
- ✅ Activity recommendations (indoor/outdoor/exercise)

#### Additional Features
- ✅ NASA FIRMS fire data integration (smoke impact context)
- ✅ Enhanced dark/light theme support with improved colors
- ✅ Fully responsive design (mobile to desktop)
- ✅ User location favorites and alerts (in-memory storage)
- ✅ Professional error handling and fallbacks

## API Keys Required
All APIs use free tiers:

1. **OPENROUTER_API_KEY** - AI predictions and health advice (free models available)
   - Get at: https://openrouter.ai/keys
   - Currently configured via Replit Secrets
   - Required for AI features (Forecast, Health pages)
   
2. **OPENAQ_API_KEY** - (Optional, not currently used)
   - Get at: https://docs.openaq.org
   - Reserved for future monitoring station integration
   
3. **HUGGINGFACE_API_KEY** - (Optional, for future time-series model enhancements)
   - Get at: https://huggingface.co/settings/tokens
   - Currently configured via Replit Secrets

**Note**: Real-time air quality data now uses Open-Meteo API which requires no authentication!

## Environment Variables
```env
DATABASE_URL=postgresql://... (optional)
OPENAQ_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
HUGGINGFACE_API_KEY=your_key_here
PORT=5000
NODE_ENV=development
```

## Running Locally
```bash
npm install
npm run dev  # Starts both backend and frontend on port 5000
```

## API Endpoints

### Air Quality
- `GET /api/air-quality/realtime?lat={lat}&lon={lon}` - Current AQI and pollutants from Open-Meteo
- `GET /api/air-quality/forecast?lat={lat}&lon={lon}` - 72-hour meteorological air quality forecast from Open-Meteo

### AI Features
- `POST /api/ai/health-advice` - AI-generated health recommendations
- `POST /api/ai/enhanced-forecast` - AI-enhanced hyperlocal predictions with uncertainty
- `POST /api/ai/forecast-summary` - Human-readable forecast narrative

### Location
- `GET /api/locations/search?query={place}` - Search for locations globally (Open-Meteo Geocoding)
- `GET /api/nasa/fires?lat={lat}&lon={lon}` - Active fire data (NASA FIRMS)

### User Data (In-Memory)
- `GET /api/user/:userId/locations` - User's saved locations
- `POST /api/user/:userId/locations` - Save a location
- `GET /api/user/:userId/alerts` - User's AQI alerts
- `POST /api/user/:userId/alerts` - Create an alert

## Design System

### Colors
- **Primary**: Blue (#3B82F6) - Air quality theme
- **Gradients**: Mesh backgrounds with primary, purple, green, yellow, orange radial gradients
- **Glass Effects**: Backdrop blur with semi-transparent backgrounds
- **Shadows**: Enhanced glow effects for primary elements

### Typography
- **Headings**: Poppins (bold, 700-900)
- **Body**: Inter (light, 300-600)
- **Brand**: Space Grotesk (700)
- **Code**: JetBrains Mono

### Animations
- **Fade In Up**: Smooth entrance animations for content
- **Scale In**: Card entrance effects
- **Slide In**: Navigation and list animations
- **Pulse Glow**: Live data indicators
- **Animation Delays**: Staggered entrances (100ms-500ms)

## Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components (AQIGauge, PollutantCard, etc.)
│   │   ├── pages/       # Route pages (Dashboard, Forecast, Trends, Health)
│   │   ├── lib/         # Utilities
│   │   └── hooks/       # Custom React hooks
├── server/              # Express backend
│   ├── lib/             # API clients (OpenAQ, Open-Meteo, OpenRouter, NASA)
│   ├── routes.ts        # API routes
│   ├── index.ts         # Server entry
│   ├── storage.ts       # In-memory storage implementation
│   └── vite.ts          # Vite dev middleware
├── shared/              # Shared TypeScript types
├── netlify/             # Netlify serverless functions
│   └── functions/       
│       └── api.ts       # Serverless wrapper for Express
├── netlify.toml         # Netlify deployment config
└── attached_assets/     # Static assets and generated images
```

## Netlify Deployment
The app is configured for Netlify deployment:
- `netlify.toml` - Build and deployment configuration
- `netlify/functions/api.ts` - Serverless function wrapper
- Frontend built with `npm run build`
- API runs as Netlify Function

## Known Issues & Future Enhancements

### To Be Implemented
- ⏳ Historical data API integration (currently using mock data in Trends page)
- ⏳ Interactive heatmap using NASA GIBS aerosol optical depth
- ⏳ Advanced analytics dashboard with comparative analysis
- ⏳ Email/SMS alert notifications
- ⏳ User authentication and personalized dashboards
- ⏳ Mobile app (React Native)

### In Progress
- 🔧 Refactor Netlify handler to share routes with dev server
- 🔧 Add more detailed error messages for API failures
- 🔧 Improve mobile responsiveness on smaller screens

## User Preferences
- ✅ Prefer real data over mock/placeholder data
- ✅ Use only free-tier APIs
- ✅ Professional, enterprise-grade UI design
- ✅ Animations and visual enhancements
- ✅ Focus on rural and small-town air quality coverage
- ✅ Provide uncertainty ranges for all predictions
- ✅ WHO and CPCB standard compliance

## Development Notes
- All caching disabled for React Query (staleTime: 0, gcTime: 0) to ensure real-time updates
- OpenAQ v3 requires coordinates as "lat,lon" format and radius in meters (max 25000)
- Parameter names in OpenAQ are strings: "pm25", "pm10", "no2", "o3", etc.
- Vite configured with `allowedHosts: true` for Replit proxy compatibility
- Custom CSS animations defined in `client/src/index.css`
- Professional fonts loaded from Google Fonts
