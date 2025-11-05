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
import { MapPin, Cloud, Wind, Droplets, Calendar, Loader2, RefreshCw, Activity, Clock, AlertTriangle, TrendingUp, Download, BarChart3, Zap, Brain, Shield, Bell } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState({ name: "New Delhi, India", lat: 28.6139, lon: 77.2090 });
  const [aiHealthAdvice, setAiHealthAdvice] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  
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

  // Fetch AI health advice when AQI data changes
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

  // Calculate AQI bar position based on CPCB breakpoints
  const getAQIBarPosition = (aqi: number): number => {
    // CPCB Breakpoints: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500)
    if (aqi <= 50) return (aqi / 50) * 16.67;
    if (aqi <= 100) return 16.67 + ((aqi - 50) / 50) * 16.67;
    if (aqi <= 200) return 33.34 + ((aqi - 100) / 100) * 33.33;
    if (aqi <= 300) return 66.67 + ((aqi - 200) / 100) * 16.67;
    if (aqi <= 400) return 83.34 + ((aqi - 300) / 100) * 8.33;
    if (aqi <= 500) return 91.67 + ((aqi - 400) / 100) * 8.33;
    return 100;
  };

  const getRiskScore = (aqi: number) => {
    if (aqi <= 50) return { score: 95, label: "Minimal Risk", color: "text-green-600 dark:text-green-400" };
    if (aqi <= 100) return { score: 75, label: "Low Risk", color: "text-lime-600 dark:text-lime-400" };
    if (aqi <= 200) return { score: 50, label: "Moderate Risk", color: "text-yellow-600 dark:text-yellow-400" };
    if (aqi <= 300) return { score: 30, label: "High Risk", color: "text-orange-600 dark:text-orange-400" };
    if (aqi <= 400) return { score: 15, label: "Severe Risk", color: "text-red-600 dark:text-red-400" };
    return { score: 5, label: "Critical Risk", color: "text-purple-600 dark:text-purple-400" };
  };

  const healthScore = getRiskScore(currentAQI);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/20">
      {/* Professional Header */}
      <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 text-white shadow-2xl border-b-4 border-blue-500/30">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-lg">
                  Intelligence Platform
                </h1>
              </div>
              <p className="text-blue-100 text-sm md:text-base font-medium pl-13">
                Advanced Analytics · Real-Time Monitoring · Predictive Intelligence
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  refetchAQ();
                  refetchForecast();
                  fetchAIHealthAdvice();
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/40 text-white shadow-xl font-semibold"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/20 backdrop-blur-md border border-white/40 text-white px-3 py-1.5 shadow-lg font-semibold">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              {currentLocation.name}
            </Badge>
            <Badge className="bg-emerald-500/90 backdrop-blur-md border border-emerald-400/50 text-white px-3 py-1.5 shadow-lg font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse shadow-md"></span>
              LIVE MONITORING
            </Badge>
            <Badge className="bg-violet-500/90 backdrop-blur-md border border-violet-400/50 text-white px-3 py-1.5 shadow-lg font-semibold">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              PREDICTIVE ANALYTICS
            </Badge>
            <Badge className="bg-amber-500/90 backdrop-blur-md border border-amber-400/50 text-white px-3 py-1.5 shadow-lg font-semibold">
              CPCB Standards
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Professional Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Location & Quick Access */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Location Search Card */}
            <Card className="p-6 shadow-xl border-2 border-slate-200/80 dark:border-slate-700/80 hover:shadow-2xl transition-all duration-300 bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Location Search</h3>
              </div>
              <LocationSearch
                currentLocation={currentLocation.name}
                onLocationSelect={(loc) => setCurrentLocation(loc)}
              />
            </Card>

            {/* AQI Gauge Card */}
            <Card className="p-6 shadow-xl border-2 border-slate-200/80 dark:border-slate-700/80 hover:shadow-2xl transition-all duration-300 bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Air Quality Index</h3>
                </div>
                {lastUpdated && (
                  <Badge variant="outline" className="text-xs font-semibold">
                    <Clock className="h-3 w-3 mr-1" />
                    {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                )}
              </div>
              
              {isLoadingAQ ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-14 w-14 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Analyzing air quality...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <AQIGauge aqi={currentAQI} standard="CPCB" size="lg" />
                  
                  {/* CPCB Scale Bar */}
                  <div className="mt-6 w-full">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                      CPCB Indian AQI Scale
                    </div>
                    <div className="relative h-8 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-inner border-2 border-slate-300/50 dark:border-slate-600/50">
                      {/* Segmented color bars */}
                      <div className="absolute h-full" style={{ left: '0%', width: '16.67%', backgroundColor: '#10b981' }} />
                      <div className="absolute h-full" style={{ left: '16.67%', width: '16.67%', backgroundColor: '#84cc16' }} />
                      <div className="absolute h-full" style={{ left: '33.34%', width: '33.33%', backgroundColor: '#fbbf24' }} />
                      <div className="absolute h-full" style={{ left: '66.67%', width: '16.67%', backgroundColor: '#f97316' }} />
                      <div className="absolute h-full" style={{ left: '83.34%', width: '8.33%', backgroundColor: '#ef4444' }} />
                      <div className="absolute h-full" style={{ left: '91.67%', width: '8.33%', backgroundColor: '#7f1d1d' }} />
                      
                      {/* Current AQI indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-slate-900 dark:bg-white shadow-2xl z-10 transition-all duration-700 ease-out"
                        style={{ left: `${getAQIBarPosition(currentAQI)}%` }}
                      >
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl">
                          {Math.round(currentAQI)}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                      <span>0<br/>Good</span>
                      <span>50<br/>Satis.</span>
                      <span>100<br/>Mod.</span>
                      <span>200<br/>Poor</span>
                      <span>300<br/>V.Poor</span>
                      <span>400+<br/>Severe</span>
                    </div>
                  </div>
                  
                  {airQualityData?.usAqi && (
                    <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-full">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        US AQI Reference
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(airQualityData.usAqi)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Health Score Card */}
            <Card className="p-6 shadow-xl border-2 border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-850 dark:to-blue-950/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Health Safety Score</h3>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${healthScore.color} mb-2`}>
                  {healthScore.score}
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {healthScore.label}
                </div>
                <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      healthScore.score > 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                      healthScore.score > 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                      healthScore.score > 30 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                      'bg-gradient-to-r from-red-600 to-purple-600'
                    }`}
                    style={{ width: `${healthScore.score}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-5 shadow-xl border-2 border-slate-200/80 dark:border-slate-700/80 bg-white/98 dark:bg-slate-900/98">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wide">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 text-slate-900 dark:text-slate-100 shadow-sm border border-blue-200 dark:border-blue-800" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  72h Forecast
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 text-slate-900 dark:text-slate-100 shadow-sm border border-purple-200 dark:border-purple-800" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Alert
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50 text-slate-900 dark:text-slate-100 shadow-sm border border-emerald-200 dark:border-emerald-800" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT MAIN CONTENT - Detailed Information */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Current Status Card */}
            <Card className="p-8 shadow-2xl border-2 border-slate-200/80 dark:border-slate-700/80 hover:shadow-3xl transition-all duration-500 bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-blue-500/10 dark:from-emerald-500/20 dark:via-cyan-500/20 dark:to-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      Current Air Quality Status
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Real-time measurements and intelligent analysis
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full animate-pulse shadow-lg" 
                      style={{ backgroundColor: apiStatus === 'healthy' ? '#10B981' : '#F59E0B' }}
                    />
                    <Badge variant="outline" className="text-xs font-semibold border-2">
                      {airQualityData?.source || 'Open-Meteo'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* AQI Display */}
                  <div>
                    <div className="text-8xl md:text-9xl font-bold font-mono leading-none mb-3" style={{ 
                      color: aqiColor,
                      textShadow: `0 0 40px ${aqiColor}40, 0 0 80px ${aqiColor}20, 0 4px 12px rgba(0,0,0,0.2)`
                    }}>
                      {Math.round(currentAQI)}
                    </div>
                    <div className="text-2xl font-bold mb-2" style={{ color: aqiColor }}>
                      {aqiCategory.toUpperCase()}
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {healthImplications}
                    </div>
                  </div>

                  {/* Pollutant Mini Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/40 rounded-2xl p-4 border-2 border-blue-300/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1 uppercase tracking-wide">PM2.5</div>
                      <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{pollutants.pm25.toFixed(1)}</div>
                      <div className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">µg/m³</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/60 dark:to-teal-900/40 rounded-2xl p-4 border-2 border-emerald-300/50 dark:border-emerald-700/50 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1 uppercase tracking-wide">PM10</div>
                      <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{pollutants.pm10.toFixed(1)}</div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">µg/m³</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/60 dark:to-orange-900/40 rounded-2xl p-4 border-2 border-amber-300/50 dark:border-amber-700/50 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1 uppercase tracking-wide">NO₂</div>
                      <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{pollutants.no2.toFixed(1)}</div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">µg/m³</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-pink-50 dark:from-purple-900/60 dark:to-pink-900/40 rounded-2xl p-4 border-2 border-purple-300/50 dark:border-purple-700/50 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-1 uppercase tracking-wide">O₃</div>
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{pollutants.o3.toFixed(1)}</div>
                      <div className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">µg/m³</div>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Report Card */}
                {!isLoadingAQ && airQualityData && (
                  <div className="mt-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 rounded-2xl p-6 text-white shadow-2xl border-2 border-indigo-400/30 dark:border-indigo-500/30">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg flex-shrink-0">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-bold text-lg">Advanced Intelligence Report</h3>
                          {loadingAI && (
                            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-0.5">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-[10px] font-semibold">ANALYZING</span>
                            </div>
                          )}
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <p className="text-sm leading-relaxed text-white/95 font-medium">
                            {aiHealthAdvice || `Based on current AQI of ${Math.round(currentAQI)}, ${healthAdvice[0] || healthImplications}`}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="text-xs bg-white/95 hover:bg-white text-indigo-700 font-bold shadow-lg border-2 border-white/30"
                        onClick={fetchAIHealthAdvice}
                        disabled={loadingAI}
                      >
                        {loadingAI ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                        Update
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Pollutant Monitoring Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                    Comprehensive Pollutant Analysis
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Real-time measurements with intelligent trend detection
                  </p>
                </div>
              </div>
              
              {isLoadingAQ ? (
                <div className="flex items-center justify-center gap-3 py-16 bg-white/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Fetching pollutant data...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pollutantCards.map((pollutant, index) => (
                    <div key={pollutant.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.08}s` }}>
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
            </div>

            {/* Forecast Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                    Predictive Forecast Analysis
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Advanced 72-hour predictions with confidence intervals
                  </p>
                </div>
              </div>
              
              {isLoadingForecast ? (
                <div className="flex items-center justify-center gap-3 py-16 bg-white/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <Loader2 className="h-10 w-10 animate-spin text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Computing predictions...</span>
                </div>
              ) : (
                <ForecastChart
                  data={forecastData.slice(0, 24)}
                  pollutant="AQI"
                  title="Air Quality Index Forecast"
                />
              )}
            </div>

            {/* Health Recommendations */}
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  CPCB Health Recommendations
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Official guidance based on current air quality standards
                </p>
              </div>
              
              {healthAdvice.length > 0 && (
                <Card className="p-6 mb-6 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-850 dark:to-blue-950/30 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="h-14 w-14 rounded-xl flex items-center justify-center shadow-xl border-2" style={{ 
                      backgroundColor: `${aqiColor}20`,
                      borderColor: `${aqiColor}40`
                    }}>
                      <Activity className="h-7 w-7" style={{ color: aqiColor }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1 text-slate-900 dark:text-slate-100">
                        What to do today
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Official CPCB guidance for {aqiCategory} air quality
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3">
                    {healthAdvice.map((advice: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white flex-shrink-0 mt-0.5 shadow-lg font-bold">
                          <span className="text-sm">{index + 1}</span>
                        </div>
                        <p className="text-sm leading-relaxed font-medium text-slate-800 dark:text-slate-200 flex-1">
                          {advice}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              
              <HealthAdvisory aqi={currentAQI} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
