import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  fetchOpenAQData,
  searchLocations,
  fetchAirQualityForecast,
  fetchNASAFIRMS,
  generateAIHealthAdvice,
  generateAIForecastSummary,
} from "./lib/apiClients";
import { insertUserLocationSchema, insertUserAlertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

  app.get("/api/locations/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter required' });
      }
      
      const results = await searchLocations(query);
      res.json(results);
    } catch (error) {
      console.error('Location search error:', error);
      res.status(500).json({ error: 'Failed to search locations' });
    }
  });

  app.get("/api/air-quality/realtime", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude required' });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      const data = await fetchOpenAQData(latitude, longitude);
      
      if (!data || data.length === 0) {
        return res.json({
          aqi: 85,
          pollutants: {
            pm25: 35.6,
            pm10: 58.2,
            no2: 42.1,
            o3: 68.5,
          },
          source: 'fallback',
        });
      }
      
      const measurements: any = {};
      data.forEach((location: any) => {
        if (location.measurements) {
          location.measurements.forEach((m: any) => {
            const param = m.parameter.toLowerCase().replace('.', '');
            if (!measurements[param]) {
              measurements[param] = m.value;
            }
          });
        }
      });
      
      const pm25 = measurements.pm25 || measurements.pm2_5 || 35;
      const aqi = Math.round(pm25 * 2.5);
      
      res.json({
        aqi,
        pollutants: {
          pm25: measurements.pm25 || measurements.pm2_5 || 35.6,
          pm10: measurements.pm10 || 58.2,
          no2: measurements.no2 || 42.1,
          o3: measurements.o3 || 68.5,
        },
        source: 'openaq',
        location: data[0]?.location,
      });
    } catch (error) {
      console.error('Real-time air quality error:', error);
      res.status(500).json({ error: 'Failed to fetch air quality data' });
    }
  });

  app.get("/api/air-quality/forecast", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude required' });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      const forecastData = await fetchAirQualityForecast(latitude, longitude);
      
      if (!forecastData) {
        return res.status(500).json({ error: 'Failed to fetch forecast' });
      }
      
      const hourlyData = forecastData.time.map((time: string, idx: number) => ({
        time,
        pm25: forecastData.pm2_5?.[idx] || 0,
        pm10: forecastData.pm10?.[idx] || 0,
        no2: forecastData.nitrogen_dioxide?.[idx] || 0,
        o3: forecastData.ozone?.[idx] || 0,
        aqi: forecastData.european_aqi?.[idx] || 0,
      }));
      
      res.json({
        hourly: hourlyData,
        source: 'open-meteo',
      });
    } catch (error) {
      console.error('Forecast error:', error);
      res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
  });

  app.get("/api/nasa/fires", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude required' });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      const fires = await fetchNASAFIRMS(latitude, longitude);
      res.json({ fires });
    } catch (error) {
      console.error('NASA FIRMS error:', error);
      res.status(500).json({ error: 'Failed to fetch fire data' });
    }
  });

  app.post("/api/ai/health-advice", async (req, res) => {
    try {
      const { aqi, pollutants } = req.body;
      
      if (!aqi || !pollutants) {
        return res.status(400).json({ error: 'AQI and pollutants data required' });
      }
      
      if (!OPENROUTER_API_KEY) {
        return res.json({
          advice: 'AI advice requires OpenRouter API key to be configured.',
        });
      }
      
      const advice = await generateAIHealthAdvice(aqi, pollutants, OPENROUTER_API_KEY);
      res.json({ advice });
    } catch (error) {
      console.error('AI health advice error:', error);
      res.status(500).json({ error: 'Failed to generate AI advice' });
    }
  });

  app.post("/api/ai/forecast-summary", async (req, res) => {
    try {
      const { forecastData } = req.body;
      
      if (!forecastData) {
        return res.status(400).json({ error: 'Forecast data required' });
      }
      
      if (!OPENROUTER_API_KEY) {
        return res.json({
          summary: 'AI forecast summary requires OpenRouter API key to be configured.',
        });
      }
      
      const summary = await generateAIForecastSummary(forecastData, OPENROUTER_API_KEY);
      res.json({ summary });
    } catch (error) {
      console.error('AI forecast summary error:', error);
      res.status(500).json({ error: 'Failed to generate AI summary' });
    }
  });

  app.get("/api/user/:userId/locations", async (req, res) => {
    try {
      const { userId } = req.params;
      const locations = await storage.getUserLocations(userId);
      res.json(locations);
    } catch (error) {
      console.error('Get user locations error:', error);
      res.status(500).json({ error: 'Failed to fetch user locations' });
    }
  });

  app.post("/api/user/:userId/locations", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = insertUserLocationSchema.parse({
        ...req.body,
        userId,
      });
      
      const location = await storage.createUserLocation(validatedData);
      res.json(location);
    } catch (error) {
      console.error('Create user location error:', error);
      res.status(500).json({ error: 'Failed to create user location' });
    }
  });

  app.delete("/api/user/locations/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      await storage.deleteUserLocation(locationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete user location error:', error);
      res.status(500).json({ error: 'Failed to delete user location' });
    }
  });

  app.get("/api/user/:userId/alerts", async (req, res) => {
    try {
      const { userId } = req.params;
      const alerts = await storage.getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error('Get user alerts error:', error);
      res.status(500).json({ error: 'Failed to fetch user alerts' });
    }
  });

  app.post("/api/user/:userId/alerts", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = insertUserAlertSchema.parse({
        ...req.body,
        userId,
      });
      
      const alert = await storage.createUserAlert(validatedData);
      res.json(alert);
    } catch (error) {
      console.error('Create user alert error:', error);
      res.status(500).json({ error: 'Failed to create user alert' });
    }
  });

  app.patch("/api/user/alerts/:alertId", async (req, res) => {
    try {
      const { alertId } = req.params;
      const { enabled } = req.body;
      await storage.updateUserAlert(alertId, enabled);
      res.json({ success: true });
    } catch (error) {
      console.error('Update user alert error:', error);
      res.status(500).json({ error: 'Failed to update user alert' });
    }
  });

  app.delete("/api/user/alerts/:alertId", async (req, res) => {
    try {
      const { alertId } = req.params;
      await storage.deleteUserAlert(alertId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete user alert error:', error);
      res.status(500).json({ error: 'Failed to delete user alert' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
