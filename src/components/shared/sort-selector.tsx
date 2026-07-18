"use client";

import * as React from "react";
import { Clock, Calendar, ArrowDownAZ, Eye, Star } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

export type SortOption = "modificato" | "creato" | "titolo" | "views" | "popolari";

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  align?: "start" | "end" | "center";
  className?: string;
}

export const sortLabels: Record<
  SortOption,
  { label: string; icon: React.ReactNode }
> = {
  modificato: {
    label: "Modificato di recente",
    icon: <Clock className="h-4 w-4" />,
  },
  creato: {
    label: "Creato di recente",
    icon: <Calendar className="h-4 w-4" />,
  },
  titolo: {
    label: "Titolo (A-Z)",
    icon: <ArrowDownAZ className="h-4 w-4" />,
  },
  views: {
    label: "Più visualizzati",
    icon: <Eye className="h-4 w-4" />,
  },
  popolari: {
    label: "Più popolari",
    icon: <Star className="h-4 w-4" />,
  },
};

export function SortSelector({
  value,
  onChange,
  align = "end",
  className,
}: SortSelectorProps) {
  const current = value || "modificato";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className || ""}`}>
          {sortLabels[current]?.icon || <Clock className="h-4 w-4" />}
          <span>{sortLabels[current]?.label || "Modificato di recente"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-52">
        {(Object.keys(sortLabels) as SortOption[]).map((key) => (
          <DropdownMenuItem key={key} onClick={() => onChange(key)}>
            <span className="mr-2 shrink-0">{sortLabels[key].icon}</span>
            {sortLabels[key].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
