import { Formulario } from "./types";

export function InfoSection({
  formulario,
}: Readonly<{ formulario: Formulario }>) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-medium mb-1">Descrizione</h3>
        {formulario.descrizione == "" ? (
          <p className="text-sm text-muted-foreground">Nessuna descrizione</p>
        ) : (
          <p className="line-clamp-3">{formulario.descrizione}</p>
        )}
      </div>
    </div>
  );
}
