import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, Wind } from "lucide-react";
import { getAQIInfo, getAQIColor } from "@/lib/aqiUtils";

interface AQIInsightsCardProps {
  aqi: number;
  usAqi?: number;
  category?: string;
  pollutants?: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    o3?: number;
    so2?: number;
    co?: number;
  };
  healthImplications?: string;
  sparklineData?: number[];
  lastUpdated?: string;
}

export function AQIInsightsCard({
  aqi,
  usAqi,
  category,
  pollutants,
  healthImplications,
  sparklineData = [],
  lastUpdated,
}: AQIInsightsCardProps) {
  const aqiInfo = getAQIInfo(aqi, "CPCB");
  const aqiCategory = category || aqiInfo.label;
  const aqiColor = getAQIColor(aqi);

  const getSeverityIcon = () => {
    if (aqi <= 50) return <CheckCircle className="h-5 w-5 text-accent" />;
    if (aqi <= 100) return <Activity className="h-5 w-5 text-primary" />;
    return <AlertTriangle className="h-5 w-5 text-warning" />;
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Air Quality Index
            </h3>
            {getSeverityIcon()}
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Updated {new Date(lastUpdated).toLocaleTimeString('en-IN')}
            </p>
          )}
        </div>
        <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
      </div>

      {/* Main AQI Display */}
      <div className="space-y-3">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div 
              className="text-6xl font-bold font-serif leading-none mb-2"
              style={{ color: aqiColor }}
            >
              {Math.round(aqi)}
            </div>
            <div 
              className="text-lg font-semibold mb-1"
              style={{ color: aqiColor }}
            >
              {aqiCategory}
            </div>
            <Badge variant="outline" className="text-xs">
              CPCB Standard (India)
            </Badge>
          </div>
          
          {/* Dual Standard Comparison */}
          {usAqi && (
            <div className="flex-shrink-0 p-4 rounded-lg bg-muted/50 border">
              <div className="text-xs text-muted-foreground mb-1">US EPA AQI</div>
              <div className="text-2xl font-bold font-mono">{Math.round(usAqi)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {aqi > usAqi ? `+${Math.round(aqi - usAqi)}` : `${Math.round(aqi - usAqi)}`} vs India
              </div>
            </div>
          )}
        </div>

        {/* Sparkline Trend */}
        {sparklineData.length > 0 && (
          <div className="h-12 relative">
            <svg width="100%" height="100%" className="overflow-visible">
              <polyline
                points={sparklineData.map((val, idx) => 
                  `${(idx / (sparklineData.length - 1)) * 100},${100 - (val / Math.max(...sparklineData)) * 80}`
                ).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
              <span>24h ago</span>
              <span>Now</span>
            </div>
          </div>
        )}
      </div>

      {/* Pollutant Details Grid */}
      {pollutants && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pollutant Levels
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {pollutants.pm25 && (
              <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">PM2.5</span>
                </div>
                <div className="text-lg font-bold font-mono">{pollutants.pm25.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">µg/m³</div>
              </div>
            )}
            {pollutants.pm10 && (
              <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">PM10</span>
                </div>
                <div className="text-lg font-bold font-mono">{pollutants.pm10.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">µg/m³</div>
              </div>
            )}
            {pollutants.no2 && (
              <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">NO₂</span>
                </div>
                <div className="text-lg font-bold font-mono">{pollutants.no2.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">µg/m³</div>
              </div>
            )}
            {pollutants.o3 && (
              <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">O₃</span>
                </div>
                <div className="text-lg font-bold font-mono">{pollutants.o3.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">µg/m³</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Health Advisory */}
      {healthImplications && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Wind className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-1">Health Guidance</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {healthImplications}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
