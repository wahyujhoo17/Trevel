"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { locations, type Location } from "@/data/locations";

interface PlaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultLocation?: string;
}

export function PlaceSearch({
  value,
  onChange,
  placeholder = "Search destinations...",
  defaultLocation,
}: PlaceSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [filteredPlaces, setFilteredPlaces] = React.useState<Location[]>([]);

  React.useEffect(() => {
    if (defaultLocation) {
      const defaultPlace = locations.find(
        (place) => place.code === defaultLocation
      );
      if (defaultPlace) {
        onChange(defaultPlace.code);
      }
    }
  }, [defaultLocation, onChange]);

  const searchPlaces = React.useCallback((searchTerm: string) => {
    setInputValue(searchTerm);

    if (!searchTerm) {
      setFilteredPlaces([]);
      return;
    }

    const query = searchTerm.toLowerCase().trim();

    // Filter locations based on search term
    const filtered = locations.filter((location) => {
      return (
        location.name.toLowerCase().includes(query) ||
        location.city.toLowerCase().includes(query) ||
        location.country.toLowerCase().includes(query) ||
        location.code.toLowerCase().includes(query)
      );
    });

    // Sort results by relevance
    filtered.sort((a, b) => {
      // Check if search term matches the start of city or country
      const aStartsWithCity = a.city.toLowerCase().startsWith(query);
      const bStartsWithCity = b.city.toLowerCase().startsWith(query);
      const aStartsWithCountry = a.country.toLowerCase().startsWith(query);
      const bStartsWithCountry = b.country.toLowerCase().startsWith(query);

      // Prioritize exact matches
      const aExactMatch =
        a.city.toLowerCase() === query || a.country.toLowerCase() === query;
      const bExactMatch =
        b.city.toLowerCase() === query || b.country.toLowerCase() === query;

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      if (aStartsWithCity && !bStartsWithCity) return -1;
      if (!aStartsWithCity && bStartsWithCity) return 1;
      if (aStartsWithCountry && !bStartsWithCountry) return -1;
      if (!aStartsWithCountry && bStartsWithCountry) return 1;

      return 0;
    });

    setFilteredPlaces(filtered);
  }, []);

  const debouncedSearch = React.useMemo(
    () => debounce(searchPlaces, 300),
    [searchPlaces]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={() => setOpen(true)}
        >
          {value ? (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {locations.find((place) => place.code === value)?.city || value}
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {placeholder}
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by city, country, or airport..."
            value={inputValue}
            onValueChange={(value) => {
              setInputValue(value);
              debouncedSearch(value);
            }}
          />
          {!inputValue && (
            <CommandEmpty>Start typing to search...</CommandEmpty>
          )}
          {inputValue && filteredPlaces.length === 0 && (
            <CommandEmpty>No destinations found.</CommandEmpty>
          )}
          {filteredPlaces.length > 0 && (
            <CommandGroup>
              {filteredPlaces.map((place) => (
                <CommandItem
                  key={place.id}
                  value={place.code}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setInputValue("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === place.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{place.city}</span>
                    <span className="text-sm text-muted-foreground">
                      {place.country} ({place.code})
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
