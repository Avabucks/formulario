"use client";

import { useTransition, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { FileText, Star, Grid, List, Search } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { formatNumber } from "@/src/lib/utils";
import { SortSelector, SortOption } from "../shared/sort-selector";
import { useDebouncedCallback } from "use-debounce";

interface HomeTabsProps {
  activeTab: string;
  activeView: string;
  activeOrder: string;
  totalFormulari: number;
  totalPreferiti: number;
}

export function HomeTabs({
  activeTab,
  activeView,
  activeOrder,
  totalFormulari,
  totalPreferiti,
}: Readonly<HomeTabsProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = useState(searchParams.get("q") ?? "");

  const handleSearch = useDebouncedCallback((value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim() === "") {
        params.delete("q");
      } else {
        params.set("q", value);
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 400);

  const handleTabChange = (tabValue: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabValue);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleViewChange = (viewValue: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", viewValue);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleOrderChange = (orderValue: SortOption) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("order", orderValue);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const currentSort = (activeOrder ?? "modificato") as SortOption;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
      {/* Title & Mobile-only Sort Group */}
      <div className="flex items-center justify-between w-full lg:w-auto">
        <h2 className="text-2xl font-semibold text-foreground flex items-center shrink-0">
          La tua raccolta
        </h2>
        
        {/* Sort Selector ONLY on Mobile/Tablet (hidden on Desktop lg) */}
        <SortSelector
          value={currentSort}
          onChange={handleOrderChange}
          className="h-8 px-3 w-auto lg:hidden"
        />
      </div>

      {/* Search Input ONLY on Desktop (occupying remaining space between title and order button) */}
      <div className="hidden lg:block flex-1 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca nella tua raccolta..."
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            handleSearch(e.target.value);
          }}
          className="pl-10 w-full h-8!"
        />
      </div>
      
      {/* Tabs, View Selectors & Desktop-only Sort Group */}
      <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
        
        {/* Sort Selector ONLY on Desktop (hidden on Mobile/Tablet) */}
        <SortSelector
          value={currentSort}
          onChange={handleOrderChange}
          className="h-8 px-3 w-auto hidden lg:inline-flex"
        />

        {/* Separator between Order and View Selector (or Tab Selector if View is hidden) */}
        <div className="h-5 w-px bg-border hidden lg:block shrink-0" />

        {/* View Selector: Grid / List (Only visible on "formulari" tab, hidden on mobile) */}
        {activeTab === "formulari" && (
          <Tabs value={activeView} onValueChange={handleViewChange} className="shrink-0 hidden sm:inline-block">
            <TabsList variant="line" className="w-full sm:w-fit">
              <TabsTrigger value="grid" className="gap-2 px-3">
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2 px-3">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Separator between View Selector and Tab Selector (only if View Selector is rendered) */}
        {activeTab === "formulari" && (
          <div className="h-5 w-px bg-border hidden lg:block shrink-0" />
        )}

        {/* Tab Selector: Formulari / Preferiti */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full lg:w-auto">
          <TabsList variant="line" className="w-full lg:w-fit">
            <TabsTrigger value="formulari" className="gap-2 px-3 flex-1 lg:flex-initial">
              <FileText className="h-4 w-4" />
              <span>Formulari</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {formatNumber(totalFormulari)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="preferiti" className="gap-2 px-3 flex-1 lg:flex-initial">
              <Star className="h-4 w-4" />
              <span>Preferiti</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {formatNumber(totalPreferiti)}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
