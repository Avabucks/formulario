"use client"
import { Clock, Search, Star, TrendingUp } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { useFilters } from "@/src/hooks/useFilters"; // il nostro hook custom

type SortOption = "trending" | "recent" | "popular";

export function CommunityFilters() {
    const { sortBy, searchQuery, setSearchQuery, updateParams } = useFilters();

    const handleSearch = useDebouncedCallback((value: string) => {
        updateParams({ q: value });
    }, 400);

    const sortLabels: Record<SortOption, { label: string; icon: React.ReactNode }> = {
        trending: { label: "In tendenza", icon: <TrendingUp className="h-4 w-4" /> },
        recent: { label: "Recenti", icon: <Clock className="h-4 w-4" /> },
        popular: { label: "Popolari", icon: <Star className="h-4 w-4" /> },
    };

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Cerca formule..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
                    }}
                    className="pl-10"
                />
            </div>
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            {sortLabels[sortBy].icon}
                            {sortLabels[sortBy].label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateParams({ sort: "trending" })}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            In tendenza
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateParams({ sort: "recent" })}>
                            <Clock className="mr-2 h-4 w-4" />
                            Recenti
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateParams({ sort: "popular" })}>
                            <Star className="mr-2 h-4 w-4" />
                            Popolari
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}