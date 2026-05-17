"use client"

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NavigationBlocker } from "../navigation/navigation-blocker";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Kbd, KbdGroup } from "../ui/kbd";
import { ScrollArea } from "../ui/scroll-area";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { EditSection } from "./settings-sections/edit-section";
import { FormularioStructureSection } from "./settings-sections/formulario-structure-section";
import { InfoSection } from "./settings-sections/info-section";
import { SettingsFooter } from "./settings-sections/settings-footer";
import { SettingsHeader } from "./settings-sections/settings-header";
import { SettingsSidebar } from "./settings-sections/settings-sidebar";
import { ShareSection } from "./settings-sections/share-section";
import { Formulario, FormularioStructure, SettingsSection } from "./settings-sections/types";

export function FormularioSettings({ formularioId }: Readonly<{ formularioId: string }>) {
    const router = useRouter();
    const [formulario, setFormulario] = useState<Formulario>();
    const [structure, setStructure] = useState<FormularioStructure>();
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [open, setOpen] = useState(false)
    const [edited, setEdited] = useState(false)
    const [activeSection, setActiveSection] = useState<SettingsSection>()

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/formulario/${formularioId}`;

    useEffect(() => {
        let ignore = false;

        Promise.resolve()
            .then(() => {
                if (ignore) return undefined;

                setLoading(true);
                setLoadError(false);

                return Promise.all([
                    fetchJson<Formulario>(`/api/formulari/${formularioId}`),
                    fetchJson<FormularioStructure>(`/api/formulari/${formularioId}/structure`),
                ]);
            })
            .then((result) => {
                if (ignore || !result) return;

                const [formularioData, structureData] = result;

                setFormulario(formularioData);
                setStructure(structureData);
                setEdited(false);
                setActiveSection(formularioData.editable ? "edit" : "info");
            })
            .catch(() => {
                if (!ignore) {
                    setLoadError(true);
                    toast.error("Errore durante il caricamento del formulario.", { position: "bottom-center" });
                }
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "I" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => {
            ignore = true;
            document.removeEventListener("keydown", handleKeyDown);
        }

    }, [formularioId]);

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

    const dialogContent = () => {
        if (loading) return <SettingsLoading />;
        if (loadError || !formulario || !structure) return <SettingsLoadError />;

        return (
            <>
                <SettingsHeader formulario={formulario} formularioId={formularioId} />
                <div className="flex flex-1 min-h-0">
                    <SettingsSidebar
                        activeSection={activeSection}
                        editable={formulario.editable}
                        visibility={formulario.visibility}
                        setActiveSection={setActiveSection}
                    />
                    <ScrollArea className="flex-1 min-w-0">
                        <div className="p-6">
                            {activeSection === "info" && !formulario.editable && <InfoSection formulario={formulario} />}
                            {activeSection === "edit" && formulario.editable && (
                                <EditSection
                                    formularioId={formularioId}
                                    formulario={formulario}
                                    setFormulario={setFormulario}
                                    edited={edited}
                                    setEdited={setEdited}
                                />
                            )}
                            {activeSection === "structure" && (
                                <FormularioStructureSection key={formularioId} structure={structure} />
                            )}
                            {activeSection === "qr" && formulario.visibility !== 0 && (
                                <ShareSection link={shareUrl} title={formulario.titolo} />
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <SettingsFooter formulario={formulario} formularioId={formularioId} onDelete={handleDelete} />
            </>
        );
    };

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
                                        <span className="absolute -top-0.5 -right-0.5 flex size-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                                        </span>
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
                    {dialogContent()}
                </DialogContent>
            </Dialog>
        </div>
    )
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
    }

    return response.json();
}

function SettingsLoading() {
    return (
        <>
            <DialogHeader className="px-6 py-4 border-b shrink-0">
                <DialogTitle>Caricamento in corso</DialogTitle>
                <DialogDescription>
                    Caricamento del formulario in corso, attendere prego.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-1 flex items-center justify-center">
                <Spinner />
            </div>
        </>
    );
}

function SettingsLoadError() {
    return (
        <>
            <DialogHeader className="px-6 py-4 border-b shrink-0">
                <DialogTitle>Errore di caricamento</DialogTitle>
                <DialogDescription>
                    Non è stato possibile caricare le impostazioni del formulario.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Riapri le impostazioni o aggiorna la pagina.
            </div>
        </>
    );
}
