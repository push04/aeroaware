import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, LineChart, Heart, Bell, Wind, GitCompare, BookOpen } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/forecast", label: "Forecast", icon: TrendingUp },
    { path: "/compare", label: "Compare", icon: GitCompare },
    { path: "/health", label: "Health", icon: Heart },
    { path: "/education", label: "Learn", icon: BookOpen },
  ];
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 group px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-primary/5" onClick={() => window.location.href = "/"} data-testid="link-home">
            <div className="relative">
              <Wind className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">AEROAWARE</span>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                  onClick={() => window.location.href = item.path}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
