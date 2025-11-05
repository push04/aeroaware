import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPollutantInfo } from "@/lib/aqiUtils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PollutantCardProps {
  pollutant: string;
  value: number;
  trend?: "up" | "down" | "stable";
  sparklineData?: number[];
}

export function PollutantCard({ pollutant, value, trend = "stable", sparklineData }: PollutantCardProps) {
  const info = getPollutantInfo(pollutant);
  
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-secondary" : trend === "down" ? "text-accent" : "text-muted-foreground";
  
  return (
    <Card 
      className="p-5 hover:shadow-lg transition-all duration-200"
      data-testid={`card-pollutant-${pollutant.toLowerCase()}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-foreground mb-0.5">{info.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{info.formula}</div>
        </div>
        <div className="p-2 rounded-lg bg-muted">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold font-mono text-foreground" data-testid={`text-${pollutant.toLowerCase()}-value`}>
          {value.toFixed(1)}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{info.unit}</span>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-10 flex items-end gap-0.5 bg-muted/50 rounded p-2">
          {sparklineData.map((val, idx) => {
            const maxVal = Math.max(...sparklineData);
            const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-sm transition-all duration-300 ${
                  idx === sparklineData.length - 1 
                    ? 'bg-primary' 
                    : 'bg-secondary/50'
                }`}
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}
