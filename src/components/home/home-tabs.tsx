"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { FileText, Star, Grid, List } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { formatNumber } from "@/src/lib/utils";
import { Spinner } from "../ui/spinner";
import { SortSelector, SortOption } from "../shared/sort-selector";

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          La tua raccolta
          {isPending && <Spinner />}
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Tab Selector: Formulari / Preferiti */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList variant="line" className="w-fit">
            <TabsTrigger value="formulari" className="gap-2 px-3">
              <FileText className="h-4 w-4" />
              Formulari
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {formatNumber(totalFormulari)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="preferiti" className="gap-2 px-3">
              <Star className="h-4 w-4" />
              Preferiti
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {formatNumber(totalPreferiti)}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* View Selector: Grid / List (Only visible on "formulari" tab) */}
        {activeTab === "formulari" && (
          <Tabs value={activeView} onValueChange={handleViewChange}>
            <TabsList variant="line" className="w-fit">
              <TabsTrigger value="grid" className="gap-2 px-2.5">
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2 px-2.5">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Reusable Sort Selector */}
        <SortSelector
          value={currentSort}
          onChange={handleOrderChange}
        />
      </div>
    </div>
  );
}
