import { Card } from "@/components/ui/card";
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
  const trendColor = trend === "up" ? "text-red-500" : trend === "down" ? "text-emerald-500" : "text-muted-foreground";
  
  return (
    <Card className="p-6 hover-elevate" data-testid={`card-pollutant-${pollutant.toLowerCase()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{info.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{info.formula}</div>
        </div>
        <TrendIcon className={`h-5 w-5 ${trendColor}`} />
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold font-mono" data-testid={`text-${pollutant.toLowerCase()}-value`}>
          {value.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">{info.unit}</span>
      </div>
      
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-8 flex items-end gap-0.5">
          {sparklineData.map((val, idx) => {
            const maxVal = Math.max(...sparklineData);
            const height = (val / maxVal) * 100;
            return (
              <div
                key={idx}
                className="flex-1 bg-primary/30 rounded-sm"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}
