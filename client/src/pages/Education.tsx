import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Wind, AlertTriangle, Shield, TrendingUp, Microscope } from "lucide-react";

export default function Education() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Badge variant="outline" className="mb-3 flex items-center gap-1 w-fit">
            <BookOpen className="h-3 w-3" />
            Learn About Air Quality
          </Badge>
          <h1 className="text-4xl font-bold mb-2">Education & FAQ</h1>
          <p className="text-muted-foreground">
            Understanding air quality indices, pollutants, and health impacts
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-8">
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wind className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">What is AQI?</h2>
              <p className="text-sm text-muted-foreground">Air Quality Index Explained</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="leading-relaxed">
              The Air Quality Index (AQI) is a standardized indicator of air pollution levels. 
              AEROAWARE uses the <strong>CPCB (Central Pollution Control Board) Indian AQI</strong> 
              as the primary standard, which measures air quality on a scale of 0-500+.
            </p>
            
            <div className="grid gap-3 mt-4">
              {[
                { range: "0-50", category: "Good", color: "bg-green-500", desc: "Air quality is satisfactory" },
                { range: "51-100", category: "Moderate", color: "bg-yellow-500", desc: "Acceptable for most people" },
                { range: "101-200", category: "Poor", color: "bg-orange-500", desc: "May cause breathing discomfort" },
                { range: "201-300", category: "Very Poor", color: "bg-red-500", desc: "Respiratory effects for everyone" },
                { range: "301-400", category: "Severe", color: "bg-purple-500", desc: "Serious health effects" },
                { range: "401+", category: "Hazardous", color: "bg-red-900", desc: "Emergency conditions" },
              ].map((level) => (
                <div key={level.range} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                  <div className={`h-3 w-3 rounded-full ${level.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{level.category}</span>
                      <span className="text-sm font-mono text-muted-foreground">{level.range}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{level.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Microscope className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Common Pollutants</h2>
              <p className="text-sm text-muted-foreground">Understanding What You're Breathing</p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                name: "PM2.5",
                fullName: "Fine Particulate Matter",
                desc: "Tiny particles ≤2.5 micrometers that can penetrate deep into lungs and bloodstream",
                sources: "Vehicle exhaust, industrial emissions, biomass burning",
                health: "Respiratory diseases, cardiovascular problems, reduced lung function",
                whoLimit: "15 µg/m³ (24-hour average)",
              },
              {
                name: "PM10",
                fullName: "Coarse Particulate Matter",
                desc: "Particles ≤10 micrometers from dust, pollen, and mold",
                sources: "Construction, road dust, agricultural activities",
                health: "Aggravated asthma, lung inflammation, breathing difficulties",
                whoLimit: "45 µg/m³ (24-hour average)",
              },
              {
                name: "NO₂",
                fullName: "Nitrogen Dioxide",
                desc: "Reddish-brown gas with a sharp odor, forms from combustion",
                sources: "Vehicle emissions, power plants, industrial facilities",
                health: "Reduced lung function, increased asthma attacks, respiratory infections",
                whoLimit: "25 µg/m³ (24-hour average)",
              },
              {
                name: "O₃",
                fullName: "Ground-level Ozone",
                desc: "Secondary pollutant formed by chemical reactions in sunlight",
                sources: "Not directly emitted; forms from NOx and VOCs",
                health: "Chest pain, coughing, throat irritation, airway inflammation",
                whoLimit: "100 µg/m³ (8-hour average)",
              },
              {
                name: "SO₂",
                fullName: "Sulfur Dioxide",
                desc: "Colorless gas with a pungent smell from burning fossil fuels",
                sources: "Coal-fired power plants, oil refineries, metal smelting",
                health: "Breathing problems, respiratory illnesses, eye irritation",
                whoLimit: "40 µg/m³ (24-hour average)",
              },
              {
                name: "CO",
                fullName: "Carbon Monoxide",
                desc: "Odorless, colorless gas from incomplete combustion",
                sources: "Motor vehicles, industrial processes, residential heating",
                health: "Headaches, dizziness, reduced oxygen delivery to organs",
                whoLimit: "4 mg/m³ (24-hour average)",
              },
            ].map((pollutant) => (
              <div key={pollutant.name} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{pollutant.name}</h3>
                    <p className="text-sm text-muted-foreground">{pollutant.fullName}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">WHO Limit: {pollutant.whoLimit}</Badge>
                </div>
                <p className="text-sm mb-3">{pollutant.desc}</p>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">Sources:</span> <span className="text-muted-foreground">{pollutant.sources}</span>
                  </div>
                  <div>
                    <span className="font-medium">Health Effects:</span> <span className="text-muted-foreground">{pollutant.health}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="q1" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                Why is air quality worse in winter?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Winter brings lower temperatures and calm atmospheric conditions that trap pollutants near the ground. 
                Combined with crop burning, increased heating emissions, and reduced wind speed, this creates a "pollution dome" 
                over cities, especially in northern India.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                How accurate are air quality forecasts?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                AEROAWARE uses meteorological models and historical data to predict air quality with 70-85% accuracy for 
                24-hour forecasts and 60-75% accuracy for 48-72 hour forecasts. Accuracy decreases with longer time horizons 
                due to weather pattern complexity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                Should I exercise outdoors when AQI is moderate (51-100)?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                For most healthy adults, moderate AQI is generally safe for outdoor exercise. However, sensitive groups 
                (children, elderly, those with asthma/heart conditions) should consider reducing intense outdoor activities. 
                Early morning (6-8 AM) typically has better air quality than evening hours.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                Do indoor air purifiers really help?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! HEPA filters can remove 99.97% of PM2.5 particles. For best results, use purifiers with appropriate 
                room size ratings, keep doors/windows closed when outdoor AQI exceeds 100, and replace filters as recommended. 
                Purifiers are especially beneficial for bedrooms and spaces where you spend most time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                What's the difference between CPCB AQI and US EPA AQI?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                CPCB (Indian) and US EPA use different calculation methods and pollutant weightings. CPCB tends to show 
                higher AQI values for the same pollution levels because it uses stricter breakpoints. AEROAWARE displays 
                both standards so you can compare and make informed decisions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q6" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                Why do different websites show different AQI values?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Different sources may use: (1) different monitoring stations, (2) different AQI calculation methods 
                (CPCB vs US EPA vs WHO), (3) different update frequencies, and (4) different data aggregation periods. 
                AEROAWARE transparently shows data sources and update times for full transparency.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Protection Strategies</h2>
              <p className="text-sm text-muted-foreground">Reduce Your Exposure</p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "Monitor Air Quality Daily",
                desc: "Check AEROAWARE forecasts to plan outdoor activities during cleaner hours.",
                aqiRange: "All Levels",
              },
              {
                title: "Use N95/N99 Masks",
                desc: "Wear properly fitted masks when AQI exceeds 150, especially during commutes.",
                aqiRange: "Poor & Above (>100)",
              },
              {
                title: "Indoor Air Purification",
                desc: "Run HEPA purifiers in bedrooms and living spaces, especially overnight.",
                aqiRange: "Poor & Above (>100)",
              },
              {
                title: "Keep Windows Closed",
                desc: "Seal gaps and use air conditioning instead of natural ventilation when AQI is high.",
                aqiRange: "Very Poor & Above (>200)",
              },
              {
                title: "Avoid Peak Pollution Hours",
                desc: "Minimize outdoor exposure during morning rush (7-9 AM) and evening (6-8 PM).",
                aqiRange: "Poor & Above (>100)",
              },
              {
                title: "Indoor Plants",
                desc: "NASA-studied plants like Snake Plant and Peace Lily can improve indoor air quality naturally.",
                aqiRange: "All Levels",
              },
            ].map((strategy, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/20">
                <div className="mt-0.5">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold">{strategy.title}</h3>
                    <Badge variant="outline" className="text-xs ml-2">{strategy.aqiRange}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{strategy.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
