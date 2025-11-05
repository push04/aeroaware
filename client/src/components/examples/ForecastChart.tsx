import { ForecastChart } from '../ForecastChart';

export default function ForecastChartExample() {
  const mockData = Array.from({ length: 72 }, (_, i) => ({
    time: `${i}h`,
    value: 30 + Math.sin(i / 12) * 20 + Math.random() * 10,
    uncertainty: {
      lower: 25 + Math.sin(i / 12) * 15,
      upper: 40 + Math.sin(i / 12) * 25,
    },
  }));

  return (
    <div className="p-8 bg-background">
      <ForecastChart
        data={mockData}
        pollutant="PM25"
        title="PM2.5 Forecast"
      />
    </div>
  );
}
