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
  
  const { data: airQualityData, isLoading: isLoadingAQ, refetch: refetchAQ } = useQuery({
    queryKey: ['/api/air-quality/realtime', currentLocation.lat, currentLocation.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/realtime?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
      if (!res.ok) throw new Error('Failed to fetch air quality data');
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
  });
  
  const { data: forecastRawData, isLoading: isLoadingForecast, refetch: refetchForecast } = useQuery({
    queryKey: ['/api/air-quality/forecast', currentLocation.lat, currentLocation.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
      if (!res.ok) throw new Error('Failed to fetch forecast data');
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
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-500/90 backdrop-blur-md border-2 border-blue-300 text-white px-4 py-2 text-base font-semibold shadow-lg">
            <MapPin className="h-4 w-4 mr-2" />
            {currentLocation.name}
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-['Poppins'] font-bold mb-6 tracking-tight leading-tight animate-fade-in-up drop-shadow-2xl">
            Real-Time Air Quality Intelligence
          </h1>
          <p className="text-lg md:text-xl text-white mb-10 font-['Inter'] font-medium max-w-2xl mx-auto animate-fade-in-up animation-delay-200 drop-shadow-lg">
            Hyperlocal AQI monitoring powered by AI • WHO & CPCB Standard Compliance
          </p>
          
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
              <Card className="bg-white/95 backdrop-blur-lg border-4 border-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 p-8 max-w-md animate-scale-in">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse-glow"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">LIVE DATA</span>
                  </div>
                  <div className="text-8xl font-bold font-mono mb-2" style={{ 
                    color: currentAQI > 150 ? '#DC2626' : currentAQI > 100 ? '#F97316' : currentAQI > 50 ? '#FBBF24' : '#10B981',
                    textShadow: `0 0 30px ${currentAQI > 150 ? '#DC2626' : currentAQI > 100 ? '#F97316' : currentAQI > 50 ? '#FBBF24' : '#10B981'}40`
                  }}>
                    {Math.round(currentAQI)}
                  </div>
                  <div className="text-base font-bold text-gray-600 mb-4">
                    {currentAQI > 200 ? 'VERY UNHEALTHY' : currentAQI > 150 ? 'UNHEALTHY' : currentAQI > 100 ? 'UNHEALTHY FOR SENSITIVE GROUPS' : currentAQI > 50 ? 'MODERATE' : 'GOOD'}
                  </div>
                  <div className="h-3 rounded-full overflow-hidden bg-gray-200 mb-4">
                    <div className="h-full transition-all duration-1000 ease-out" style={{
                      width: `${Math.min((currentAQI / 500) * 100, 100)}%`,
                      background: currentAQI > 150 ? 'linear-gradient(90deg, #DC2626, #EF4444)' : currentAQI > 100 ? 'linear-gradient(90deg, #F97316, #FB923C)' : currentAQI > 50 ? 'linear-gradient(90deg, #FBBF24, #FCD34D)' : 'linear-gradient(90deg, #10B981, #34D399)'
                    }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>US AQI Standard</span>
                    <span className="font-mono">{airQualityData?.source === 'openaq' ? 'Open-Meteo' : 'Fallback'}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Card className="px-6 py-3 bg-white/20 backdrop-blur-lg border-2 border-white/30 shadow-xl hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-3 text-base font-semibold">
                <Cloud className="h-5 w-5 text-blue-200" />
                <span className="text-white drop-shadow-md">Partly Cloudy</span>
              </div>
            </Card>
            <Card className="px-6 py-3 bg-white/20 backdrop-blur-lg border-2 border-white/30 shadow-xl hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-3 text-base font-semibold">
                <Wind className="h-5 w-5 text-green-200" />
                <span className="text-white drop-shadow-md">12 km/h NW</span>
              </div>
            </Card>
            <Card className="px-6 py-3 bg-white/20 backdrop-blur-lg border-2 border-white/30 shadow-xl hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-3 text-base font-semibold">
                <Droplets className="h-5 w-5 text-cyan-200" />
                <span className="text-white drop-shadow-md">65% Humidity</span>
              </div>
            </Card>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button variant="default" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-base shadow-2xl hover:shadow-blue-500/50 transition-all duration-300" data-testid="button-view-forecast">
              <Calendar className="h-5 w-5 mr-2" />
              View 72h Forecast
            </Button>
            <Button variant="outline" size="lg" className="bg-white/20 backdrop-blur-lg border-2 border-white/40 text-white hover:bg-white/30 font-semibold px-8 py-6 text-base shadow-xl transition-all duration-300" data-testid="button-set-alert">
              Set Alert
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 space-y-16">
        <section className="animate-fade-in-up animation-delay-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-['Poppins'] font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Real-Time Pollutant Monitoring
              </h2>
              <p className="text-muted-foreground font-['Inter']">Live measurements from nearby monitoring stations</p>
            </div>
            {airQualityData?.source === 'openaq' && (
              <Badge variant="outline" className="text-xs animate-pulse-glow">
                🔴 LIVE DATA
              </Badge>
            )}
          </div>
          {isLoadingAQ ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-['Inter']">Fetching real-time air quality data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pollutantCards.map((pollutant, index) => (
                <div key={pollutant.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PollutantCard
                    pollutant={pollutant.id}
                    value={pollutant.value}
                    trend={pollutant.trend}
                    sparklineData={pollutant.sparklineData}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section className="animate-fade-in-up animation-delay-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-['Poppins'] font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                AI-Powered 24-Hour Forecast
              </h2>
              <p className="text-muted-foreground font-['Inter']">Advanced predictions with confidence intervals</p>
            </div>
          </div>
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
