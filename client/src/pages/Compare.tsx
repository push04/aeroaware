import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocationSearch } from "@/components/LocationSearch";
import { MapPin, TrendingUp, TrendingDown, Clock, Activity } from "lucide-react";

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
    const color = data?.color || '#999999';
    const lastUpdated = data?.lastUpdated ? new Date(data.lastUpdated) : null;

    return (
      <Card className="p-6">
        <div className="mb-6">
          <LocationSearch
            currentLocation={location.name}
            onLocationSelect={(loc) => onLocationChange(loc)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold text-gray-500 uppercase">Live Data</span>
              </div>
              <div className="text-7xl font-bold mb-2" style={{ color }}>
                {Math.round(aqi)}
              </div>
              <div className="text-lg font-bold mb-2" style={{ color }}>
                {category}
              </div>
              {lastUpdated && (
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-700">Key Pollutants</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">PM2.5</div>
                  <div className="text-lg font-bold">{data?.pollutants?.pm25?.toFixed(1) ?? 0} µg/m³</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">PM10</div>
                  <div className="text-lg font-bold">{data?.pollutants?.pm10?.toFixed(1) ?? 0} µg/m³</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">NO₂</div>
                  <div className="text-lg font-bold">{data?.pollutants?.no2?.toFixed(1) ?? 0} µg/m³</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">O₃</div>
                  <div className="text-lg font-bold">{data?.pollutants?.o3?.toFixed(1) ?? 0} µg/m³</div>
                </div>
              </div>
            </div>

            {data?.healthImplications && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-700">{data.healthImplications}</p>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    );
  };

  const aqiDifference = data1 && data2 ? data1.aqi - data2.aqi : 0;
  const betterLocation = aqiDifference < 0 ? location1.name : location2.name;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-['Poppins'] font-bold mb-4">Compare Air Quality</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Live comparison of air quality across Indian cities using CPCB standards
          </p>
          
          {!loading1 && !loading2 && data1 && data2 && (
            <Card className="inline-block p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2">
              <div className="flex items-center gap-3">
                {aqiDifference !== 0 ? (
                  <>
                    {aqiDifference < 0 ? <TrendingDown className="h-5 w-5 text-green-600" /> : <TrendingUp className="h-5 w-5 text-red-600" />}
                    <div className="text-left">
                      <div className="font-bold">{betterLocation} has better air quality</div>
                      <div className="text-sm text-gray-600">
                        {Math.abs(aqiDifference).toFixed(0)} AQI points {aqiDifference < 0 ? 'lower' : 'higher'} than the other location
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="font-bold">Both locations have similar air quality</div>
                )}
              </div>
            </Card>
          )}
        </div>

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
          <Card className="p-6 bg-gradient-to-br from-background to-muted/30">
            <h2 className="text-xl font-bold mb-4">Quick Compare: Major Indian Cities</h2>
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
          </Card>
        </div>
      </div>
    </div>
  );
}
