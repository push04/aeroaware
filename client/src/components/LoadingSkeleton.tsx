import { Card } from "@/components/ui/card";

export function AQICardSkeleton() {
  return (
    <Card className="p-6 space-y-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded"></div>
          <div className="h-3 w-24 bg-muted rounded"></div>
        </div>
        <div className="h-2 w-2 rounded-full bg-muted"></div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-16 w-32 bg-muted rounded"></div>
            <div className="h-6 w-24 bg-muted rounded"></div>
            <div className="h-4 w-28 bg-muted rounded"></div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border h-24 w-32"></div>
        </div>
        
        <div className="h-12 w-full bg-muted rounded"></div>
      </div>
      
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted rounded"></div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-md bg-muted/30 border h-20"></div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-32 bg-muted rounded"></div>
          <div className="h-8 w-24 bg-muted rounded"></div>
        </div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    </Card>
  );
}

export function TableSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="divide-y">
        <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-muted rounded"></div>
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
