import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface DataExportProps {
  data: any;
  filename: string;
  type?: "dashboard" | "forecast" | "trends";
}

export function DataExport({ data, filename, type = "dashboard" }: DataExportProps) {
  const exportToCSV = () => {
    let csvContent = "";
    
    if (type === "dashboard" && data.pollutants) {
      csvContent = "Pollutant,Value,Unit\n";
      Object.entries(data.pollutants).forEach(([key, value]: [string, any]) => {
        const unit = key === "co" ? "mg/m³" : "µg/m³";
        csvContent += `${key.toUpperCase()},${value},${unit}\n`;
      });
      csvContent += `\nAQI,${data.aqi},\n`;
      csvContent += `Category,${data.category},\n`;
    }
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Print / PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
