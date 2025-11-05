import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, Star, Clock, X } from "lucide-react";
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

interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

interface SavedLocation {
  name: string;
  lat: number;
  lon: number;
  timestamp?: number;
}

const RECENT_LOCATIONS_KEY = "aeroaware_recent_locations";
const SAVED_LOCATIONS_KEY = "aeroaware_saved_locations";
const MAX_RECENT = 5;

export function LocationSearch({ onLocationSelect, currentLocation }: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [recentLocations, setRecentLocations] = useState<SavedLocation[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_LOCATIONS_KEY);
      const recent = localStorage.getItem(RECENT_LOCATIONS_KEY);
      if (saved) setSavedLocations(JSON.parse(saved));
      if (recent) setRecentLocations(JSON.parse(recent));
    } catch (error) {
      console.error('Failed to load saved locations:', error);
      localStorage.removeItem(SAVED_LOCATIONS_KEY);
      localStorage.removeItem(RECENT_LOCATIONS_KEY);
    }
  }, []);

  const saveRecentLocation = (location: SavedLocation) => {
    try {
      const updated = [
        location,
        ...recentLocations.filter(loc => loc.name !== location.name)
      ].slice(0, MAX_RECENT);
      setRecentLocations(updated);
      localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent location:', error);
    }
  };

  const toggleSavedLocation = (location: SavedLocation) => {
    try {
      const isAlreadySaved = savedLocations.some(loc => loc.name === location.name);
      const updated = isAlreadySaved
        ? savedLocations.filter(loc => loc.name !== location.name)
        : [...savedLocations, location];
      setSavedLocations(updated);
      localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to toggle saved location:', error);
    }
  };

  const clearRecentLocations = () => {
    setRecentLocations([]);
    localStorage.removeItem(RECENT_LOCATIONS_KEY);
  };

  const isSaved = (locationName: string) => 
    savedLocations.some(loc => loc.name === locationName);

  useEffect(() => {
    const searchLocations = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoadingResults(true);
      try {
        const response = await fetch(`/api/locations/search?query=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const results: LocationResult[] = await response.json();
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Location search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoadingResults(false);
      }
    };

    const debounce = setTimeout(() => {
      searchLocations();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);
  
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
    <div className="flex gap-3 w-full max-w-2xl mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between h-14 px-6 text-lg bg-white/95 backdrop-blur-md border-2 border-blue-200 hover:border-blue-400 hover:bg-white shadow-xl hover:shadow-2xl transition-all duration-300 text-gray-800 font-medium"
            data-testid="button-location-search"
          >
            <MapPin className="h-5 w-5 mr-3 text-blue-600" />
            <span className="truncate text-gray-700">{currentLocation || "Search location..."}</span>
            <Search className="ml-3 h-5 w-5 shrink-0 text-blue-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0 shadow-2xl border-2 border-blue-200">
          <Command className="bg-white/95 backdrop-blur-md">
            <CommandInput
              placeholder="Search for a location..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              data-testid="input-location-search"
              className="text-base"
            />
            <CommandList>
              {isLoadingResults ? (
                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching locations...</span>
                </div>
              ) : searchQuery.length >= 2 ? (
                searchResults.length === 0 ? (
                  <CommandEmpty>No locations found. Try a different search.</CommandEmpty>
                ) : (
                  <CommandGroup heading="Search Results">
                    {searchResults.map((location) => {
                      const fullName = `${location.name}, ${location.country}`;
                      return (
                        <CommandItem
                          key={`${location.latitude}-${location.longitude}`}
                          value={location.name}
                          onSelect={() => {
                            const selectedLoc = {
                              name: fullName,
                              lat: location.latitude,
                              lon: location.longitude,
                            };
                            saveRecentLocation(selectedLoc);
                            onLocationSelect(selectedLoc);
                            setOpen(false);
                            setSearchQuery("");
                          }}
                          data-testid={`item-location-${location.name.replace(/[^a-zA-Z]/g, '-')}`}
                          className="hover:bg-blue-50 cursor-pointer py-3"
                        >
                          <MapPin className="mr-3 h-4 w-4 text-blue-600" />
                          <div className="flex flex-col flex-1">
                            <span className="text-gray-800 font-medium">{location.name}</span>
                            <span className="text-xs text-gray-500">{location.country}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSavedLocation({
                                name: fullName,
                                lat: location.latitude,
                                lon: location.longitude,
                              });
                            }}
                            className="p-1 hover:bg-blue-100 rounded"
                          >
                            <Star className={`h-4 w-4 ${isSaved(fullName) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </button>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )
              ) : (
                <>
                  {savedLocations.length > 0 && (
                    <CommandGroup heading="Saved Places">
                      {savedLocations.map((location) => (
                        <CommandItem
                          key={location.name}
                          value={location.name}
                          onSelect={() => {
                            saveRecentLocation(location);
                            onLocationSelect(location);
                            setOpen(false);
                          }}
                          className="hover:bg-blue-50 cursor-pointer py-3"
                        >
                          <Star className="mr-3 h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-800 font-medium flex-1">{location.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSavedLocation(location);
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Remove from saved"
                          >
                            <X className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {recentLocations.length > 0 && (
                    <CommandGroup heading={
                      <div className="flex items-center justify-between">
                        <span>Recent Searches</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearRecentLocations();
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-normal"
                        >
                          Clear all
                        </button>
                      </div>
                    }>
                      {recentLocations.map((location) => (
                        <CommandItem
                          key={location.name}
                          value={location.name}
                          onSelect={() => {
                            saveRecentLocation(location);
                            onLocationSelect(location);
                            setOpen(false);
                          }}
                          className="hover:bg-blue-50 cursor-pointer py-3"
                        >
                          <Clock className="mr-3 h-4 w-4 text-gray-400" />
                          <span className="text-gray-800 font-medium flex-1">{location.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSavedLocation(location);
                            }}
                            className="p-1 hover:bg-blue-100 rounded"
                          >
                            <Star className={`h-4 w-4 ${isSaved(location.name) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {savedLocations.length === 0 && recentLocations.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Type at least 2 characters to search
                    </div>
                  )}
                </>
              )}
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
        className="h-14 w-14 bg-blue-500 hover:bg-blue-600 border-2 border-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        {searching ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : (
          <MapPin className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
}
