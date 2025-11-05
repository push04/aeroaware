import { useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LocationSearchProps {
  onLocationSelect: (location: { name: string; lat: number; lon: number }) => void;
  currentLocation?: string;
}

export function LocationSearch({ onLocationSelect, currentLocation }: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const mockResults = [
    { name: "New Delhi, India", lat: 28.6139, lon: 77.2090 },
    { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
    { name: "Bangalore, India", lat: 12.9716, lon: 77.5946 },
    { name: "Kolkata, India", lat: 22.5726, lon: 88.3639 },
  ];
  
  const handleGeolocation = () => {
    setSearching(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSelect({
            name: "Your Location",
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setSearching(false);
          console.log("Geolocation detected:", position.coords);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setSearching(false);
        }
      );
    }
  };
  
  return (
    <div className="flex gap-2 w-full max-w-2xl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between"
            data-testid="button-location-search"
          >
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{currentLocation || "Search location..."}</span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Search for a location..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              data-testid="input-location-search"
            />
            <CommandList>
              <CommandEmpty>No locations found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {mockResults
                  .filter(loc => 
                    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((location) => (
                    <CommandItem
                      key={location.name}
                      value={location.name}
                      onSelect={() => {
                        onLocationSelect(location);
                        setOpen(false);
                      }}
                      data-testid={`item-location-${location.name.replace(/[^a-zA-Z]/g, '-')}`}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {location.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleGeolocation}
        disabled={searching}
        data-testid="button-geolocation"
      >
        {searching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
