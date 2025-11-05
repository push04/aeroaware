import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAQIInfo, WHO_BREAKPOINTS, CPCB_BREAKPOINTS } from "@/lib/aqiUtils";
import { useState } from "react";
import { Activity, Home, Wind, AlertCircle, Sparkles } from "lucide-react";

interface HealthAdvisoryProps {
  aqi: number;
}

export function HealthAdvisory({ aqi }: HealthAdvisoryProps) {
  const [standard, setStandard] = useState<"WHO" | "CPCB">("WHO");
  const [showAIAdvice, setShowAIAdvice] = useState(false);
  
  const info = getAQIInfo(aqi, standard);
  const breakpoints = standard === "WHO" ? WHO_BREAKPOINTS : CPCB_BREAKPOINTS;
  
  const recommendations = [
    { icon: Home, label: "Indoor Activities", advice: info.min <= 100 ? "Safe for all activities" : "Recommended for sensitive groups" },
    { icon: Wind, label: "Outdoor Activities", advice: info.min <= 50 ? "Safe for all" : info.min <= 100 ? "Limit prolonged exertion" : "Avoid prolonged exertion" },
    { icon: Activity, label: "Exercise", advice: info.min <= 50 ? "Safe at all levels" : info.min <= 100 ? "Moderate intensity OK" : "Avoid outdoor exercise" },
  ];
  
  return (
    <Card className="p-6" data-testid="card-health-advisory">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Health Advisory</h3>
        <div className="flex gap-2">
          <Button
            variant={standard === "WHO" ? "default" : "outline"}
            size="sm"
            onClick={() => setStandard("WHO")}
            data-testid="button-standard-who"
          >
            WHO
          </Button>
          <Button
            variant={standard === "CPCB" ? "default" : "outline"}
            size="sm"
            onClick={() => setStandard("CPCB")}
            data-testid="button-standard-cpcb"
          >
            CPCB
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative h-8 bg-muted rounded-md overflow-hidden">
          {breakpoints.map((bp, idx) => {
            const width = ((bp.max - bp.min) / 500) * 100;
            return (
              <div
                key={idx}
                className="absolute h-full"
                style={{
                  left: `${(bp.min / 500) * 100}%`,
                  width: `${width}%`,
                  backgroundColor: bp.color,
                }}
              />
            );
          })}
          <div
            className="absolute top-0 bottom-0 w-1 bg-foreground shadow-lg"
            style={{ left: `${(aqi / 500) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>0</span>
          <span>500</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: info.color }} />
          <div>
            <Badge variant="outline" style={{ borderColor: info.color, color: info.color }}>
              {info.label}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {info.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        {recommendations.map((rec, idx) => {
          const Icon = rec.icon;
          return (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium">{rec.label}</div>
                <div className="text-xs text-muted-foreground">{rec.advice}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowAIAdvice(!showAIAdvice)}
        data-testid="button-ai-advice"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {showAIAdvice ? "Hide" : "Get"} AI Health Advice
      </Button>
      
      {showAIAdvice && (
        <div className="mt-4 p-4 rounded-md bg-primary/5 border border-primary/20">
          <p className="text-sm leading-relaxed">
            <strong>AI Analysis:</strong> Based on current AQI levels and weather conditions,
            sensitive groups should limit outdoor exposure. Consider using air purifiers indoors
            and wearing N95 masks if outdoor activity is necessary. Stay hydrated and monitor
            symptoms if you have respiratory conditions.
          </p>
        </div>
      )}
    </Card>
  );
}
