import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataExport } from "@/components/DataExport";
import { ChartSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Calendar, TrendingUp, BarChart3 } from "lucide-react";

export default function Trends() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7);
  const [currentLocation] = useState({ name: "New Delhi, India", lat: 28.6139, lon: 77.2090 });
  
  const { data: forecastData, isLoading, refetch } = useQuery({
    queryKey: ['/api/air-quality/forecast', currentLocation.lat, currentLocation.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
      if (!res.ok) throw new Error('Failed to fetch forecast data');
      return res.json();
    },
    staleTime: 0,
  });
  
  const data = forecastData?.hourly?.slice(0, timeRange * 24).map((item: any, i: number) => ({
    date: new Date(item.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    aqi: item.aqi ?? (item.pm25 * 2.5),
    pm25: item.pm25 || 0,
  })) || [];
  
  const maxAQI = data.length > 0 ? Math.max(...data.map(d => d.aqi)) : 0;
  const minAQI = data.length > 0 ? Math.min(...data.map(d => d.aqi)) : 0;
  const avgAQI = data.length > 0 ? data.reduce((sum, d) => sum + d.aqi, 0) / data.length : 0;
  const stdDev = data.length > 0 ? Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.aqi - avgAQI, 2), 0) / data.length) : 0;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Historical Trends</h1>
            <p className="text-muted-foreground">
              Statistical analysis of air quality patterns over time
            </p>
          </div>
          <DataExport 
            data={data}
            filename="aeroaware_trends"
            type="trends"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Average AQI
            </div>
            <div className="text-3xl font-bold font-mono">{avgAQI.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground mt-1">Mean value over {timeRange} days</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Std. Deviation</div>
            <div className="text-3xl font-bold font-mono">{stdDev.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground mt-1">Variability measure</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Range</div>
            <div className="text-3xl font-bold font-mono">{minAQI.toFixed(0)}-{maxAQI.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-1">Min to Max AQI</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Good Days</div>
            <div className="text-3xl font-bold font-mono">
              {data.filter(d => d.aqi <= 50).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{((data.filter(d => d.aqi <= 50).length / data.length) * 100).toFixed(0)}% of period</div>
          </Card>
        </div>
        
        {isLoading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <ErrorState 
            title="No Data Available"
            message="Unable to load trend data for this location."
            onRetry={refetch}
          />
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">AQI Over Time</h3>
              <div className="flex gap-2">
                <Button
                  variant={timeRange === 7 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(7)}
                  data-testid="button-range-7d"
                >
                  7 Days
                </Button>
                <Button
                  variant={timeRange === 30 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(30)}
                  data-testid="button-range-30d"
                >
                  30 Days
                </Button>
                <Button
                  variant={timeRange === 90 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(90)}
                  data-testid="button-range-90d"
                >
                  90 Days
                </Button>
              </div>
            </div>
            
            <div className="h-[400px] relative">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id="trend-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              <line x1="0" y1="80%" x2="100%" y2="80%" stroke="hsl(var(--border))" strokeDasharray="4" />
              <text x="4" y="78%" fontSize="12" fill="hsl(var(--muted-foreground))">50</text>
              
              {data.map((point, idx) => {
                const x = (idx / (data.length - 1)) * 100;
                const y = 100 - (point.aqi / maxAQI) * 80;
                const nextPoint = data[idx + 1];
                
                if (!nextPoint) return null;
                
                const nextX = ((idx + 1) / (data.length - 1)) * 100;
                const nextY = 100 - (nextPoint.aqi / maxAQI) * 80;
                
                return (
                  <g key={idx}>
                    <line
                      x1={`${x}%`}
                      y1={`${y}%`}
                      x2={`${nextX}%`}
                      y2={`${nextY}%`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill="hsl(var(--primary))"
                    />
                  </g>
                );
              })}
              
              <polygon
                points={data.map((point, idx) => {
                  const x = (idx / (data.length - 1)) * 100;
                  const y = 100 - (point.aqi / maxAQI) * 80;
                  return `${x},${y}`;
                }).join(' ') + ` 100,100 0,100`}
                fill="url(#trend-gradient)"
              />
            </svg>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
              {data.filter((_, idx) => idx % Math.ceil(data.length / 8) === 0).map((point, idx) => (
                <span key={idx}>{point.date}</span>
              ))}
            </div>
          </div>
          </Card>
        )}
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <Calendar className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Weekly Pattern</div>
                <div className="text-xs text-muted-foreground">
                  AQI tends to be better on weekends due to reduced traffic
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <TrendingUp className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Seasonal Trend</div>
                <div className="text-xs text-muted-foreground">
                  Winter months typically show 40% higher pollution levels
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
