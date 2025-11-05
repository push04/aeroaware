import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AQIGauge } from "@/components/AQIGauge";
import { PollutantCard } from "@/components/PollutantCard";
import { LocationSearch } from "@/components/LocationSearch";
import { HealthAdvisory } from "@/components/HealthAdvisory";
import { ForecastChart } from "@/components/ForecastChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Cloud, Wind, Droplets, Calendar, Loader2 } from "lucide-react";
import heroImage from "@assets/generated_images/Abstract_gradient_mesh_d350befa.png";

export default function Dashboard() {
  const [currentLocation, setCurrentLocation] = useState({ name: "New Delhi, India", lat: 28.6139, lon: 77.2090 });
  
  const { data: airQualityData, isLoading: isLoadingAQ } = useQuery({
    queryKey: ['/api/air-quality/realtime', currentLocation.lat, currentLocation.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/realtime?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
      if (!res.ok) throw new Error('Failed to fetch air quality data');
      return res.json();
    },
  });
  
  const { data: forecastRawData, isLoading: isLoadingForecast } = useQuery({
    queryKey: ['/api/air-quality/forecast', currentLocation.lat, currentLocation.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
      if (!res.ok) throw new Error('Failed to fetch forecast data');
      return res.json();
    },
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
          console.log('Geolocation detected:', position.coords);
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, []);
  
  const currentAQI = airQualityData?.aqi || 85;
  const pollutants = airQualityData?.pollutants || { pm25: 35.6, pm10: 58.2, no2: 42.1, o3: 68.5 };
  
  const pollutantCards = [
    { id: "pm25", value: pollutants.pm25, trend: "stable" as const, sparklineData: [pollutants.pm25 * 0.95, pollutants.pm25 * 0.97, pollutants.pm25 * 0.99, pollutants.pm25, pollutants.pm25] },
    { id: "pm10", value: pollutants.pm10, trend: "stable" as const, sparklineData: [pollutants.pm10 * 0.95, pollutants.pm10 * 0.97, pollutants.pm10 * 0.99, pollutants.pm10, pollutants.pm10] },
    { id: "no2", value: pollutants.no2, trend: "stable" as const, sparklineData: [pollutants.no2 * 0.95, pollutants.no2 * 0.97, pollutants.no2 * 0.99, pollutants.no2, pollutants.no2] },
    { id: "o3", value: pollutants.o3, trend: "stable" as const, sparklineData: [pollutants.o3 * 0.95, pollutants.o3 * 0.97, pollutants.o3 * 0.99, pollutants.o3, pollutants.o3] },
  ];
  
  const forecastData = forecastRawData?.hourly?.slice(0, 72).map((item: any, i: number) => ({
    time: new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric' }),
    value: item.aqi || (item.pm25 * 2.5),
    uncertainty: {
      lower: (item.aqi || (item.pm25 * 2.5)) * 0.9,
      upper: (item.aqi || (item.pm25 * 2.5)) * 1.1,
    },
  })) || Array.from({ length: 72 }, (_, i) => ({
    time: `${i}h`,
    value: currentAQI + Math.sin(i / 12) * 20,
    uncertainty: {
      lower: currentAQI + Math.sin(i / 12) * 15,
      upper: currentAQI + Math.sin(i / 12) * 25,
    },
  }));
  
  return (
    <div className="min-h-screen bg-background">
      <div
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4 bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <MapPin className="h-3 w-3 mr-1" />
            {currentLocation.name}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-serif font-semibold mb-4 tracking-tight">
            Air Quality Right Now
          </h1>
          
          <div className="mb-8">
            <LocationSearch
              currentLocation={currentLocation.name}
              onLocationSelect={(loc) => {
                setCurrentLocation(loc);
                console.log('Selected location:', loc);
              }}
            />
          </div>
          
          <div className="flex justify-center mb-8">
            {isLoadingAQ ? (
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>Loading air quality data...</span>
              </div>
            ) : (
              <AQIGauge aqi={currentAQI} standard="WHO" size="lg" />
            )}
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Card className="px-4 py-2 bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center gap-2 text-sm">
                <Cloud className="h-4 w-4" />
                <span>Partly Cloudy</span>
              </div>
            </Card>
            <Card className="px-4 py-2 bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center gap-2 text-sm">
                <Wind className="h-4 w-4" />
                <span>12 km/h NW</span>
              </div>
            </Card>
            <Card className="px-4 py-2 bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4" />
                <span>65% Humidity</span>
              </div>
            </Card>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button variant="default" size="lg" data-testid="button-view-forecast">
              <Calendar className="h-4 w-4 mr-2" />
              View 72h Forecast
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" data-testid="button-set-alert">
              Set Alert
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-12">
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-6">Live Pollutant Levels</h2>
          {isLoadingAQ ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading pollutant data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pollutantCards.map((pollutant) => (
                <PollutantCard
                  key={pollutant.id}
                  pollutant={pollutant.id}
                  value={pollutant.value}
                  trend={pollutant.trend}
                  sparklineData={pollutant.sparklineData}
                />
              ))}
            </div>
          )}
        </section>
        
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-6">24-Hour Forecast</h2>
          {isLoadingForecast ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading forecast data...</span>
            </div>
          ) : (
            <ForecastChart
              data={forecastData.slice(0, 24)}
              pollutant="AQI"
              title="Air Quality Index Prediction"
            />
          )}
        </section>
        
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-6">Health Recommendations</h2>
          <HealthAdvisory aqi={currentAQI} />
        </section>
      </div>
    </div>
  );
}
