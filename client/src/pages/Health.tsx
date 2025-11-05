import { HealthAdvisory } from "@/components/HealthAdvisory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react";
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
    console.log('AI question asked:', aiQuestion);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-serif font-semibold mb-2">Health Guidance</h1>
          <p className="text-muted-foreground">
            Personalized air quality health recommendations
          </p>
        </div>
        
        <HealthAdvisory aqi={125} />
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Ask AI About Air Quality</h3>
          </div>
          
          <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
                        : "bg-muted"
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
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vulnerable Groups</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Certain groups are more sensitive to air pollution and should take extra precautions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-md bg-muted/50">
              <div className="font-medium text-sm mb-1">Children & Elderly</div>
              <div className="text-xs text-muted-foreground">
                More susceptible to respiratory irritation
              </div>
            </div>
            <div className="p-3 rounded-md bg-muted/50">
              <div className="font-medium text-sm mb-1">Asthma & Lung Disease</div>
              <div className="text-xs text-muted-foreground">
                May experience worsened symptoms
              </div>
            </div>
            <div className="p-3 rounded-md bg-muted/50">
              <div className="font-medium text-sm mb-1">Heart Conditions</div>
              <div className="text-xs text-muted-foreground">
                Increased cardiovascular stress
              </div>
            </div>
            <div className="p-3 rounded-md bg-muted/50">
              <div className="font-medium text-sm mb-1">Pregnant Women</div>
              <div className="text-xs text-muted-foreground">
                Potential fetal development impacts
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Protection Measures</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <div className="font-medium text-sm">Use Air Purifiers</div>
                <div className="text-xs text-muted-foreground">
                  HEPA filters can remove 99.97% of airborne particles indoors
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <div className="font-medium text-sm">Wear N95 Masks</div>
                <div className="text-xs text-muted-foreground">
                  Properly fitted masks block fine particulate matter outdoors
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <div className="font-medium text-sm">Monitor AQI Daily</div>
                <div className="text-xs text-muted-foreground">
                  Plan outdoor activities when air quality is better
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <div className="font-medium text-sm">Keep Windows Closed</div>
                <div className="text-xs text-muted-foreground">
                  During high pollution periods to prevent outdoor air from entering
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
