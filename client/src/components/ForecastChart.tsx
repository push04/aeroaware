import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";

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
  
  const filteredData = data.slice(0, timeRange).map(d => ({
    ...d,
    lower: d.uncertainty?.lower ?? d.value,
    upper: d.uncertainty?.upper ?? d.value,
  }));

  const exportToCSV = () => {
    const csvContent = [
      ['Time', pollutant, 'Lower Bound', 'Upper Bound'],
      ...filteredData.map(d => [d.time, d.value, d.lower, d.upper])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pollutant}_forecast_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPNG = () => {
    const svgElement = document.querySelector(`[data-testid="chart-forecast-${pollutant.toLowerCase()}"] svg`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = svgElement.clientWidth;
    canvas.height = svgElement.clientHeight;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pollutant}_forecast_${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{pollutant}:</span> {payload[1].value.toFixed(1)}
          </p>
          {payload[0] && payload[2] && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Range: {payload[0].value.toFixed(1)} - {payload[2].value.toFixed(1)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const aqiThresholds = [
    { value: 50, label: 'Good', color: '#00e400' },
    { value: 100, label: 'Moderate', color: '#ffff00' },
    { value: 200, label: 'Unhealthy for Sensitive', color: '#ff7e00' },
    { value: 300, label: 'Unhealthy', color: '#ff0000' },
    { value: 400, label: 'Very Unhealthy', color: '#8f3f97' },
  ];
  
  return (
    <Card className="p-6 bg-white dark:bg-gray-900" data-testid={`chart-forecast-${pollutant.toLowerCase()}`}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex gap-2 flex-wrap">
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              title="Export to CSV"
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPNG}
              title="Export to PNG"
            >
              <Download className="h-4 w-4 mr-1" />
              PNG
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorValue-${pollutant}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id={`colorUncertainty-${pollutant}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--muted))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--foreground))"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              label={{ value: pollutant, angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            {pollutant === 'AQI' && aqiThresholds.map((threshold) => (
              <ReferenceLine
                key={threshold.value}
                y={threshold.value}
                stroke={threshold.color}
                strokeDasharray="3 3"
                strokeOpacity={0.4}
                label={{ value: threshold.label, position: 'right', fill: threshold.color, fontSize: 10 }}
              />
            ))}
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill={`url(#colorUncertainty-${pollutant})`}
              name="Lower Bound"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill={`url(#colorValue-${pollutant})`}
              name={pollutant}
              dot={{ r: 3, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill={`url(#colorUncertainty-${pollutant})`}
              name="Upper Bound"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
