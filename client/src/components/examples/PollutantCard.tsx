import { PollutantCard } from '../PollutantCard';

export default function PollutantCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-background">
      <PollutantCard
        pollutant="pm25"
        value={35.6}
        trend="up"
        sparklineData={[28, 30, 32, 35, 36, 34, 35, 35.6]}
      />
      <PollutantCard
        pollutant="pm10"
        value={58.2}
        trend="down"
        sparklineData={[65, 63, 60, 59, 58.2]}
      />
      <PollutantCard
        pollutant="no2"
        value={42.1}
        trend="stable"
        sparklineData={[42, 42, 41, 42, 42.1]}
      />
      <PollutantCard
        pollutant="o3"
        value={68.5}
        trend="up"
        sparklineData={[62, 64, 66, 67, 68.5]}
      />
    </div>
  );
}
