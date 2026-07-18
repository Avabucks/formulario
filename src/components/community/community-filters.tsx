"use client";

import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "../ui/input";
import { useFilters } from "@/src/hooks/useFilters";
import { SortSelector, SortOption } from "../shared/sort-selector";

export function CommunityFilters() {
  const { sortBy, searchQuery, setSearchQuery, updateParams } = useFilters();

  const handleSearch = useDebouncedCallback((value: string) => {
    updateParams({ q: value });
  }, 400);

  const handleSortChange = (value: SortOption) => {
    updateParams({ sort: value });
  };

  return (
    <div className="flex items-center justify-between w-full gap-3">
      {/* Search Input expanding to fill space */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca formule..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="pl-10 w-full h-9"
        />
      </div>

      {/* Sort Selector aligned next to search, auto-sized by text */}
      <SortSelector
        value={sortBy as SortOption}
        onChange={handleSortChange}
        className="h-9 px-3 w-auto shrink-0"
      />
    </div>
  );
}
