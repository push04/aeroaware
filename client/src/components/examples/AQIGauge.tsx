import { AQIGauge } from '../AQIGauge';

export default function AQIGaugeExample() {
  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-background">
      <AQIGauge aqi={85} standard="WHO" size="lg" />
    </div>
  );
}
