"use client";

import { Card } from "@/src/components/ui/card";
import { Categoria } from "@/src/lib/categorie";
import { formatNumber } from "@/src/lib/utils";
import {
  ChevronDown,
  Clock,
  Eye,
  GlobeIcon,
  Hash,
  LinkIcon,
  LockIcon,
  Star,
} from "lucide-react";
import Link from "next/link";
import { CategoriaPicker } from "../categorie/categoria-combo";
import { CategoriaTag } from "../categorie/categoria-tag";
import { StarFormulario } from "../shared/star-formulario";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

type Formulario = {
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
};

const VISIBILITY = {
  0: { icon: LockIcon, label: "Privato" },
  1: { icon: LinkIcon, label: "Con link" },
  2: { icon: GlobeIcon, label: "Pubblico" },
} as const;

/** Category picker data: only for the owner's own formulari ("La tua raccolta") */
export type CardCategoria = {
  categorie: Categoria[];
  onCategorieChange: (categorie: Categoria[]) => void;
  categoriaId: number | null;
  onCategoriaChange: (categoriaId: number | null) => void;
};

/** Formulario card used in the collection, favorites and community grids */
export function FormularioCard({
  formulario,
  userId,
  categoria: categoriaProps,
}: Readonly<{
  formulario: Formulario;
  userId?: string;
  categoria?: CardCategoria;
}>) {
  const visibility = VISIBILITY[formulario.visibility] ?? VISIBILITY[0];
  const VisibilityIcon = visibility.icon;
  const modificato = formatRelative(formulario.dataModifica);

  return (
    <Card className="relative h-full w-full gap-0 py-0 transition-[box-shadow,background-color] duration-200 hover:bg-accent/40 hover:shadow-md hover:ring-foreground/20 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring">
      {/* Whole card is the link; interactive bits sit above it */}
      <Link
        href={`/formulario/${formulario.id}`}
        aria-label={`Apri ${formulario.titolo}`}
        className="absolute inset-0 z-0 outline-none"
      />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-3 p-4 pb-3">
        {/* Title + star */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2 pt-1">
            <span
              title={visibility.label}
              className="flex h-[1.375rem] shrink-0 items-center text-muted-foreground"
            >
              <VisibilityIcon
                className="size-4"
                aria-label={visibility.label}
              />
            </span>
            <h3 className="line-clamp-2 min-w-0 text-base font-semibold leading-snug tracking-tight text-foreground">
              {formulario.titolo}
            </h3>
          </div>
          {userId && (
            <div className="pointer-events-auto relative z-20 -mr-2 -mt-0.5 shrink-0">
              <StarFormulario
                formularioId={formulario.id}
                isStarred={formulario.starred}
              />
            </div>
          )}
        </div>

        {/* Category + last edit */}
        <div className="flex min-w-0 items-center justify-between gap-2 text-xs text-muted-foreground">
          {categoriaProps && <CategoriaButton {...categoriaProps} />}

          {modificato && (
            <span
              className="flex min-w-0 items-center gap-1"
              title={new Date(formulario.dataModifica ?? "").toLocaleString(
                "it-IT",
              )}
              suppressHydrationWarning
            >
              <Clock className="size-3.5 shrink-0" />
              <span className="truncate" suppressHydrationWarning>
                {modificato}
              </span>
            </span>
          )}
        </div>

        {/* Description: fixed two lines so cards in a row line up */}
        <p className="line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-muted-foreground">
          {formulario.descrizione?.trim() || (
            <span className="italic opacity-60">Nessuna descrizione</span>
          )}
        </p>
      </div>

      <Separator className="pointer-events-none relative z-10" />

      {/* Author + stats */}
      <div className="pointer-events-none relative z-10 flex min-w-0 items-center justify-between gap-3 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5">
          <Avatar className="size-5 shrink-0" size="sm">
            {formulario.photoURL && (
              <AvatarImage src={formulario.photoURL} alt="" />
            )}
            <AvatarFallback className="text-[10px]">
              {formulario.nomeAutore?.substring(0, 1).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{formulario.nomeAutore}</span>
        </span>

        {formulario.visibility > 0 && (
          <span className="flex shrink-0 items-center gap-3 tabular-nums">
            <span className="flex items-center gap-1" title="Preferiti">
              <Star className="size-3.5" />
              {formatNumber(formulario.likes)}
            </span>
            {formulario.visibility === 2 && (
              <span className="flex items-center gap-1" title="Visualizzazioni">
                <Eye className="size-3.5" />
                {formatNumber(formulario.views)}
              </span>
            )}
          </span>
        )}
      </div>
    </Card>
  );
}

function CategoriaButton({
  categorie,
  onCategorieChange,
  categoriaId,
  onCategoriaChange,
}: Readonly<CardCategoria>) {
  const categoria = categorie.find((c) => c.id === categoriaId);

  return (
    <CategoriaPicker
      categorie={categorie}
      onCategorieChange={onCategorieChange}
      value={categoriaId}
      onChange={onCategoriaChange}
    >
      <button
        type="button"
        title={categoria ? "Cambia categoria" : "Assegna una categoria"}
        aria-label={
          categoria
            ? `Categoria ${categoria.nome}, cambia`
            : "Assegna una categoria"
        }
        className="group/tag pointer-events-auto relative z-20 flex min-w-0 max-w-[55%] shrink items-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {categoria ? (
          <CategoriaTag
            nome={categoria.nome}
            colore={categoria.colore}
            variant="pill"
          />
        ) : (
          <span className="inline-flex h-6 items-center gap-1 rounded-full border border-dashed px-2.5 font-medium text-muted-foreground transition-colors group-hover/tag:border-foreground/30 group-hover/tag:text-foreground">
            <Hash
              aria-hidden
              strokeWidth={2.5}
              className="size-3 shrink-0 opacity-50"
            />
            Tag
            <ChevronDown className="size-3 opacity-60" />
          </span>
        )}
      </button>
    </CategoriaPicker>
  );
}

const rtf = new Intl.RelativeTimeFormat("it", { numeric: "auto" });

/** "oggi", "ieri", "3 giorni fa", "2 mesi fa"... */
function formatRelative(date?: string) {
  if (!date) return null;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return null;

  const seconds = Math.round((time - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "Modificato ora";

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const [unit, size] =
    units.find(([, s]) => abs >= s) ?? units[units.length - 1];
  return `Modificato ${rtf.format(Math.round(seconds / size), unit)}`;
}
