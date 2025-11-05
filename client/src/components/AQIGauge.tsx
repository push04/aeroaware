import { useEffect, useRef } from "react";
import { getAQIInfo, getAQIColor } from "@/lib/aqiUtils";

interface AQIGaugeProps {
  aqi: number;
  standard?: "WHO" | "CPCB";
  size?: "sm" | "md" | "lg";
}

export function AQIGauge({ aqi, standard = "WHO", size = "lg" }: AQIGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const info = getAQIInfo(aqi, standard);
  
  const sizes = {
    sm: { width: 160, height: 160, strokeWidth: 12, fontSize: 32 },
    md: { width: 240, height: 240, strokeWidth: 16, fontSize: 48 },
    lg: { width: 300, height: 300, strokeWidth: 20, fontSize: 64 },
  };
  
  const config = sizes[size];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const radius = (config.width / 2) - config.strokeWidth;
    
    ctx.clearRect(0, 0, config.width, config.height);
    
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;
    const percentage = Math.min(aqi / 500, 1);
    const currentAngle = startAngle + (endAngle - startAngle) * percentage;
    
    ctx.lineCap = "round";
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = "rgba(100, 100, 100, 0.1)";
    ctx.lineWidth = config.strokeWidth;
    ctx.stroke();
    
    const gradient = ctx.createLinearGradient(0, 0, config.width, 0);
    gradient.addColorStop(0, "#10b981");
    gradient.addColorStop(0.2, "#fbbf24");
    gradient.addColorStop(0.4, "#f97316");
    gradient.addColorStop(0.6, "#ef4444");
    gradient.addColorStop(0.8, "#a855f7");
    gradient.addColorStop(1, "#7f1d1d");
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = config.strokeWidth;
    ctx.stroke();
    
  }, [aqi, config]);
  
  return (
    <div className="relative inline-block" data-testid="gauge-aqi">
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        className="drop-shadow-lg"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-mono font-bold tracking-tight"
          style={{
            fontSize: `${config.fontSize}px`,
            color: getAQIColor(aqi),
            textShadow: `0 0 20px ${getAQIColor(aqi)}40`,
          }}
          data-testid="text-aqi-value"
        >
          {Math.round(aqi)}
        </div>
        <div className="text-sm font-medium text-muted-foreground mt-1" data-testid="text-aqi-label">
          {info.label}
        </div>
      </div>
    </div>
  );
}
