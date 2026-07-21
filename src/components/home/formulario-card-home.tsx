"use client";

import { Card } from "@/src/components/ui/card";
import { cn, formatNumber } from "@/src/lib/utils";
import {
  BookOpen,
  Calendar,
  Eye,
  GlobeIcon,
  LinkIcon,
  LockIcon,
  Star
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { StarFormulario } from "../shared/star-formulario";

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
};

export function FormularioCardHome({
  formulario,
  variant = "grid",
  userId,
}: Readonly<{ formulario: Formulario; variant?: "grid" | "list"; userId?: string }>) {
  return (
    <Card className="relative w-full overflow-hidden hover:bg-accent/50 transition-colors duration-200 cursor-pointer py-3 gap-0">
      <Link href={`/formulario/${formulario.id}`} className="absolute inset-0 z-0" />

      <div className={cn(
        "relative z-10 pointer-events-none flex justify-between gap-4 px-4 min-w-0 w-full",
        variant === "grid" ? "items-start" : "items-center"
      )}>
        <div className={cn(
          "flex gap-2 flex-1 min-w-0",
          variant === "list" ? "flex-row items-center gap-4" : "flex-col"
        )}>
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm sm:text-base tracking-tight text-foreground truncate">
              {formulario.titolo}
            </span>
            <div className="text-muted-foreground shrink-0">
              <VisibilityIcon visibility={formulario.visibility} />
            </div>
          </div>


          <div className="flex items-center gap-3 text-muted-foreground min-w-0">
            <span className="flex gap-1.5 items-center min-w-0">
              <Avatar className="h-5 w-5 shrink-0" size="sm">
                {formulario.photoURL && (
                  <AvatarImage src={formulario.photoURL} alt="foto profilo" />
                )}
                <AvatarFallback className="text-[10px]">
                  {formulario.nomeAutore?.substring(0, 1).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-20 sm:max-w-30">{formulario.nomeAutore}</span>
            </span>

            <Separator className="h-3 shrink-0" orientation="vertical" />

            <span className="flex gap-1 items-center shrink-0">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(formulario.dataCreazione ?? "").getFullYear()}
              </span>
            </span>

            {formulario.visibility > 0 && (
              <>
                <Separator className="h-3 shrink-0" orientation="vertical" />
                <span className="flex gap-1 items-center shrink-0">
                  <Star className="h-3.5 w-3.5" />
                  <span>{formatNumber(formulario.likes)}</span>
                </span>
              </>
            )}

            {formulario.visibility === 2 && (
              <>
                <Separator className="h-3 shrink-0" orientation="vertical" />
                <span className="flex gap-1 items-center shrink-0">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{formatNumber(formulario.views)}</span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className={cn(
          "pointer-events-auto shrink-0 relative z-20",
          variant === "grid" && "-mt-1"
        )}>
          {userId && (
            <StarFormulario
              formularioId={formulario.id}
              isStarred={formulario.starred}
            />
          )}
        </div>
      </div>
    </Card>
  );
}

const VisibilityIcon = ({ visibility }: { visibility: 0 | 1 | 2 }) => {
  if (visibility === 0) return <LockIcon size={16} />;
  if (visibility === 1) return <LinkIcon size={16} />;
  return <GlobeIcon size={16} />;
};
