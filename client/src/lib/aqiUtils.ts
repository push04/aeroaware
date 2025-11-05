export interface AQIBreakpoint {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}

export const WHO_BREAKPOINTS: AQIBreakpoint[] = [
  { min: 0, max: 50, label: "Good", color: "#10b981", description: "Air quality is satisfactory" },
  { min: 51, max: 100, label: "Moderate", color: "#fbbf24", description: "Acceptable for most people" },
  { min: 101, max: 150, label: "Unhealthy for Sensitive Groups", color: "#f97316", description: "May affect sensitive individuals" },
  { min: 151, max: 200, label: "Unhealthy", color: "#ef4444", description: "Everyone may experience health effects" },
  { min: 201, max: 300, label: "Very Unhealthy", color: "#a855f7", description: "Health alert: everyone may experience serious effects" },
  { min: 301, max: 500, label: "Hazardous", color: "#7f1d1d", description: "Health warning of emergency conditions" },
];

export const CPCB_BREAKPOINTS: AQIBreakpoint[] = [
  { min: 0, max: 50, label: "Good", color: "#10b981", description: "Minimal impact" },
  { min: 51, max: 100, label: "Satisfactory", color: "#84cc16", description: "Minor breathing discomfort to sensitive people" },
  { min: 101, max: 200, label: "Moderate", color: "#fbbf24", description: "Breathing discomfort to people with lung, heart disease" },
  { min: 201, max: 300, label: "Poor", color: "#f97316", description: "Breathing discomfort to most people on prolonged exposure" },
  { min: 301, max: 400, label: "Very Poor", color: "#ef4444", description: "Respiratory illness on prolonged exposure" },
  { min: 401, max: 500, label: "Severe", color: "#7f1d1d", description: "Affects healthy people and seriously impacts those with existing diseases" },
];

export function getAQIInfo(aqi: number, standard: "WHO" | "CPCB" = "WHO"): AQIBreakpoint {
  const breakpoints = standard === "WHO" ? WHO_BREAKPOINTS : CPCB_BREAKPOINTS;
  return breakpoints.find(bp => aqi >= bp.min && aqi <= bp.max) || breakpoints[breakpoints.length - 1];
}

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "#10b981";
  if (aqi <= 100) return "#fbbf24";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
}

export function getPollutantInfo(pollutant: string): { name: string; unit: string; formula: string } {
  const pollutants: Record<string, { name: string; unit: string; formula: string }> = {
    pm25: { name: "PM2.5", unit: "µg/m³", formula: "PM₂.₅" },
    pm10: { name: "PM10", unit: "µg/m³", formula: "PM₁₀" },
    no2: { name: "Nitrogen Dioxide", unit: "µg/m³", formula: "NO₂" },
    o3: { name: "Ozone", unit: "µg/m³", formula: "O₃" },
    so2: { name: "Sulfur Dioxide", unit: "µg/m³", formula: "SO₂" },
    co: { name: "Carbon Monoxide", unit: "mg/m³", formula: "CO" },
  };
  return pollutants[pollutant.toLowerCase()] || { name: pollutant, unit: "µg/m³", formula: pollutant };
}
