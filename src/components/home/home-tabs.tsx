"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  FileText,
  Star,
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
import { formatNumber } from "@/src/lib/utils";
import { SortSelector, SortOption } from "../shared/sort-selector";
import { useDebouncedCallback } from "use-debounce";
import { FormularioCard } from "./formulario-card";
import { Categoria } from "@/src/lib/categorie";
import { CategoriaTag } from "../categorie/categoria-tag";
import { toast } from "sonner";

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
  categoriaId?: number | null;
}

interface HomeTabsProps {
  initialTab: string; // Synced with server cookie
  initialOrder: SortOption; // Synced with server cookie
  formulari: Formulario[];
  preferiti: Formulario[];
  categorie: Categoria[];
  userId: string;
}

export function HomeTabs({
  initialTab,
  initialOrder,
  formulari,
  preferiti,
  categorie: initialCategorie,
  userId,
}: Readonly<HomeTabsProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize state directly from server cookies to prevent any hydration flash/glitch
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  // Shared by all cards, so a category created from one card shows up in the others
  const [categorie, setCategorie] = useState<Categoria[]>(initialCategorie);

  // Optimistic category changes made from the cards. Reset whenever the server
  // sends fresh data (router.refresh), which then already contains them.
  const [assigned, setAssigned] = useState<Record<string, number | null>>({});
  const [assignedFor, setAssignedFor] = useState(formulari);
  if (assignedFor !== formulari) {
    setAssignedFor(formulari);
    setAssigned({});
  }

  const getCategoriaId = (f: Formulario) =>
    f.id in assigned ? assigned[f.id] : (f.categoriaId ?? null);

  const handleCategoriaChange = async (
    f: Formulario,
    categoriaId: number | null,
  ) => {
    const previous = getCategoriaId(f);
    if (previous === categoriaId) return;
    setAssigned((prev) => ({ ...prev, [f.id]: categoriaId }));
    try {
      const res = await fetch("/api/formulari/categoria", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formularioId: f.id, categoriaId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Errore durante il cambio categoria.");
      }
    } catch (error) {
      setAssigned((prev) => ({ ...prev, [f.id]: previous }));
      toast.error((error as Error).message, { position: "bottom-center" });
    }
  };
  const [activeOrder, setActiveOrder] = useState<SortOption>(initialOrder);

  const [searchVal, setSearchVal] = useState(searchParams.get("q") ?? "");

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    // Persist last selected tab for next visits
    document.cookie = `home-tab=${tabValue}; path=/; max-age=31536000; SameSite=Lax`;
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

    const renderGrid = (items: Formulario[]) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[101rem]:grid-cols-5 gap-4 w-full">
        {items.map((f) => (
          <FormularioCard
            formulario={f}
            key={f.id}
            userId={userId}
            categoria={{
              categorie,
              onCategorieChange: setCategorie,
              categoriaId: getCategoriaId(f),
              onCategoriaChange: (id) => handleCategoriaChange(f, id),
            }}
          />
        ))}
      </div>
    );

    // Groups: "no category" first, then categories in the user's order
    // (sort_order from the db). Unknown ids fall back to "no category".
    const known = new Set(categorie.map((c) => c.id));
    const senza = sortedFormulari.filter((f) => {
      const id = getCategoriaId(f);
      return id === null || !known.has(id);
    });
    const gruppi = categorie
      .map((c) => ({
        categoria: c,
        items: sortedFormulari.filter((f) => getCategoriaId(f) === c.id),
      }))
      .filter((g) => g.items.length > 0);

    // Nothing categorized yet: plain grid, no headers
    if (gruppi.length === 0) return renderGrid(sortedFormulari);

    return (
      <div className="flex flex-col gap-8 w-full">
        {senza.length > 0 && (
          <section className="flex flex-col gap-3">
            <GroupHeader count={senza.length}>
              <span className="text-sm font-medium text-muted-foreground">
                Nessuna categoria
              </span>
            </GroupHeader>
            {renderGrid(senza)}
          </section>
        )}
        {gruppi.map(({ categoria, items }) => (
          <section key={categoria.id} className="flex flex-col gap-3">
            <GroupHeader count={items.length}>
              <CategoriaTag
                nome={categoria.nome}
                colore={categoria.colore}
                className="text-base"
              />
            </GroupHeader>
            {renderGrid(items)}
          </section>
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

          {/* Separator between Order and Tab Selector */}
          <div className="h-5 w-px bg-border hidden lg:block shrink-0" />

          {/* Tab Selector: Formulari / Preferiti (persisted via cookie) */}
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

function GroupHeader({
  count,
  children,
}: Readonly<{ count: number; children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-3">
      {children}
      <Badge variant="secondary" className="h-5 px-1.5">
        {formatNumber(count)}
      </Badge>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
