import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ForecastDataPoint {
  time: string;
  value: number;
  uncertainty?: { lower: number; upper: number };
}

interface ForecastChartProps {
  data: ForecastDataPoint[];
  pollutant: string;
  title: string;
}

export function ForecastChart({ data, pollutant, title }: ForecastChartProps) {
  const [timeRange, setTimeRange] = useState<24 | 48 | 72>(24);
  
  const filteredData = data.slice(0, timeRange);
  const maxValue = Math.max(...filteredData.map(d => d.uncertainty?.upper || d.value));
  
  return (
    <Card className="p-6" data-testid={`chart-forecast-${pollutant.toLowerCase()}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 24 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(24)}
            data-testid="button-forecast-24h"
          >
            24h
          </Button>
          <Button
            variant={timeRange === 48 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(48)}
            data-testid="button-forecast-48h"
          >
            48h
          </Button>
          <Button
            variant={timeRange === 72 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(72)}
            data-testid="button-forecast-72h"
          >
            72h
          </Button>
        </div>
      </div>
      
      <div className="h-[300px] relative">
        <svg width="100%" height="100%" className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${pollutant}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {filteredData.map((point, idx) => {
            const x = (idx / (filteredData.length - 1)) * 100;
            const y = 100 - (point.value / maxValue) * 80;
            const nextPoint = filteredData[idx + 1];
            
            if (!nextPoint) return null;
            
            const nextX = ((idx + 1) / (filteredData.length - 1)) * 100;
            const nextY = 100 - (nextPoint.value / maxValue) * 80;
            
            return (
              <g key={idx}>
                {point.uncertainty && (
                  <rect
                    x={`${x}%`}
                    y={`${100 - (point.uncertainty.upper / maxValue) * 80}%`}
                    width={`${(nextX - x)}%`}
                    height={`${((point.uncertainty.upper - point.uncertainty.lower) / maxValue) * 80}%`}
                    fill="hsl(var(--primary))"
                    opacity="0.1"
                  />
                )}
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
                  r="4"
                  fill="hsl(var(--primary))"
                />
              </g>
            );
          })}
          
          <polygon
            points={filteredData.map((point, idx) => {
              const x = (idx / (filteredData.length - 1)) * 100;
              const y = 100 - (point.value / maxValue) * 80;
              return `${x},${y}`;
            }).join(' ') + ` 100,100 0,100`}
            fill={`url(#gradient-${pollutant})`}
          />
        </svg>
        
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
          {filteredData.filter((_, idx) => idx % 6 === 0).map((point, idx) => (
            <span key={idx}>{point.time}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}
