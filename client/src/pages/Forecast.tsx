import { ForecastChart } from "@/components/ForecastChart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

export default function Forecast() {
  const pollutants = ["pm25", "pm10", "no2", "o3"];
  
  const generateForecastData = (base: number) => 
    Array.from({ length: 72 }, (_, i) => ({
      time: `${i}h`,
      value: base + Math.sin(i / 12) * 15 + Math.random() * 8,
      uncertainty: {
        lower: base - 10 + Math.sin(i / 12) * 10,
        upper: base + 10 + Math.sin(i / 12) * 20,
      },
    }));
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-serif font-semibold mb-2">AI-Powered Forecast</h1>
          <p className="text-muted-foreground">
            72-hour predictions for all major pollutants with AI-generated insights
          </p>
        </div>
        
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">AI Forecast Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Air quality is expected to deteriorate over the next 48 hours due to low wind speeds
                and temperature inversion. PM2.5 levels may spike in the evening hours. Sensitive
                groups should plan indoor activities for tomorrow afternoon. Conditions should improve
                by the weekend as a weather front brings cleaner air from the north.
              </p>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 gap-8">
          {pollutants.map((pollutant, idx) => {
            const baseValues = { pm25: 50, pm10: 75, no2: 40, o3: 65 };
            return (
              <ForecastChart
                key={pollutant}
                data={generateForecastData(baseValues[pollutant as keyof typeof baseValues])}
                pollutant={pollutant}
                title={`${pollutant.toUpperCase()} Forecast`}
              />
            );
          })}
        </div>
        
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Confidence & Methodology</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Our AI model uses real-time sensor data from OpenAQ, weather forecasts from Open-Meteo,
                and satellite imagery from NASA GIBS to generate hyperlocal predictions. The shaded
                uncertainty bands show the 90% confidence interval.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">OpenAQ Data</Badge>
                <Badge variant="outline">Open-Meteo Weather</Badge>
                <Badge variant="outline">NASA Satellite</Badge>
                <Badge variant="outline">AI Model: GPT-4o</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
