interface OpenAQMeasurement {
  parameter: string;
  value: number;
  lastUpdated: string;
  unit: string;
}

interface OpenAQLocation {
  id: number;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  measurements: OpenAQMeasurement[];
}

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

interface AirQualityForecast {
  time: string[];
  pm10: number[];
  pm2_5: number[];
  nitrogen_dioxide: number[];
  ozone: number[];
  european_aqi: number[];
}

export async function fetchOpenAQData(lat: number, lon: number, radius = 25000) {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide,us_aqi,european_aqi`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Open-Meteo Air Quality API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.current) {
      return null;
    }

    return [{
      id: 1,
      name: `Location at ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      coordinates: { latitude: lat, longitude: lon },
      latest: [
        { parameter: { name: 'pm25' }, value: data.current.pm2_5 ?? null },
        { parameter: { name: 'pm10' }, value: data.current.pm10 ?? null },
        { parameter: { name: 'no2' }, value: data.current.nitrogen_dioxide ?? null },
        { parameter: { name: 'o3' }, value: data.current.ozone ?? null },
        { parameter: { name: 'so2' }, value: data.current.sulphur_dioxide ?? null },
        { parameter: { name: 'co' }, value: data.current.carbon_monoxide ?? null },
        { parameter: { name: 'us_aqi' }, value: data.current.us_aqi ?? null },
      ].filter(m => m.value !== null)
    }];
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return null;
  }
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    return [];
  }
}

export async function fetchAirQualityForecast(lat: number, lon: number): Promise<AirQualityForecast | null> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,nitrogen_dioxide,ozone,european_aqi&forecast_days=3`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Air Quality Forecast API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.hourly || null;
  } catch (error) {
    console.error('Error fetching air quality forecast:', error);
    return null;
  }
}

export async function fetchNASAFIRMS(lat: number, lon: number, days = 1) {
  try {
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/NOAA_VIIRS/${lat},${lon},100/${days}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('NASA FIRMS API error:', response.status);
      return [];
    }
    
    const csvData = await response.text();
    const lines = csvData.split('\n');
    const fires = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const parts = line.split(',');
        if (parts.length >= 3) {
          fires.push({
            latitude: parseFloat(parts[0]),
            longitude: parseFloat(parts[1]),
            confidence: parseFloat(parts[2]),
          });
        }
      }
    }
    
    return fires;
  } catch (error) {
    console.error('Error fetching NASA FIRMS data:', error);
    return [];
  }
}

export async function generateAIHealthAdvice(aqi: number, pollutants: any, apiKey: string): Promise<string> {
  try {
    const prompt = `As an air quality health expert, provide concise health advice for current conditions:
AQI: ${aqi}
Pollutants: PM2.5=${pollutants.pm25}µg/m³, PM10=${pollutants.pm10}µg/m³, NO₂=${pollutants.no2}µg/m³, O₃=${pollutants.o3}µg/m³

Provide 2-3 practical recommendations in 2-3 sentences. Focus on what people should do today.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://breathewise.app',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status);
      return 'Unable to generate AI advice at this time. Please check general health guidelines for your AQI level.';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate AI advice.';
  } catch (error) {
    console.error('Error generating AI health advice:', error);
    return 'Unable to generate AI advice at this time.';
  }
}

export async function generateAIForecastSummary(forecastData: any, apiKey: string): Promise<string> {
  try {
    const prompt = `As an air quality analyst, provide a brief forecast summary for the next 72 hours based on this data:
Average AQI trend: ${forecastData.avgTrend}
Peak periods: ${forecastData.peakPeriods}
Weather factors: ${forecastData.weatherFactors}

Write 2-3 sentences explaining what to expect and why. Be specific and actionable.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://breathewise.app',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status);
      return 'Forecast data available. Check the charts for detailed predictions.';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Forecast summary unavailable.';
  } catch (error) {
    console.error('Error generating AI forecast summary:', error);
    return 'Forecast summary unavailable.';
  }
}

export async function generateAIEnhancedForecast(forecastData: any, currentData: any, apiKey: string) {
  try {
    const prompt = `You are an air quality prediction AI. Given current measurements and meteorological forecasts, predict hyperlocal air quality for the next 72 hours.

CURRENT DATA:
- Current AQI: ${currentData.aqi || 'N/A'}
- PM2.5: ${currentData.pm25 || 'N/A'} µg/m³
- PM10: ${currentData.pm10 || 'N/A'} µg/m³
- NO₂: ${currentData.no2 || 'N/A'} µg/m³
- O₃: ${currentData.o3 || 'N/A'} µg/m³

METEOROLOGICAL FORECAST (next 72 hours):
${JSON.stringify(forecastData.hourly?.slice(0, 72).map((h: any, i: number) => ({
  hour: i,
  pm25: h.pm25,
  pm10: h.pm10,
  no2: h.no2,
  o3: h.o3,
  aqi: h.aqi
})).slice(0, 24), null, 2)}

TASK: Analyze patterns and predict:
1. AQI trends for next 24, 48, and 72 hours
2. Peak pollution periods (time ranges)
3. Uncertainty ranges (±10-30% based on meteorological variability)
4. Key factors affecting predictions

Return ONLY valid JSON in this exact format:
{
  "predictions": {
    "24h": {"avgAQI": number, "peakAQI": number, "confidence": "high|medium|low"},
    "48h": {"avgAQI": number, "peakAQI": number, "confidence": "high|medium|low"},
    "72h": {"avgAQI": number, "peakAQI": number, "confidence": "high|medium|low"}
  },
  "peakPeriods": ["morning hours", "evening commute"],
  "uncertaintyFactors": ["wind patterns", "temperature inversion"],
  "summary": "brief 2-sentence summary"
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aeroaware.app',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an air quality prediction model. Always respond with valid JSON only, no markdown or explanations.'
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status);
      return null;
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (parseError) {
      console.error('Failed to parse AI prediction response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error generating AI-enhanced forecast:', error);
    return null;
  }
}
