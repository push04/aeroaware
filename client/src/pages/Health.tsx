import { HealthAdvisory } from "@/components/HealthAdvisory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Send, Shield } from "lucide-react";
import { useState } from "react";

export default function Health() {
  const [aiQuestion, setAiQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; message: string }>>([]);
  
  const handleAskAI = () => {
    if (!aiQuestion.trim()) return;
    
    setChatHistory(prev => [
      ...prev,
      { role: "user", message: aiQuestion },
      {
        role: "ai",
        message: "Based on current air quality levels, I recommend limiting outdoor activities during peak pollution hours (7-9 AM and 6-8 PM). If you must go outside, consider wearing an N95 mask. Indoor air purifiers can help reduce exposure at home."
      }
    ]);
    setAiQuestion("");
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Badge variant="outline" className="mb-3 flex items-center gap-1 w-fit">
            <Shield className="h-3 w-3" />
            WHO/CPCB Guidelines
          </Badge>
          <h1 className="text-4xl font-bold mb-2">Health Guidance</h1>
          <p className="text-muted-foreground">
            Personalized air quality health recommendations based on international standards
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-8">
        
        <HealthAdvisory aqi={125} />
        
        {/* AI Chat Interface */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Ask AI About Air Quality</h3>
          </div>
          
          <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ask me anything about air quality and health</p>
              </div>
            ) : (
              chatHistory.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      chat.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{chat.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Is it safe to exercise outdoors today?"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
              data-testid="input-ai-question"
            />
            <Button onClick={handleAskAI} data-testid="button-ask-ai">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
        
        {/* Vulnerable Groups */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vulnerable Groups</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Certain groups are more sensitive to air pollution and should take extra precautions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: "Children & Elderly", desc: "More susceptible to respiratory irritation" },
              { title: "Asthma & Lung Disease", desc: "May experience worsened symptoms" },
              { title: "Heart Conditions", desc: "Increased cardiovascular stress" },
              { title: "Pregnant Women", desc: "Potential fetal development impacts" },
            ].map((group, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-muted/50 border">
                <div className="font-medium mb-1">{group.title}</div>
                <div className="text-sm text-muted-foreground">{group.desc}</div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Protection Measures */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Protection Measures</h3>
          <div className="space-y-3">
            {[
              { title: "Use Air Purifiers", desc: "HEPA filters can remove 99.97% of particles" },
              { title: "Wear N95 Masks", desc: "Especially during high pollution days" },
              { title: "Limit Outdoor Activities", desc: "During peak pollution hours (7-9 AM, 6-8 PM)" },
              { title: "Keep Windows Closed", desc: "When outdoor AQI is above 150" },
              { title: "Stay Hydrated", desc: "Helps body naturally filter pollutants" },
            ].map((measure, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5 flex-shrink-0">{idx + 1}</Badge>
                <div>
                  <div className="font-medium text-sm">{measure.title}</div>
                  <div className="text-sm text-muted-foreground">{measure.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
