import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPollutantInfo } from "@/lib/aqiUtils";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Info } from "lucide-react";
import { useState } from "react";

interface PollutantCardProps {
  pollutant: string;
  value: number;
  trend?: "up" | "down" | "stable";
  sparklineData?: number[];
}

export function PollutantCard({ pollutant, value, trend = "stable", sparklineData }: PollutantCardProps) {
  const info = getPollutantInfo(pollutant);
  const [showDetails, setShowDetails] = useState(false);
  
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-red-500" : trend === "down" ? "text-emerald-500" : "text-muted-foreground";
  const trendBg = trend === "up" ? "bg-red-50 dark:bg-red-950/30" : trend === "down" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-gray-50 dark:bg-gray-800";
  
  // Determine pollutant-specific colors and thresholds
  const getHealthLevel = (pollutant: string, value: number) => {
    if (pollutant.toLowerCase() === 'pm25' || pollutant.toLowerCase() === 'pm2.5') {
      if (value <= 30) return { level: 'Good', color: 'green', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-300 dark:border-green-700' };
      if (value <= 60) return { level: 'Satisfactory', color: 'lime', bgColor: 'bg-lime-50 dark:bg-lime-950/30', borderColor: 'border-lime-300 dark:border-lime-700' };
      if (value <= 90) return { level: 'Moderate', color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-300 dark:border-yellow-700' };
      if (value <= 120) return { level: 'Poor', color: 'orange', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-300 dark:border-orange-700' };
      if (value <= 250) return { level: 'Very Poor', color: 'red', bgColor: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-300 dark:border-red-700' };
      return { level: 'Severe', color: 'purple', bgColor: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-purple-300 dark:border-purple-700' };
    } else if (pollutant.toLowerCase() === 'pm10') {
      if (value <= 50) return { level: 'Good', color: 'green', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-300 dark:border-green-700' };
      if (value <= 100) return { level: 'Satisfactory', color: 'lime', bgColor: 'bg-lime-50 dark:bg-lime-950/30', borderColor: 'border-lime-300 dark:border-lime-700' };
      if (value <= 250) return { level: 'Moderate', color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-300 dark:border-yellow-700' };
      if (value <= 350) return { level: 'Poor', color: 'orange', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-300 dark:border-orange-700' };
      return { level: 'Very Poor', color: 'red', bgColor: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-300 dark:border-red-700' };
    } else if (pollutant.toLowerCase() === 'no2') {
      if (value <= 40) return { level: 'Good', color: 'green', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-300 dark:border-green-700' };
      if (value <= 80) return { level: 'Satisfactory', color: 'lime', bgColor: 'bg-lime-50 dark:bg-lime-950/30', borderColor: 'border-lime-300 dark:border-lime-700' };
      if (value <= 180) return { level: 'Moderate', color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-300 dark:border-yellow-700' };
      return { level: 'Poor', color: 'orange', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-300 dark:border-orange-700' };
    } else if (pollutant.toLowerCase() === 'o3') {
      if (value <= 50) return { level: 'Good', color: 'green', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-300 dark:border-green-700' };
      if (value <= 100) return { level: 'Satisfactory', color: 'lime', bgColor: 'bg-lime-50 dark:bg-lime-950/30', borderColor: 'border-lime-300 dark:border-lime-700' };
      if (value <= 168) return { level: 'Moderate', color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-300 dark:border-yellow-700' };
      return { level: 'Poor', color: 'orange', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-300 dark:border-orange-700' };
    }
    return { level: 'Unknown', color: 'gray', bgColor: 'bg-gray-50 dark:bg-gray-800', borderColor: 'border-gray-300 dark:border-gray-600' };
  };

  const healthLevel = getHealthLevel(pollutant, value);
  
  return (
    <Card 
      className={`p-5 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${healthLevel.borderColor} ${healthLevel.bgColor} group relative overflow-hidden`}
      onClick={() => setShowDetails(!showDetails)}
      data-testid={`card-pollutant-${pollutant.toLowerCase()}`}
    >
      {/* Background gradient effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/50 to-transparent dark:from-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">{info.name}</div>
            <div className="text-xs font-mono text-gray-600 dark:text-gray-400">{info.formula}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`p-1.5 rounded-lg ${trendBg}`}>
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold font-mono text-gray-900 dark:text-gray-100" data-testid={`text-${pollutant.toLowerCase()}-value`}>
            {value.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{info.unit}</span>
        </div>

        <Badge 
          className={`mb-3 text-[10px] font-bold px-2 py-0.5 ${
            healthLevel.level === 'Good' ? 'bg-green-600 text-white' :
            healthLevel.level === 'Satisfactory' ? 'bg-lime-600 text-white' :
            healthLevel.level === 'Moderate' ? 'bg-yellow-600 text-white' :
            healthLevel.level === 'Poor' ? 'bg-orange-600 text-white' :
            healthLevel.level === 'Very Poor' ? 'bg-red-600 text-white' :
            'bg-purple-600 text-white'
          }`}
        >
          {healthLevel.level.toUpperCase()}
        </Badge>
        
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-12 flex items-end gap-1 bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 backdrop-blur-sm">
            {sparklineData.map((val, idx) => {
              const maxVal = Math.max(...sparklineData);
              const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    idx === sparklineData.length - 1 
                      ? 'bg-gradient-to-t from-blue-600 to-purple-600 shadow-lg' 
                      : 'bg-gray-400 dark:bg-gray-600 opacity-60'
                  }`}
                  style={{ height: `${Math.max(height, 10)}%` }}
                />
              );
            })}
          </div>
        )}

        {showDetails && (
          <div className="mt-3 pt-3 border-t-2 border-gray-300 dark:border-gray-600 animate-fade-in">
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {pollutant.toLowerCase() === 'pm25' && "Fine particulate matter, 2.5 micrometers or smaller. Main source: combustion from vehicles, power plants, and industrial facilities."}
                {pollutant.toLowerCase() === 'pm10' && "Coarse particulate matter, 10 micrometers or smaller. Main source: dust, pollen, mold, and construction activities."}
                {pollutant.toLowerCase() === 'no2' && "Nitrogen dioxide from vehicle emissions and industrial processes. Can irritate airways and worsen respiratory diseases."}
                {pollutant.toLowerCase() === 'o3' && "Ground-level ozone formed by chemical reactions between air pollutants. Can trigger asthma and reduce lung function."}
              </div>
            </div>
            <div className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
              Current: <span className="text-gray-900 dark:text-gray-100">{value.toFixed(2)} {info.unit}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
