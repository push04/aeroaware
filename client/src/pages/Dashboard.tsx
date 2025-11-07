import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AQIInsightsCard } from "@/components/AQIInsightsCard";
import { PollutantCard } from "@/components/PollutantCard";
import { LocationSearch } from "@/components/LocationSearch";
import { ForecastChart } from "@/components/ForecastChart";
import { DataExport } from "@/components/DataExport";
import { ShareButton } from "@/components/ShareButton";
import { AQICardSkeleton, ChartSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, RefreshCw, Clock, TrendingUp, Brain, Filter, Check, 
  Wind, Droplets, Sun, Cloud, AlertTriangle, Activity, Heart,
  Leaf, Factory, Car, Shield, BookOpen, Share2, Bell, Star, Flame
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState({ name: "New Delhi, India", lat: 28.6139, lon: 77.2090 });
  const [aiHealthAdvice, setAiHealthAdvice] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pollutantFilter, setPollutantFilter] = useState<string[]>(["pm25", "pm10", "no2", "o3", "so2", "co"]);
  const [savedLocations, setSavedLocations] = useState<any[]>([
    { name: "Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 }
  ]);
  
  const { data: airQualityData, isLoading: isLoadingAQ, refetch: refetchAQ } = useQuery({
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
  const pollutants = airQualityData?.pollutants ?? { pm25: 0, pm10: 0, no2: 0, o3: 0, so2: 0, co: 0 };
  const lastUpdated = airQualityData?.lastUpdated ? new Date(airQualityData.lastUpdated) : null;
  const apiStatus = airQualityData?.apiStatus || 'unknown';

  useEffect(() => {
    if (airQualityData && currentAQI > 0 && !loadingAI) {
      fetchAIHealthAdvice();
    }
  }, [airQualityData?.aqi]);

  const fetchAIHealthAdvice = async () => {
    if (!airQualityData) return;
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai/health-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aqi: currentAQI,
          pollutants: pollutants,
        }),
      });
      const data = await res.json();
      setAiHealthAdvice(data.advice || '');
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      setAiHealthAdvice('');
    } finally {
      setLoadingAI(false);
    }
  };
  
  const forecastData = forecastRawData?.hourly?.slice(0, 72).map((item: any) => ({
    time: new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric' }),
    value: item.aqi ?? (item.pm25 * 2.5),
    uncertainty: {
      lower: (item.aqi ?? (item.pm25 * 2.5)) * 0.88,
      upper: (item.aqi ?? (item.pm25 * 2.5)) * 1.12,
    },
  })) ?? [];

  const getActivityRecommendation = (aqi: number) => {
    if (aqi <= 50) return { icon: Activity, text: "Excellent for all outdoor activities", color: "text-green-600" };
    if (aqi <= 100) return { icon: Heart, text: "Good for most outdoor activities", color: "text-blue-600" };
    if (aqi <= 200) return { icon: AlertTriangle, text: "Limit prolonged outdoor exposure", color: "text-yellow-600" };
    if (aqi <= 300) return { icon: Shield, text: "Avoid outdoor activities", color: "text-orange-600" };
    return { icon: AlertTriangle, text: "Stay indoors, use air purifier", color: "text-red-600" };
  };

  const ActivityIcon = getActivityRecommendation(currentAQI).icon;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Professional Hero Header with Gradient */}
      <div className="relative border-b bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3 animate-fade-in-up">
                AEROAWARE
              </h1>
              <p className="text-lg text-muted-foreground mb-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                Real-Time Air Quality Intelligence for India
              </p>
              <div className="flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                  <MapPin className="h-3 w-3" />
                  {currentLocation.name}
                </Badge>
                {apiStatus === 'healthy' && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Data
                  </Badge>
                )}
                {lastUpdated && (
                  <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                    <Clock className="h-3 w-3" />
                    {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <ShareButton
                location={currentLocation.name}
                aqi={currentAQI}
                category={aqiCategory}
              />
              <DataExport 
                data={airQualityData} 
                filename="aeroaware_dashboard"
                type="dashboard"
              />
              <Button
                variant="default"
                size="sm"
                className="shadow-sm hover:shadow-md transition-all"
                onClick={() => {
                  refetchAQ();
                  refetchForecast();
                  fetchAIHealthAdvice();
                  toast({
                    title: "Data Refreshed",
                    description: "Air quality data has been updated successfully.",
                  });
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar - Dynamic Data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <Card className="p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-background to-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Wind className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Primary Concern</div>
                  <div className="text-sm font-bold">
                    {pollutants.pm25 >= pollutants.pm10 && pollutants.pm25 >= pollutants.no2 ? 'PM2.5' : 
                     pollutants.pm10 >= pollutants.no2 ? 'PM10' : 'NO₂'}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-background to-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">24h Trend</div>
                  <div className="text-sm font-bold">
                    {forecastData.length > 0 && forecastData[forecastData.length - 1]?.value < currentAQI ? 'Improving' : 
                     forecastData.length > 0 && forecastData[forecastData.length - 1]?.value > currentAQI ? 'Worsening' : 'Stable'}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-background to-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <ActivityIcon className={`h-5 w-5 ${getActivityRecommendation(currentAQI).color}`} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Activity Level</div>
                  <div className="text-sm font-bold">{currentAQI <= 100 ? 'Safe' : 'Limited'}</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-background to-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Protection</div>
                  <div className="text-sm font-bold">{currentAQI > 100 ? 'Required' : 'Optional'}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Enhanced with More Content */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Location Search */}
            <Card className="p-5 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in-up">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Search Location
              </h3>
              <LocationSearch
                currentLocation={currentLocation.name}
                onLocationSelect={(loc) => setCurrentLocation(loc)}
              />
            </Card>

            {/* Main AQI Insights Card */}
            {isLoadingAQ ? (
              <AQICardSkeleton />
            ) : airQualityData ? (
              <div className="animate-scale-in">
                <AQIInsightsCard
                  aqi={currentAQI}
                  usAqi={airQualityData?.usAqi}
                  category={aqiCategory}
                  pollutants={pollutants}
                  healthImplications={healthImplications}
                  sparklineData={
                    forecastRawData?.hourly?.slice(0, 24).map((item: any) => 
                      item.aqi ?? (item.pm25 * 2.5)
                    ) || []
                  }
                  lastUpdated={airQualityData?.lastUpdated}
                />
              </div>
            ) : (
              <ErrorState onRetry={refetchAQ} />
            )}

            {/* Quick Activity Recommendation */}
            <Card className="p-5 shadow-lg border-l-4 animate-fade-in-up" style={{ borderLeftColor: getActivityRecommendation(currentAQI).color.includes('green') ? '#22c55e' : getActivityRecommendation(currentAQI).color.includes('red') ? '#ef4444' : '#f97316' }}>
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${currentAQI <= 100 ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                  <ActivityIcon className={`h-6 w-6 ${getActivityRecommendation(currentAQI).color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 text-sm">Activity Guidance</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {getActivityRecommendation(currentAQI).text}
                  </p>
                </div>
              </div>
            </Card>

            {/* Saved Locations Quick Access */}
            <Card className="p-5 shadow-lg animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Saved Locations
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => {
                    const newLocation = prompt("Enter location name:");
                    if (newLocation) {
                      toast({
                        title: "Location Saved",
                        description: `${newLocation} has been added to your saved locations.`,
                      });
                      setSavedLocations([...savedLocations, { name: newLocation, lat: currentLocation.lat, lon: currentLocation.lon }]);
                    }
                  }}
                >
                  + Add
                </Button>
              </div>
              <div className="space-y-2">
                {savedLocations.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentLocation(loc);
                      toast({
                        title: "Location Changed",
                        description: `Now viewing air quality for ${loc.name}`,
                      });
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">{loc.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">View</Badge>
                  </button>
                ))}
              </div>
            </Card>

            {/* Alerts Panel */}
            <Card className="p-5 shadow-lg animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  AQI Alerts
                </h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Configure
                </Button>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Poor AQI Alert</span>
                    <Badge variant="secondary" className="text-xs">ON</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Notify when AQI {'>'}200</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">PM2.5 Spike</span>
                    <Badge variant="outline" className="text-xs">OFF</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Notify when PM2.5 {'>'}60</p>
                </div>
              </div>
            </Card>
            
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-8 space-y-6">

            {/* Pollutant Visualization Cards - Visual, Not Table */}
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Wind className="h-6 w-6 text-primary" />
                  Pollutant Levels
                </h2>
                <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                  Real-Time
                </Badge>
              </div>
              
              {isLoadingAQ ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-40 bg-muted animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[
                    { id: "pm25", name: "PM2.5", value: pollutants.pm25, limit: 60, icon: Droplets, color: "text-blue-600" },
                    { id: "pm10", name: "PM10", value: pollutants.pm10, limit: 100, icon: Cloud, color: "text-indigo-600" },
                    { id: "no2", name: "NO₂", value: pollutants.no2, limit: 80, icon: Car, color: "text-red-600" },
                    { id: "o3", name: "O₃", value: pollutants.o3, limit: 100, icon: Sun, color: "text-yellow-600" },
                    { id: "so2", name: "SO₂", value: pollutants.so2, limit: 80, icon: Factory, color: "text-gray-600" },
                    { id: "co", name: "CO", value: pollutants.co, limit: 4, icon: Flame, color: "text-orange-600" },
                  ].filter(p => pollutantFilter.includes(p.id)).map((pollutant, idx) => {
                    const percentage = Math.min((pollutant.value / pollutant.limit) * 100, 100);
                    const exceedsLimit = pollutant.value > pollutant.limit;
                    const Icon = pollutant.icon;
                    
                    return (
                      <Card 
                        key={pollutant.id} 
                        className="p-5 hover:shadow-xl transition-all duration-200 group animate-scale-in border-l-4" 
                        style={{ 
                          borderLeftColor: exceedsLimit ? '#ef4444' : '#22c55e',
                          animationDelay: `${idx * 50}ms`
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`p-2 rounded-lg ${exceedsLimit ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                <Icon className={`h-4 w-4 ${pollutant.color}`} />
                              </div>
                              <h4 className="text-lg font-bold">{pollutant.name}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">WHO Limit: {pollutant.limit} {pollutant.id === 'co' ? 'mg/m³' : 'µg/m³'}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={exceedsLimit ? "bg-red-500/10 text-red-700 border-red-500/20" : "bg-green-500/10 text-green-700 border-green-500/20"}
                          >
                            {exceedsLimit ? "Above" : "Safe"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-mono">{pollutant.value.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">{pollutant.id === 'co' ? 'mg/m³' : 'µg/m³'}</span>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Level</span>
                              <span className="font-medium">{percentage.toFixed(0)}%</span>
                            </div>
                            <Progress 
                              value={percentage} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Health Recommendation */}
            {aiHealthAdvice && (
              <Card className="p-6 shadow-lg border-l-4 border-l-primary animate-fade-in-up">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">AI Health Recommendation</h3>
                      <Badge variant="secondary" className="text-xs">Powered by AI</Badge>
                      {loadingAI && <span className="text-xs text-muted-foreground">(Updating...)</span>}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aiHealthAdvice}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* 24-Hour Forecast */}
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  24-Hour Forecast
                </h2>
                <Button variant="ghost" size="sm">
                  View 72h →
                </Button>
              </div>
              {isLoadingForecast ? (
                <ChartSkeleton />
              ) : (
                <ForecastChart
                  data={forecastData.slice(0, 24)}
                  pollutant="AQI"
                  title=""
                />
              )}
            </div>

            {/* CPCB Health Recommendations */}
            {healthAdvice.length > 0 && (
              <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    CPCB Health Guidelines
                  </h2>
                  <Badge variant="outline">Official Guidance</Badge>
                </div>
                <Card className="p-6 shadow-lg">
                  <div className="grid gap-4">
                    {healthAdvice.map((advice: string, index: number) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed flex-1 pt-1">{advice}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Info Panel */}
            <Card className="p-6 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 animate-fade-in-up">
              <div className="flex items-start gap-4">
                <BookOpen className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Understanding Air Quality</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    AEROAWARE provides real-time air quality data using CPCB (Central Pollution Control Board) standards, 
                    specifically designed for Indian cities and towns. Our AI-powered forecasts help you plan ahead and protect your health.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <BookOpen className="h-3 w-3 mr-2" />
                      Learn More
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-3 w-3 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  );
}
