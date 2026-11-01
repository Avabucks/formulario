"use client";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Spinner } from "@/src/components/ui/spinner";
import { Skeleton } from "@/src/components/ui/skeleton";
import { isUploadableImage, uploadImage } from "@/src/lib/editor/image-upload";
import {
  Calendar,
  HardDrive,
  ImageIcon,
  Link2,
  Link2Off,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type UploadedImage = {
  key: string;
  url: string;
  size: number;
  createdAt: string;
  inUse: boolean;
};

type Filter = "all" | "unused";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Editor picker: clicking an image hands it back and closes the dialog */
export function ImageManager({
  open,
  setOpen,
  onPick,
  argomentoId,
}: Readonly<{
  open: boolean;
  setOpen: (value: boolean) => void;
  onPick: (image: UploadedImage) => void;
  /** Links images uploaded from the dialog to this note */
  argomentoId?: string;
}>) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gestore immagini</DialogTitle>
          <DialogDescription>
            Clicca un&apos;immagine per inserirla nella nota, oppure caricane
            una nuova.
          </DialogDescription>
        </DialogHeader>
        <ImageLibrary
          argomentoId={argomentoId}
          scrollClassName="max-h-[60vh]"
          onPick={(image) => {
            onPick(image);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

/** User's uploaded images: usage, upload (button, drop, paste), delete */
export function ImageLibrary({
  onPick,
  argomentoId,
  scrollClassName,
}: Readonly<{
  /** Picker mode: clicking an image selects it */
  onPick?: (image: UploadedImage) => void;
  argomentoId?: string;
  /** Wraps the grid in a scroll area with this class (e.g. a max height) */
  scrollClassName?: string;
}>) {
  const [images, setImages] = useState<UploadedImage[] | null>(null);
  const [used, setUsed] = useState(0);
  const [max, setMax] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/uploads");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Errore nel caricamento");
      setError(null);
      setImages(data.images);
      setUsed(data.used);
      setMax(data.max);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore nel caricamento");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (files: File[]) => {
    const valid = files.filter(isUploadableImage);
    if (valid.length < files.length)
      toast.error("Formato non supportato (usa PNG, JPG, WebP o GIF)", {
        position: "bottom-center",
      });
    if (valid.length === 0) return;

    setFilter("all");
    setUploading((n) => n + valid.length);
    const results = await Promise.allSettled(
      valid.map((file) =>
        uploadImage(file, argomentoId).finally(() =>
          setUploading((n) => n - 1),
        ),
      ),
    );
    const failed = results.find((r) => r.status === "rejected");
    if (failed)
      toast.error(
        failed.reason instanceof Error
          ? failed.reason.message
          : "Errore nel caricamento",
        { position: "bottom-center" },
      );
    if (results.some((r) => r.status === "fulfilled")) await load();
  };

  const imageFiles = (data: DataTransfer | null) =>
    Array.from(data?.files ?? []).filter((f) => f.type.startsWith("image/"));

  const handleUploadRef = useRef(handleUpload);
  useEffect(() => {
    handleUploadRef.current = handleUpload;
  });

  // Paste anywhere while the library is on screen, unless typing in a field
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      const files = imageFiles(e.clipboardData);
      if (files.length === 0) return;
      e.preventDefault();
      handleUploadRef.current(files);
    };
    globalThis.addEventListener("paste", handlePaste);
    return () => globalThis.removeEventListener("paste", handlePaste);
  }, []);

  const handleDelete = async (image: UploadedImage) => {
    if (confirmKey !== image.key) {
      setConfirmKey(image.key);
      return;
    }
    setDeletingKey(image.key);
    try {
      const res = await fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: image.key }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Errore nell'eliminazione");
      setImages((prev) => prev?.filter((i) => i.key !== image.key) ?? null);
      setUsed((prev) => prev - image.size);
      toast.success("Immagine eliminata", { position: "bottom-center" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore nell'eliminazione", {
        position: "bottom-center",
      });
    } finally {
      setDeletingKey(null);
      setConfirmKey(null);
    }
  };

  const unusedCount = images?.filter((i) => !i.inUse).length ?? 0;
  const visible =
    filter === "unused" ? images?.filter((i) => !i.inUse) : images;
  const usagePercent = max ? Math.min(100, (used / max) * 100) : 0;

  return (
    <div
      className="relative flex flex-col gap-4"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleUpload(imageFiles(e.dataTransfer));
      }}
    >
      {dragging && (
        <div className="absolute -inset-2 z-50 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary bg-background/90 text-sm font-medium pointer-events-none">
          <Upload className="h-6 w-6 text-primary" />
          Rilascia per caricare
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => {
          handleUpload(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {images && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>
                {formatBytes(used)} di {formatBytes(max)} usati
              </span>
              <span>
                {images.length} {images.length === 1 ? "immagine" : "immagini"}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent > 90 ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={filter === "all" ? "secondary" : "ghost"}
              onClick={() => setFilter("all")}
            >
              Tutte
            </Button>
            <Button
              size="sm"
              variant={filter === "unused" ? "secondary" : "ghost"}
              onClick={() => setFilter("unused")}
            >
              Non usate ({unusedCount})
            </Button>
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading > 0 ? <Spinner /> : <Upload />}
              Carica
            </Button>
          </div>
        </div>
      )}

      <Scroll className={scrollClassName}>
        {error && (
          <p className="text-sm text-destructive py-8 text-center">{error}</p>
        )}
        {!images && !error && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}
        {visible?.length === 0 && uploading === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImageIcon />
              </EmptyMedia>
              <EmptyTitle>
                {filter === "unused"
                  ? "Nessuna immagine inutilizzata"
                  : "Nessuna immagine"}
              </EmptyTitle>
              <EmptyDescription>
                {filter === "unused"
                  ? "Tutte le tue immagini sono usate in qualche nota."
                  : "Carica un'immagine o trascinala qui."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {visible && (visible.length > 0 || uploading > 0) && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3 pb-1">
            {Array.from({ length: uploading }, (_, i) => (
              <div
                key={`uploading-${i}`}
                className="flex flex-col rounded-lg border border-border overflow-hidden"
              >
                <Skeleton className="aspect-square rounded-none flex items-center justify-center">
                  <Spinner />
                </Skeleton>
                <div className="p-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Caricamento…</p>
                  <p className="text-[11px]">&nbsp;</p>
                </div>
              </div>
            ))}
            {visible.map((image) => {
              const confirming = confirmKey === image.key;
              return (
                <div
                  key={image.key}
                  className="group flex flex-col rounded-lg border border-border overflow-hidden bg-card"
                >
                  {onPick ? (
                    <button
                      type="button"
                      onClick={() => onPick(image)}
                      className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden cursor-pointer outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      aria-label="Inserisci immagine"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- R2 images, no Next optimizer */}
                      <img
                        src={image.url}
                        alt=""
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  ) : (
                    <div className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element -- R2 images, no Next optimizer */}
                      <img
                        src={image.url}
                        alt=""
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-1 py-1 pl-2 pr-1 border-t border-border">
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5 text-[11px] text-muted-foreground tabular-nums whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1">
                          <HardDrive />
                          {formatBytes(image.size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar />
                          {new Date(image.createdAt).toLocaleDateString(
                            "it-IT",
                          )}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        {image.inUse ? (
                          <>
                            <Link2 />
                            Usata
                          </>
                        ) : (
                          <>
                            <Link2Off />
                            Non usata
                          </>
                        )}
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-7 w-7 shrink-0 ${confirming ? "bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive" : "text-muted-foreground hover:text-destructive"}`}
                      aria-label={
                        confirming ? "Conferma eliminazione" : "Elimina"
                      }
                      title={
                        confirming
                          ? image.inUse
                            ? "Usata in una nota: clicca di nuovo per eliminare"
                            : "Clicca di nuovo per eliminare"
                          : "Elimina"
                      }
                      disabled={deletingKey === image.key}
                      onClick={() => handleDelete(image)}
                      onBlur={() => confirming && setConfirmKey(null)}
                    >
                      {deletingKey === image.key ? (
                        <Spinner className="size-3.5" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Scroll>
    </div>
  );
}

function Scroll({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  if (!className) return <div>{children}</div>;
  return (
    <ScrollArea className={`-mx-2 px-2 ${className}`}>{children}</ScrollArea>
  );
}
