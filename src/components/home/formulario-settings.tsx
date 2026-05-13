"use client"

import { cn, formatNumber } from "@/src/lib/utils";
import { Calendar, Download, Eye, GlobeIcon, Info, LinkIcon, LockIcon, Pencil, QrCode, Settings, Star, Trash2, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NavigationBlocker } from "../navigation/navigation-blocker";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Kbd, KbdGroup } from "../ui/kbd";
import { Qr } from "../ui/qr";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { EditSection } from "./settings-sections/edit-section";
import { StarFormulario } from "./star-formulario";
import { TakeFormulario } from "./take-formulario";

type Formulario = {
    titolo: string
    descrizione: string
    nomeAutore: string
    dataCreazione: string
    visibility: 0 | 1 | 2
    views: number
    likes: number
    starred: boolean
    editable: boolean
}

export function FormularioSettings({ formularioId }: Readonly<{ formularioId: string }>) {
    const router = useRouter();
    const [formulario, setFormulario] = useState<Formulario>();
    const [open, setOpen] = useState(false)
    const [edited, setEdited] = useState(false)
    const [activeSection, setActiveSection] = useState<"info" | "edit" | "qr">()

    const SHARE_URL = `${process.env.NEXT_PUBLIC_APP_URL}/formulario/${formularioId}`;

    async function fetchFormulario() {
        const response = await fetch(`/api/formulari/${formularioId}`);

        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error);
        }

        const data = await response.json();
        setFormulario(data);
        setEdited(false);
        setActiveSection(data.editable ? "edit" : "info")
    }

    useEffect(() => {
        fetchFormulario()

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "I" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)

    }, []);

    async function handleDelete() {

        toast.promise(
            fetch("/api/formulari/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formularioId: formularioId }),
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.push("/home")
            }),
            {
                loading: "Eliminazione in corso...",
                success: "Formulario cancellato con successo!",
                error: "Errore durante la cancellazione del formulario.",
                position: "bottom-center",
            },
        );

    }

    return (
        <div className="flex gap-2 items-center">
            <NavigationBlocker blocked={edited} />
            <Dialog open={open} onOpenChange={setOpen}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="relative">
                                    <Settings size={16} />
                                    {edited && (
                                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full">
                                            <span className="relative flex size-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                                            </span>
                                        </div>
                                    )}
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent className="pr-1.5">
                            <div className="flex items-center gap-2">
                                Impostazioni formulario
                                <KbdGroup className="hidden md:flex">
                                    <Kbd>Ctrl</Kbd>
                                    <span>+</span>
                                    <Kbd>Shift</Kbd>
                                    <span>+</span>
                                    <Kbd>I</Kbd>
                                </KbdGroup>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DialogContent className="h-[80vh] flex flex-col p-0 gap-0 md:max-w-4xl" showCloseButton={false}>
                    {formulario ? (
                        <>
                            <DialogHeader className="px-6 py-4 border-b shrink-0">
                                <DialogTitle>
                                    <div className="flex gap-2 items-center">
                                        {formulario.titolo}
                                        <div className="text-muted-foreground">
                                            <VisibilityIcon visibility={formulario.visibility} />
                                        </div>
                                        <StarFormulario formularioId={formularioId} isStarred={formulario.starred} />
                                    </div>
                                </DialogTitle>
                                <DialogDescription asChild>
                                    <div className="flex h-5 gap-4 text-sm text-muted-foreground min-w-0">
                                        <span className="flex gap-1 items-center min-w-0 overflow-hidden">
                                            <UserRound size={16} />
                                            <span className="truncate">{formulario.nomeAutore}</span>
                                        </span>
                                        <Separator orientation="vertical" />
                                        <span className="flex gap-1 items-center shrink-0">
                                            <Calendar size={16} />
                                            <span>{new Date(formulario.dataCreazione).getFullYear()}</span>
                                        </span>
                                        {formulario.visibility > 0 && (
                                            <>
                                                <Separator orientation="vertical" />
                                                <span className="flex gap-1 items-center shrink-0">
                                                    <Star size={16} />
                                                    <span>{formatNumber(formulario.likes)}</span>
                                                </span>
                                            </>
                                        )}
                                        {formulario.visibility === 2 && (
                                            <>
                                                <Separator orientation="vertical" />
                                                <span className="flex gap-1 items-center shrink-0">
                                                    <Eye size={16} />
                                                    <span>{formatNumber(formulario.views)}</span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-1 min-h-0">
                                {/* Sidebar */}
                                <div className="md:w-56 shrink-0 border-r flex flex-col">
                                    <nav className="flex flex-col gap-1 p-2">
                                        {formulario.editable ? (
                                            <button
                                                onClick={() => setActiveSection("edit")}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
                                                    activeSection === "edit"
                                                        ? "bg-accent text-accent-foreground font-medium"
                                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                                )}
                                            >
                                                <Pencil size={15} />
                                                <span className="hidden md:flex">Modifica</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setActiveSection("info")}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
                                                    activeSection === "info"
                                                        ? "bg-accent text-accent-foreground font-medium"
                                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                                )}
                                            >
                                                <Info size={15} />
                                                <span className="hidden md:flex">Informazioni</span>
                                            </button>
                                        )}
                                        {formulario.visibility !== 0 && (
                                            <button
                                                onClick={() => setActiveSection("qr")}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
                                                    activeSection === "qr"
                                                        ? "bg-accent text-accent-foreground font-medium"
                                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                                )}
                                            >
                                                <QrCode size={15} />
                                                <span className="hidden md:flex">Condividi</span>
                                            </button>
                                        )}
                                        <button
                                            disabled
                                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left text-muted-foreground/50 cursor-not-allowed"
                                        >
                                            <Download size={15} />
                                            <span className="hidden md:flex">Esporta</span>
                                            <span className="hidden md:flex ml-auto text-xs border border-border rounded-full px-2 py-0.5 bg-secondary">
                                                Soon
                                            </span>
                                        </button>
                                    </nav>
                                </div>

                                {/* Content */}
                                <ScrollArea className="flex-1 min-w-0">
                                    <div className="p-6">

                                        {activeSection === "info" && (
                                            <div className="flex flex-col gap-6">
                                                <div>
                                                    <h3 className="text-sm font-medium mb-1">Descrizione</h3>
                                                    {formulario.descrizione == '' ? (
                                                        <p className="text-sm text-muted-foreground">Nessuna descrizione</p>
                                                    ) : (
                                                        <p className="line-clamp-3">{formulario.descrizione}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeSection === "edit" && formulario.editable && (
                                            <EditSection
                                                formularioId={formularioId}
                                                formulario={formulario}
                                                setFormulario={setFormulario}
                                                edited={edited}
                                                setEdited={setEdited}
                                            />
                                        )}

                                        {(activeSection === "qr" && formulario.visibility !== 0) && (
                                            <div>
                                                <Qr link={SHARE_URL} title={formulario.titolo} />
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>

                            <div className="flex px-6 py-4 border-t shrink-0 justify-end gap-2">
                                <DialogClose asChild>
                                    <Button variant="outline"><X size={16} />Chiudi</Button>
                                </DialogClose>
                                {formulario.editable ? formularioId != process.env.NEXT_PUBLIC_FORMULARIO_BENVENUTO_ID && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive"><Trash2 size={16} />Elimina formulario</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Elimina</DialogTitle>
                                            </DialogHeader>
                                            <DialogDescription>
                                                Sei sicuro di voler eliminare "{formulario.titolo}"? Questa azione non è reversibile.
                                            </DialogDescription>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Chiudi</Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button variant="destructive" onClick={handleDelete}>Elimina</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <TakeFormulario formularioId={formularioId} />
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <DialogHeader className="px-6 py-4 border-b shrink-0">
                                <DialogTitle>
                                    Caricamento in corso
                                </DialogTitle>
                                <DialogDescription>
                                    Caricamento del formulario in corso, attendere prego.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 flex items-center justify-center">
                                <Spinner />
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

const VisibilityIcon = ({ visibility }: { visibility: 0 | 1 | 2 }) => {
    if (visibility === 0) return <LockIcon size={16} />
    if (visibility === 1) return <LinkIcon size={16} />
    return <GlobeIcon size={16} />
}