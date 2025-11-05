import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AQIInsightsCard } from "@/components/AQIInsightsCard";
import { PollutantCard } from "@/components/PollutantCard";
import { LocationSearch } from "@/components/LocationSearch";
import { HealthAdvisory } from "@/components/HealthAdvisory";
import { ForecastChart } from "@/components/ForecastChart";
import { DataExport } from "@/components/DataExport";
import { AQICardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, RefreshCw, Activity, Clock, TrendingUp, Brain, Download, Filter, Check } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState({ name: "New Delhi, India", lat: 28.6139, lon: 77.2090 });
  const [aiHealthAdvice, setAiHealthAdvice] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pollutantFilter, setPollutantFilter] = useState<string[]>(["pm25", "pm10", "no2", "o3", "so2", "co"]);
  
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
  
  const pollutantCards = [
    { id: "pm25", value: pollutants.pm25, trend: pollutants.pm25 > 60 ? "up" as const : "stable" as const, sparklineData: [pollutants.pm25 * 0.92, pollutants.pm25 * 0.96, pollutants.pm25 * 0.98, pollutants.pm25 * 0.99, pollutants.pm25] },
    { id: "pm10", value: pollutants.pm10, trend: pollutants.pm10 > 100 ? "up" as const : "stable" as const, sparklineData: [pollutants.pm10 * 0.92, pollutants.pm10 * 0.96, pollutants.pm10 * 0.98, pollutants.pm10 * 0.99, pollutants.pm10] },
    { id: "no2", value: pollutants.no2, trend: "stable" as const, sparklineData: [pollutants.no2 * 0.92, pollutants.no2 * 0.96, pollutants.no2 * 0.98, pollutants.no2 * 0.99, pollutants.no2] },
    { id: "o3", value: pollutants.o3, trend: "stable" as const, sparklineData: [pollutants.o3 * 0.92, pollutants.o3 * 0.96, pollutants.o3 * 0.98, pollutants.o3 * 0.99, pollutants.o3] },
    { id: "so2", value: pollutants.so2, trend: "stable" as const, sparklineData: [pollutants.so2 * 0.92, pollutants.so2 * 0.96, pollutants.so2 * 0.98, pollutants.so2 * 0.99, pollutants.so2] },
    { id: "co", value: pollutants.co, trend: "stable" as const, sparklineData: [pollutants.co * 0.92, pollutants.co * 0.96, pollutants.co * 0.98, pollutants.co * 0.99, pollutants.co] },
  ];
  
  const forecastData = forecastRawData?.hourly?.slice(0, 72).map((item: any) => ({
    time: new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric' }),
    value: item.aqi ?? (item.pm25 * 2.5),
    uncertainty: {
      lower: (item.aqi ?? (item.pm25 * 2.5)) * 0.88,
      upper: (item.aqi ?? (item.pm25 * 2.5)) * 1.12,
    },
  })) ?? [];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Clean Professional Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                AEROAWARE Air Quality Platform
              </h1>
              <p className="text-muted-foreground">
                Real-Time Monitoring · Hyperlocal Forecasts · CPCB Standards
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <DataExport 
                data={airQualityData} 
                filename="aeroaware_dashboard"
                type="dashboard"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchAQ();
                  refetchForecast();
                  fetchAIHealthAdvice();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {currentLocation.name}
            </Badge>
            {apiStatus === 'healthy' && (
              <Badge variant="outline" className="flex items-center gap-1.5 bg-accent/10 border-accent text-accent">
                <span className="h-2 w-2 rounded-full bg-accent"></span>
                Live Data
              </Badge>
            )}
            {lastUpdated && (
              <Badge variant="outline" className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - AQI Insights Card */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Location Search */}
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </h3>
              <LocationSearch
                currentLocation={currentLocation.name}
                onLocationSelect={(loc) => setCurrentLocation(loc)}
              />
            </Card>

            {/* Detailed AQI Insights Card */}
            {isLoadingAQ ? (
              <AQICardSkeleton />
            ) : airQualityData ? (
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
            ) : (
              <ErrorState onRetry={refetchAQ} />
            )}
            
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter Panel */}
            {showFilters && (
              <Card className="p-4 bg-muted/30">
                <h3 className="text-sm font-semibold mb-3">Filter Pollutants</h3>
                <div className="flex flex-wrap gap-2">
                  {['pm25', 'pm10', 'no2', 'o3', 'so2', 'co'].map((pollutant) => (
                    <Button
                      key={pollutant}
                      variant={pollutantFilter.includes(pollutant) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setPollutantFilter(prev =>
                          prev.includes(pollutant)
                            ? prev.filter(p => p !== pollutant)
                            : [...prev, pollutant]
                        );
                      }}
                    >
                      {pollutantFilter.includes(pollutant) && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      {pollutant.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Pollutant Data Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Pollutant Measurements</h2>
                <Badge variant="outline" className="bg-accent/10 border-accent text-accent">
                  Real-Time Data
                </Badge>
              </div>
              {isLoadingAQ ? (
                <TableSkeleton />
              ) : (
                <Card className="overflow-hidden">
                  <div className="divide-y">
                    <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-semibold text-sm">
                      <div>Pollutant</div>
                      <div className="text-right">Value</div>
                      <div className="text-right">Unit</div>
                      <div className="text-right">WHO Limit</div>
                      <div className="text-right">Status</div>
                    </div>
                    {[
                      { name: 'PM2.5', key: 'pm25', value: pollutants.pm25, unit: 'µg/m³', limit: 15 },
                      { name: 'PM10', key: 'pm10', value: pollutants.pm10, unit: 'µg/m³', limit: 45 },
                      { name: 'NO₂', key: 'no2', value: pollutants.no2, unit: 'µg/m³', limit: 25 },
                      { name: 'O₃', key: 'o3', value: pollutants.o3, unit: 'µg/m³', limit: 100 },
                      { name: 'SO₂', key: 'so2', value: pollutants.so2, unit: 'µg/m³', limit: 40 },
                      { name: 'CO', key: 'co', value: pollutants.co, unit: 'mg/m³', limit: 4 },
                    ].filter(p => pollutantFilter.includes(p.key)).map((pollutant) => {
                      const exceedsLimit = pollutant.value > pollutant.limit;
                      return (
                        <div key={pollutant.key} className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/30 transition-colors">
                          <div className="font-medium">{pollutant.name}</div>
                          <div className="text-right font-mono font-semibold">{pollutant.value.toFixed(1)}</div>
                          <div className="text-right text-sm text-muted-foreground">{pollutant.unit}</div>
                          <div className="text-right text-sm text-muted-foreground">{pollutant.limit}</div>
                          <div className="text-right">
                            <Badge variant="outline" className={exceedsLimit ? "bg-warning/10 border-warning text-warning" : "bg-accent/10 border-accent text-accent"}>
                              {exceedsLimit ? "Above" : "Within"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>

            {/* AI Health Recommendation */}
            {aiHealthAdvice && (
              <Card className="p-5 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      AI Health Recommendation
                      {loadingAI && <span className="text-xs text-muted-foreground">(Updating...)</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aiHealthAdvice}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Forecast Preview */}
            <div>
              <h2 className="text-xl font-semibold mb-4">24-Hour Forecast</h2>
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

            {/* Health Recommendations */}
            {healthAdvice.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">CPCB Health Recommendations</h2>
                <Card className="p-5">
                  <ul className="space-y-3">
                    {healthAdvice.map((advice: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-semibold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed flex-1">{advice}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
