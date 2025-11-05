// Indian National Air Quality Index (CPCB) calculation
// Based on Central Pollution Control Board standards

interface AQIBreakpoint {
  low: number;
  high: number;
  aqiLow: number;
  aqiHigh: number;
}

// CPCB breakpoints for PM2.5 (µg/m³) - Official CPCB Standards
const PM25_BREAKPOINTS: AQIBreakpoint[] = [
  { low: 0, high: 30, aqiLow: 0, aqiHigh: 50 },
  { low: 31, high: 60, aqiLow: 51, aqiHigh: 100 },
  { low: 61, high: 90, aqiLow: 101, aqiHigh: 200 },
  { low: 91, high: 120, aqiLow: 201, aqiHigh: 300 },
  { low: 121, high: 250, aqiLow: 301, aqiHigh: 400 },
  { low: 251, high: 350, aqiLow: 401, aqiHigh: 500 },
];

// CPCB breakpoints for PM10 (µg/m³) - Official CPCB Standards
const PM10_BREAKPOINTS: AQIBreakpoint[] = [
  { low: 0, high: 50, aqiLow: 0, aqiHigh: 50 },
  { low: 51, high: 100, aqiLow: 51, aqiHigh: 100 },
  { low: 101, high: 250, aqiLow: 101, aqiHigh: 200 },
  { low: 251, high: 350, aqiLow: 201, aqiHigh: 300 },
  { low: 351, high: 430, aqiLow: 301, aqiHigh: 400 },
  { low: 431, high: 500, aqiLow: 401, aqiHigh: 500 },
];

// CPCB breakpoints for NO2 (µg/m³) - Official CPCB Standards
const NO2_BREAKPOINTS: AQIBreakpoint[] = [
  { low: 0, high: 40, aqiLow: 0, aqiHigh: 50 },
  { low: 41, high: 80, aqiLow: 51, aqiHigh: 100 },
  { low: 81, high: 180, aqiLow: 101, aqiHigh: 200 },
  { low: 181, high: 280, aqiLow: 201, aqiHigh: 300 },
  { low: 281, high: 400, aqiLow: 301, aqiHigh: 400 },
  { low: 401, high: 1000, aqiLow: 401, aqiHigh: 500 },
];

// CPCB breakpoints for O3 (µg/m³) - Official CPCB Standards  
const O3_BREAKPOINTS: AQIBreakpoint[] = [
  { low: 0, high: 50, aqiLow: 0, aqiHigh: 50 },
  { low: 51, high: 100, aqiLow: 51, aqiHigh: 100 },
  { low: 101, high: 168, aqiLow: 101, aqiHigh: 200 },
  { low: 169, high: 208, aqiLow: 201, aqiHigh: 300 },
  { low: 209, high: 748, aqiLow: 301, aqiHigh: 400 },
  { low: 749, high: 1000, aqiLow: 401, aqiHigh: 500 },
];

function calculateSubIndex(concentration: number, breakpoints: AQIBreakpoint[]): number {
  if (concentration < 0) return 0;
  
  for (const bp of breakpoints) {
    if (concentration >= bp.low && concentration <= bp.high) {
      return Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (concentration - bp.low) + bp.aqiLow
      );
    }
  }
  
  // If concentration exceeds all breakpoints, return max AQI
  return 500;
}

export function calculateIndianAQI(pollutants: {
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
}): number {
  const subIndices: number[] = [];
  
  if (pollutants.pm25 !== undefined && pollutants.pm25 > 0) {
    subIndices.push(calculateSubIndex(pollutants.pm25, PM25_BREAKPOINTS));
  }
  if (pollutants.pm10 !== undefined && pollutants.pm10 > 0) {
    subIndices.push(calculateSubIndex(pollutants.pm10, PM10_BREAKPOINTS));
  }
  if (pollutants.no2 !== undefined && pollutants.no2 > 0) {
    subIndices.push(calculateSubIndex(pollutants.no2, NO2_BREAKPOINTS));
  }
  if (pollutants.o3 !== undefined && pollutants.o3 > 0) {
    subIndices.push(calculateSubIndex(pollutants.o3, O3_BREAKPOINTS));
  }
  
  // Indian AQI is the maximum of all sub-indices
  return subIndices.length > 0 ? Math.max(...subIndices) : 0;
}

export function getAQICategory(aqi: number): {
  category: string;
  color: string;
  healthImplications: string;
} {
  if (aqi <= 50) {
    return {
      category: 'Good',
      color: '#00E400',
      healthImplications: 'Minimal impact. Air quality is satisfactory.',
    };
  } else if (aqi <= 100) {
    return {
      category: 'Satisfactory',
      color: '#FFFF00',
      healthImplications: 'Minor breathing discomfort to sensitive people.',
    };
  } else if (aqi <= 200) {
    return {
      category: 'Moderate',
      color: '#FF7E00',
      healthImplications: 'Breathing discomfort to people with lung, heart disease.',
    };
  } else if (aqi <= 300) {
    return {
      category: 'Poor',
      color: '#FF0000',
      healthImplications: 'Breathing discomfort to most people on prolonged exposure.',
    };
  } else if (aqi <= 400) {
    return {
      category: 'Very Poor',
      color: '#99004C',
      healthImplications: 'Respiratory illness on prolonged exposure.',
    };
  } else {
    return {
      category: 'Severe',
      color: '#7E0023',
      healthImplications: 'Affects healthy people and seriously impacts those with existing diseases.',
    };
  }
}

export function getCPCBHealthAdvice(aqi: number): string[] {
  if (aqi <= 50) {
    return [
      'Enjoy outdoor activities',
      'Air quality is ideal for outdoor exercise',
    ];
  } else if (aqi <= 100) {
    return [
      'Sensitive individuals should limit prolonged outdoor exertion',
      'General public can carry on normal activities',
    ];
  } else if (aqi <= 200) {
    return [
      'People with lung disease, children and elderly should limit prolonged outdoor activities',
      'General public should reduce prolonged or heavy exertion',
    ];
  } else if (aqi <= 300) {
    return [
      'People with lung disease, children and elderly should avoid outdoor activities',
      'General public should minimize outdoor exertion',
      'Consider wearing N95 masks outdoors',
    ];
  } else if (aqi <= 400) {
    return [
      'Everyone should avoid all outdoor physical activities',
      'People with lung/heart disease should remain indoors',
      'Wear N95 masks if you must go out',
      'Use air purifiers indoors',
    ];
  } else {
    return [
      'Emergency conditions. Everyone should avoid outdoor activities',
      'Remain indoors and keep windows/doors closed',
      'Run air purifiers continuously',
      'Seek medical help if experiencing breathing difficulties',
    ];
  }
}
