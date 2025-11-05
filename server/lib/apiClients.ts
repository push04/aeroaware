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
    const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=${radius}&limit=10`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('OpenAQ API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching OpenAQ data:', error);
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
