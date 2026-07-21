"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  FileText,
  Star,
  Grid,
  List,
  Search,
  BookOpen,
  StarOff,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  StackedCardsIllustration,
} from "@/src/components/ui/empty";
import Link from "next/link";
import ForumlarioAdd from "./formulario-add";
import { FormularioCardHome } from "./formulario-card-home";
import { formatNumber } from "@/src/lib/utils";
import { SortSelector, SortOption } from "../shared/sort-selector";
import { useDebouncedCallback } from "use-debounce";
import { FormularioCard } from "./formulario-card";

interface Formulario {
  id: string;
  titolo: string;
  nomeAutore?: string;
  photoURL?: string;
  dataCreazione?: string;
  dataModifica?: string;
  descrizione?: string;
  visibility: 0 | 1 | 2;
  views: number;
  likes: number;
  starred: boolean;
}

interface HomeTabsProps {
  activeTab: string; // Controlled by URL parameter
  initialView: string; // Synced with server cookie
  initialOrder: SortOption; // Synced with server cookie
  formulari: Formulario[];
  preferiti: Formulario[];
  userId: string;
}

export function HomeTabs({
  activeTab,
  initialView,
  initialOrder,
  formulari,
  preferiti,
  userId,
}: Readonly<HomeTabsProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize state directly from server cookies to prevent any hydration flash/glitch
  const [activeView, setActiveView] = useState<string>(initialView);
  const [activeOrder, setActiveOrder] = useState<SortOption>(initialOrder);

  const [searchVal, setSearchVal] = useState(searchParams.get("q") ?? "");

  const handleTabChange = (tabValue: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabValue);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleViewChange = (viewValue: string) => {
    setActiveView(viewValue);
    // Persist via cookie to let the server know on next reload
    document.cookie = `home-view=${viewValue}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const handleOrderChange = (orderValue: SortOption) => {
    setActiveOrder(orderValue);
    // Persist via cookie to let the server know on next reload
    document.cookie = `home-order=${orderValue}; path=/; max-age=31536000; SameSite=Lax`;
  };

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

  // Client-side Sorting Logic
  const sortItems = (items: Formulario[]) => {
    const sorted = [...items];
    if (activeOrder === "creato") {
      return sorted.sort(
        (a, b) =>
          new Date(b.dataCreazione ?? "").getTime() -
          new Date(a.dataCreazione ?? "").getTime(),
      );
    }
    if (activeOrder === "titolo") {
      return sorted.sort((a, b) =>
        (a.titolo || "").localeCompare(b.titolo || ""),
      );
    }
    if (activeOrder === "views") {
      return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    if (activeOrder === "popolari") {
      return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    // Default: modificato
    return sorted.sort(
      (a, b) =>
        new Date(b.dataModifica ?? "").getTime() -
        new Date(a.dataModifica ?? "").getTime(),
    );
  };

  const renderEmptyFormulari = () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <StackedCardsIllustration />
        </EmptyMedia>
        <EmptyTitle>Nessun formulario</EmptyTitle>
        <EmptyDescription>Non ci sono formulari da mostrare.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <ForumlarioAdd allowKey={false} showLabel={true} />
      </EmptyContent>
    </Empty>
  );

  const renderEmptyPreferiti = () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <StackedCardsIllustration />
        </EmptyMedia>
        <EmptyTitle>Nessun formulario preferito</EmptyTitle>
        <EmptyDescription>
          Non hai ancora aggiunto formulari ai preferiti.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button asChild variant="outline" size="lg" className="gap-2 px-8">
          <Link href="/community/page/1">
            <UsersRound className="h-5 w-5" />
            Esplora la Community
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );

  const renderFormulariContent = () => {
    if (formulari.length === 0) {
      return renderEmptyFormulari();
    }

    const sortedFormulari = sortItems(formulari);

    if (activeView === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[101rem]:grid-cols-5 gap-4 w-full">
          {sortedFormulari.map((f) => (
            <FormularioCardHome
              variant="grid"
              formulario={f}
              key={f.id}
              userId={userId}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 w-full">
        {sortedFormulari.map((f) => (
          <FormularioCardHome
            variant="list"
            formulario={f}
            key={f.id}
            userId={userId}
          />
        ))}
      </div>
    );
  };

  const renderPreferitiContent = () => {
    if (preferiti.length === 0) {
      return renderEmptyPreferiti();
    }

    const sortedPreferiti = sortItems(preferiti);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[101rem]:grid-cols-5 gap-4 w-full">
        {sortedPreferiti.map((f) => (
          <FormularioCard formulario={f} key={f.id} userId={userId} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
        {/* Title & Mobile-only Sort Group */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center shrink-0">
            La tua raccolta
          </h2>

          {/* Sort Selector ONLY on Mobile/Tablet (hidden on Desktop lg) */}
          <SortSelector
            value={activeOrder}
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
            value={activeOrder}
            onChange={handleOrderChange}
            className="h-8 px-3 w-auto hidden lg:inline-flex"
          />

          {/* Separator between Order and View Selector (or Tab Selector if View is hidden) */}
          <div className="h-5 w-px bg-border hidden lg:block shrink-0" />

          {/* View Selector: Grid / List (Only visible on "formulari" tab, hidden on mobile) */}
          {activeTab === "formulari" && (
            <Tabs
              value={activeView}
              onValueChange={handleViewChange}
              className="shrink-0 hidden sm:inline-block"
            >
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

          {/* Tab Selector: Formulari / Preferiti (Controlled by URL search param) */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full lg:w-auto"
          >
            <TabsList variant="line" className="w-full lg:w-fit">
              <TabsTrigger
                value="formulari"
                className="gap-2 px-3 flex-1 lg:flex-initial"
              >
                <FileText className="h-4 w-4" />
                <span>Formulari</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {formatNumber(formulari.length)}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="preferiti"
                className="gap-2 px-3 flex-1 lg:flex-initial"
              >
                <Star className="h-4 w-4" />
                <span>Preferiti</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {formatNumber(preferiti.length)}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Render selected Content */}
      <div className="flex flex-col gap-4 w-full mt-2 flex-1">
        {activeTab === "formulari"
          ? renderFormulariContent()
          : renderPreferitiContent()}
      </div>
    </div>
  );
}
