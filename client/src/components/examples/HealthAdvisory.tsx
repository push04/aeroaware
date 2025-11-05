import { HealthAdvisory } from '../HealthAdvisory';

export default function HealthAdvisoryExample() {
  return (
    <div className="p-8 bg-background max-w-2xl mx-auto">
      <HealthAdvisory aqi={125} />
    </div>
  );
}
