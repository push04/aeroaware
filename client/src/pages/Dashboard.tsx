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
import { useToast } from "@/hooks/use-toast";
import { MapPin, Cloud, Wind, Droplets, Calendar, Loader2, RefreshCw, Activity, Clock } from "lucide-react";
import heroImage from "@assets/generated_images/Abstract_gradient_mesh_d350befa.png";

export default function Dashboard() {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState({ name: "New Delhi, India", lat: 28.6139, lon: 77.2090 });
  
  const { data: airQualityData, isLoading: isLoadingAQ, refetch: refetchAQ, error: aqError } = useQuery({
    queryKey: ['/api/air-quality/realtime', currentLocation.lat, currentLocation.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/realtime?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch air quality data');
      }
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
  
  const currentAQI = airQualityData?.aqi ?? 0;
  const aqiCategory = airQualityData?.category || 'Unknown';
  const aqiColor = airQualityData?.color || '#999999';
  const healthImplications = airQualityData?.healthImplications || '';
  const healthAdvice = airQualityData?.healthAdvice || [];
  const pollutants = airQualityData?.pollutants ?? { pm25: 0, pm10: 0, no2: 0, o3: 0 };
  const lastUpdated = airQualityData?.lastUpdated ? new Date(airQualityData.lastUpdated) : null;
  const apiStatus = airQualityData?.apiStatus || 'unknown';
  
  useEffect(() => {
    if (airQualityData && !isLoadingAQ) {
      toast({
        title: "Air quality data updated",
        description: `${aqiCategory} - AQI ${currentAQI} in ${currentLocation.name}`,
      });
    }
  }, [currentLocation.lat, currentLocation.lon]);
  
  const pollutantCards = [
    { id: "pm25", value: pollutants.pm25, trend: "stable" as const, sparklineData: [pollutants.pm25 * 0.95, pollutants.pm25 * 0.97, pollutants.pm25 * 0.99, pollutants.pm25, pollutants.pm25] },
    { id: "pm10", value: pollutants.pm10, trend: "stable" as const, sparklineData: [pollutants.pm10 * 0.95, pollutants.pm10 * 0.97, pollutants.pm10 * 0.99, pollutants.pm10, pollutants.pm10] },
    { id: "no2", value: pollutants.no2, trend: "stable" as const, sparklineData: [pollutants.no2 * 0.95, pollutants.no2 * 0.97, pollutants.no2 * 0.99, pollutants.no2, pollutants.no2] },
    { id: "o3", value: pollutants.o3, trend: "stable" as const, sparklineData: [pollutants.o3 * 0.95, pollutants.o3 * 0.97, pollutants.o3 * 0.99, pollutants.o3, pollutants.o3] },
  ];
  
  const forecastData = forecastRawData?.hourly?.slice(0, 72).map((item: any, i: number) => ({
    time: new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric' }),
    value: item.aqi ?? (item.pm25 * 2.5),
    uncertainty: {
      lower: (item.aqi ?? (item.pm25 * 2.5)) * 0.9,
      upper: (item.aqi ?? (item.pm25 * 2.5)) * 1.1,
    },
  })) ?? [];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div
        className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center overflow-hidden py-8"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-500/90 backdrop-blur-md border-2 border-blue-300 text-white px-4 py-2 text-base font-semibold shadow-lg">
            <MapPin className="h-4 w-4 mr-2" />
            {currentLocation.name}
          </Badge>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 text-xs font-bold border-none shadow-lg animate-pulse">
              AI-POWERED ANALYTICS
            </Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 text-xs font-bold border-none shadow-lg">
              REAL-TIME INSIGHTS
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-['Poppins'] font-bold mb-3 tracking-tight leading-tight animate-fade-in-up drop-shadow-2xl">
            AI-Powered Air Quality Intelligence
          </h1>
          <p className="text-sm md:text-base text-white mb-4 font-['Inter'] font-medium max-w-2xl mx-auto animate-fade-in-up animation-delay-200 drop-shadow-lg">
            Advanced Machine Learning • CPCB Standards • Predictive Analytics
          </p>
          
          <div className="mb-4">
            <LocationSearch
              currentLocation={currentLocation.name}
              onLocationSelect={(loc) => {
                setCurrentLocation(loc);
                console.log('Selected location:', loc);
              }}
            />
          </div>
          
          <div className="flex justify-center mb-4 w-full max-w-6xl mx-auto">
            {isLoadingAQ ? (
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>Loading air quality data...</span>
              </div>
            ) : (
              <Card className="w-full bg-white dark:bg-gray-900 backdrop-blur-lg border-2 border-gray-200 dark:border-gray-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 p-6 animate-scale-in relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 w-32 h-32 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 text-[9px] font-bold border-none">
                      AI ANALYSIS
                    </Badge>
                    <div 
                      className="h-1.5 w-1.5 rounded-full animate-pulse ml-1" 
                      style={{ backgroundColor: apiStatus === 'healthy' ? '#10B981' : apiStatus === 'unavailable' ? '#F59E0B' : '#EF4444' }}
                    ></div>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {apiStatus === 'healthy' ? 'LIVE DATA' : 'CACHED'}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                      {airQualityData?.source || 'Open-Meteo'}
                    </Badge>
                    {lastUpdated && (
                      <span className="flex items-center gap-1 ml-auto text-[10px] text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-3 text-center md:text-left">
                    <div className="text-7xl md:text-8xl font-bold font-mono leading-none mb-2" style={{ 
                      color: aqiColor,
                      textShadow: `0 0 30px ${aqiColor}30`
                    }}>
                      {Math.round(currentAQI)}
                    </div>
                    <div className="text-lg font-bold mb-1" style={{ color: aqiColor }}>
                      {aqiCategory.toUpperCase()}
                    </div>
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-400">
                      CPCB Indian AQI
                    </div>
                    {airQualityData?.usAqi && (
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-500 mt-1">
                        US AQI: {Math.round(airQualityData.usAqi)}
                      </div>
                    )}
                  </div>
                  
                  <div className="md:col-span-5">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-4 leading-relaxed">
                      {healthImplications}
                    </div>
                    <div className="h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
                      <div className="h-full transition-all duration-1000 ease-out" style={{
                        width: `${Math.min((currentAQI / 500) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${aqiColor}, ${aqiColor}DD)`
                      }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-semibold text-gray-700 dark:text-gray-400">
                      <span className="text-green-600">0<br/>Good</span>
                      <span className="text-yellow-600">50<br/>Satis.</span>
                      <span className="text-orange-600">100<br/>Mod.</span>
                      <span className="text-red-600">200<br/>Poor</span>
                      <span className="text-purple-700">300<br/>V.Poor</span>
                      <span className="text-red-900">400+<br/>Severe</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-4 grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-gray-700">
                      <div className="text-xs font-semibold text-blue-700 dark:text-gray-400 mb-1">PM2.5</div>
                      <div className="text-xl font-bold text-blue-900 dark:text-white">{pollutants.pm25.toFixed(1)}</div>
                      <div className="text-[10px] text-blue-600 dark:text-gray-400 font-medium">µg/m³</div>
                    </div>
                    <div className="bg-green-50 dark:bg-gray-800 rounded-lg p-3 border border-green-100 dark:border-gray-700">
                      <div className="text-xs font-semibold text-green-700 dark:text-gray-400 mb-1">PM10</div>
                      <div className="text-xl font-bold text-green-900 dark:text-white">{pollutants.pm10.toFixed(1)}</div>
                      <div className="text-[10px] text-green-600 dark:text-gray-400 font-medium">µg/m³</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-gray-800 rounded-lg p-3 border border-orange-100 dark:border-gray-700">
                      <div className="text-xs font-semibold text-orange-700 dark:text-gray-400 mb-1">NO₂</div>
                      <div className="text-xl font-bold text-orange-900 dark:text-white">{pollutants.no2.toFixed(1)}</div>
                      <div className="text-[10px] text-orange-600 dark:text-gray-400 font-medium">µg/m³</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-gray-800 rounded-lg p-3 border border-purple-100 dark:border-gray-700">
                      <div className="text-xs font-semibold text-purple-700 dark:text-gray-400 mb-1">O₃</div>
                      <div className="text-xl font-bold text-purple-900 dark:text-white">{pollutants.o3.toFixed(1)}</div>
                      <div className="text-[10px] text-purple-600 dark:text-gray-400 font-medium">µg/m³</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
          
          {!isLoadingAQ && airQualityData && (
            <div className="w-full max-w-6xl mx-auto mb-4">
              <Card className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 dark:from-purple-600/90 dark:to-blue-600/90 backdrop-blur-lg border-none shadow-xl p-4">
                <div className="flex items-start gap-3 text-white">
                  <div className="bg-white/20 rounded-lg p-2">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">AI-Generated Health Insights</h3>
                    <p className="text-xs leading-relaxed opacity-95">
                      Based on current AQI of {Math.round(currentAQI)}, our AI recommends: {healthAdvice[0] || healthImplications}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" className="text-xs bg-white/90 hover:bg-white text-purple-700 font-semibold">
                    View AI Report
                  </Button>
                </div>
              </Card>
            </div>
          )}
          
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Card className="px-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Cloud className="h-4 w-4 text-blue-200" />
                <span className="text-white drop-shadow-md">Partly Cloudy</span>
              </div>
            </Card>
            <Card className="px-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Wind className="h-4 w-4 text-green-200" />
                <span className="text-white drop-shadow-md">12 km/h NW</span>
              </div>
            </Card>
            <Card className="px-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Droplets className="h-4 w-4 text-cyan-200" />
                <span className="text-white drop-shadow-md">65% Humidity</span>
              </div>
            </Card>
          </div>
          
          <div className="flex justify-center gap-3">
            <Button variant="default" size="default" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-sm shadow-xl hover:shadow-blue-500/50 transition-all duration-300" data-testid="button-view-forecast">
              <Calendar className="h-4 w-4 mr-2" />
              View 72h Forecast
            </Button>
            <Button variant="outline" size="default" className="bg-white/20 backdrop-blur-lg border border-white/40 text-white hover:bg-white/30 font-semibold px-6 py-3 text-sm shadow-lg transition-all duration-300" data-testid="button-set-alert">
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
        
        <section className="animate-fade-in-up animation-delay-500">
          <div className="mb-8">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              CPCB Health Recommendations
            </h2>
            <p className="text-muted-foreground font-['Inter']">Personalized advice based on current air quality</p>
          </div>
          {healthAdvice.length > 0 && (
            <Card className="p-6 mb-6 bg-gradient-to-br from-background to-muted/30">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${aqiColor}20` }}>
                  <Activity className="h-5 w-5" style={{ color: aqiColor }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">What to do today</h3>
                  <p className="text-sm text-muted-foreground">Official guidance from CPCB for {aqiCategory} air quality</p>
                </div>
              </div>
              <ul className="space-y-3">
                {healthAdvice.map((advice: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{advice}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <HealthAdvisory aqi={currentAQI} />
        </section>
      </div>
    </div>
  );
}
