import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocationSearch } from "@/components/LocationSearch";
import { DataExport } from "@/components/DataExport";
import { AQICardSkeleton } from "@/components/LoadingSkeleton";
import { MapPin, TrendingUp, TrendingDown, Clock, Activity, AlertTriangle, CheckCircle } from "lucide-react";

export default function Compare() {
  const [location1, setLocation1] = useState({ name: "Delhi, India", lat: 28.6139, lon: 77.2090 });
  const [location2, setLocation2] = useState({ name: "Mumbai, India", lat: 19.0760, lon: 72.8777 });

  const { data: data1, isLoading: loading1 } = useQuery({
    queryKey: ['/api/air-quality/realtime', location1.lat, location1.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/realtime?lat=${location1.lat}&lon=${location1.lon}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 0,
  });

  const { data: data2, isLoading: loading2 } = useQuery({
    queryKey: ['/api/air-quality/realtime', location2.lat, location2.lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality/realtime?lat=${location2.lat}&lon=${location2.lon}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 0,
  });

  const ComparisonCard = ({ data, location, onLocationChange, isLoading }: any) => {
    const aqi = data?.aqi ?? 0;
    const category = data?.category || 'Unknown';
    const lastUpdated = data?.lastUpdated ? new Date(data.lastUpdated) : null;

    const getSeverityIcon = () => {
      if (aqi <= 50) return <CheckCircle className="h-6 w-6 text-accent" />;
      if (aqi <= 100) return <Activity className="h-6 w-6 text-primary" />;
      return <AlertTriangle className="h-6 w-6 text-warning" />;
    };

    return (
      <Card className="p-6">
        <div className="mb-6">
          <LocationSearch
            currentLocation={location.name}
            onLocationSelect={(loc) => onLocationChange(loc)}
          />
        </div>

        {isLoading ? (
          <AQICardSkeleton />
        ) : (
          <>
            <div className="text-center mb-6 p-6 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center gap-3 mb-4">
                {getSeverityIcon()}
                <Badge variant="outline" className="text-xs">Live Data</Badge>
              </div>
              <div className="text-7xl font-bold font-serif mb-3">
                {Math.round(aqi)}
              </div>
              <div className="text-xl font-semibold mb-2 text-primary">
                {category}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {lastUpdated?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">CPCB AQI</span>
                <span className="font-mono font-bold">{Math.round(aqi)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">US EPA AQI</span>
                <span className="font-mono font-bold">{Math.round(data?.usAqi || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">WHO Guideline</span>
                <Badge variant="outline" className={aqi > 50 ? "bg-warning/10 border-warning text-warning" : "bg-accent/10 border-accent text-accent"}>
                  {aqi > 50 ? "Exceeded" : "Met"}
                </Badge>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: 'PM2.5', value: data?.pollutants?.pm25 },
                { label: 'PM10', value: data?.pollutants?.pm10 },
                { label: 'NO₂', value: data?.pollutants?.no2 },
                { label: 'O₃', value: data?.pollutants?.o3 },
              ].map((pollutant) => (
                <div key={pollutant.label} className="p-3 bg-muted/30 rounded-md border">
                  <div className="text-xs text-muted-foreground mb-1">{pollutant.label}</div>
                  <div className="text-lg font-bold font-mono">{pollutant.value?.toFixed(1) ?? 0}</div>
                  <div className="text-xs text-muted-foreground">µg/m³</div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    );
  };

  const aqiDifference = data1 && data2 ? data1.aqi - data2.aqi : 0;
  const betterLocation = aqiDifference < 0 ? location1.name : location2.name;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Compare Air Quality</h1>
              <p className="text-muted-foreground">
                Side-by-side comparison with WHO & CPCB benchmarks
              </p>
            </div>
            <DataExport 
              data={{ location1: data1, location2: data2 }}
              filename="aeroaware_comparison"
              type="dashboard"
            />
          </div>
          
          {!loading1 && !loading2 && data1 && data2 && (
            <Card className="inline-block p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                {aqiDifference !== 0 ? (
                  <>
                    {aqiDifference < 0 ? <TrendingDown className="h-5 w-5 text-accent" /> : <TrendingUp className="h-5 w-5 text-warning" />}
                    <div className="text-left">
                      <div className="font-semibold">{betterLocation} has better air quality</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.abs(aqiDifference).toFixed(0)} AQI points difference
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="font-semibold">Both locations have similar air quality</div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ComparisonCard 
            data={data1} 
            location={location1} 
            onLocationChange={setLocation1}
            isLoading={loading1}
          />
          <ComparisonCard 
            data={data2} 
            location={location2} 
            onLocationChange={setLocation2}
            isLoading={loading2}
          />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Quick Compare: Major Indian Cities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { name: "Delhi", lat: 28.6139, lon: 77.2090 },
              { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
              { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
              { name: "Chennai", lat: 13.0827, lon: 80.2707 },
              { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
              { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
              { name: "Pune", lat: 18.5204, lon: 73.8567 },
              { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
            ].map((city) => (
              <Button
                key={city.name}
                variant="outline"
                className="justify-start"
                onClick={() => setLocation1({ name: `${city.name}, India`, lat: city.lat, lon: city.lon })}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {city.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
