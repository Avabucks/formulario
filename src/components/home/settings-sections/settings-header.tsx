import { formatNumber } from "@/src/lib/utils";
import {
  Calendar,
  Eye,
  GlobeIcon,
  LinkIcon,
  LockIcon,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Separator } from "../../ui/separator";
import { StarFormulario } from "../star-formulario";
import { Formulario } from "./types";

export function SettingsHeader({
  formulario,
  formularioId,
}: Readonly<{
  formulario: Formulario;
  formularioId: string;
}>) {
  return (
    <DialogHeader className="px-6 py-4 border-b shrink-0">
      <DialogTitle>
        <div className="flex gap-2 justify-between items-center">
          <div className="flex gap-2 items-center min-w-0">
            <span className="truncate">{formulario.titolo}</span>
            <div className="text-muted-foreground shrink-0">
              <VisibilityIcon visibility={formulario.visibility} />
            </div>
          </div>
          <StarFormulario
            formularioId={formularioId}
            isStarred={formulario.starred}
          />
        </div>
      </DialogTitle>
      <DialogDescription asChild>
        <div className="flex h-5 gap-4 text-sm text-muted-foreground min-w-0">
          <span className="flex flex-1 gap-2 items-center min-w-0">
            <Avatar size="sm">
              {formulario.photoURL && (
                <AvatarImage src={formulario.photoURL} alt="foto profilo" />
              )}
              <AvatarFallback>
                {formulario.nomeAutore?.substring(0, 1).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{formulario.nomeAutore}</span>
          </span>
          <SettingsMetaItem>
            <Calendar size={16} />
            <span>{new Date(formulario.dataCreazione).getFullYear()}</span>
          </SettingsMetaItem>
          {formulario.visibility > 0 && (
            <SettingsMetaItem>
              <Star size={16} />
              <span>{formatNumber(formulario.likes)}</span>
            </SettingsMetaItem>
          )}
          {formulario.visibility === 2 && (
            <SettingsMetaItem>
              <Eye size={16} />
              <span>{formatNumber(formulario.views)}</span>
            </SettingsMetaItem>
          )}
        </div>
      </DialogDescription>
    </DialogHeader>
  );
}

function SettingsMetaItem({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Separator orientation="vertical" />
      <span className="flex gap-1 items-center shrink-0">{children}</span>
    </>
  );
}

function VisibilityIcon({ visibility }: Readonly<{ visibility: 0 | 1 | 2 }>) {
  if (visibility === 0) return <LockIcon size={16} />;
  if (visibility === 1) return <LinkIcon size={16} />;
  return <GlobeIcon size={16} />;
}
