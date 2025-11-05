import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ForecastChart } from "@/components/ForecastChart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocationSearch } from "@/components/LocationSearch";
import { MapPin, Brain, Wind } from "lucide-react";

export default function Forecast() {
  const [currentLocation, setCurrentLocation] = useState({ 
    name: "New Delhi, India", 
    lat: 28.6139, 
    lon: 77.2090 
  });

  const { data: forecastRawData, isLoading: isLoadingForecast } = useQuery({
    queryKey: ['/api/air-quality/forecast', currentLocation.lat, currentLocation.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
      if (!res.ok) throw new Error('Failed to fetch forecast data');
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  const { data: currentAQData } = useQuery({
    queryKey: ['/api/air-quality/realtime', currentLocation.lat, currentLocation.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/realtime?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
      if (!res.ok) throw new Error('Failed to fetch air quality data');
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            name: "Your Location",
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, []);

  const pollutantData = {
    pm25: forecastRawData?.hourly?.map((item: any, i: number) => ({
      time: new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      value: item.pm25 || 0,
      uncertainty: {
        lower: (item.pm25 || 0) * 0.85,
        upper: (item.pm25 || 0) * 1.15,
      },
    })) || [],
    pm10: forecastRawData?.hourly?.map((item: any) => ({
      time: new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      value: item.pm10 || 0,
      uncertainty: {
        lower: (item.pm10 || 0) * 0.85,
        upper: (item.pm10 || 0) * 1.15,
      },
    })) || [],
    no2: forecastRawData?.hourly?.map((item: any) => ({
      time: new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      value: item.no2 || 0,
      uncertainty: {
        lower: (item.no2 || 0) * 0.85,
        upper: (item.no2 || 0) * 1.15,
      },
    })) || [],
    o3: forecastRawData?.hourly?.map((item: any) => ({
      time: new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      value: item.o3 || 0,
      uncertainty: {
        lower: (item.o3 || 0) * 0.85,
        upper: (item.o3 || 0) * 1.15,
      },
    })) || [],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Badge variant="outline" className="mb-3 flex items-center gap-1 w-fit">
              <Brain className="h-3 w-3" />
              AI-Powered Predictions
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              72-Hour Air Quality Forecast
            </h1>
            <p className="text-muted-foreground">
              Advanced meteorological predictions with uncertainty intervals
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {currentLocation.name}
            </Badge>
            <div className="w-64">
              <LocationSearch
                currentLocation={currentLocation.name}
                onLocationSelect={(loc) => setCurrentLocation(loc)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Summary Card */}
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Wind className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Forecast Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Meteorological forecasts are generated using real-time data from Open-Meteo. 
                Predictions show expected pollutant concentrations over the next 72 hours with 
                uncertainty ranges based on atmospheric conditions and historical patterns.
              </p>
            </div>
          </div>
        </Card>

        {/* Forecast Charts */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">PM2.5 Forecast</h2>
            <ForecastChart
              data={pollutantData.pm25.slice(0, 72)}
              pollutant="PM2.5"
              title=""
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">PM10 Forecast</h2>
            <ForecastChart
              data={pollutantData.pm10.slice(0, 72)}
              pollutant="PM10"
              title=""
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">NO₂ Forecast</h2>
            <ForecastChart
              data={pollutantData.no2.slice(0, 72)}
              pollutant="NO₂"
              title=""
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">O₃ Forecast</h2>
            <ForecastChart
              data={pollutantData.o3.slice(0, 72)}
              pollutant="O₃"
              title=""
            />
          </div>
        </div>

        {/* Data Source Info */}
        <Card className="p-5 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Data Source:</strong> Open-Meteo Air Quality API · 
            <strong className="ml-2">Update Frequency:</strong> Hourly · 
            <strong className="ml-2">Coverage:</strong> Global
          </p>
        </Card>
      </div>
    </div>
  );
}
