"use client";

import { SaveAll } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Field, FieldGroup } from "../../ui/field";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";

type Formulario = {
    titolo: string
    descrizione: string
    nomeAutore: string
    anno: string
    visibility: 0 | 1 | 2
    views: number
    likes: number
    starred: boolean
    editable: boolean
}

export function EditSection(
    { formularioId, formulario, setFormulario, edited, setEdited }:
        Readonly<{
            formularioId: string;
            formulario: Formulario;
            setFormulario: (formulario: Formulario) => void;
            edited: boolean;
            setEdited: (edited: boolean) => void
        }>) {
    const router = useRouter();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        formData.append("formularioId", formularioId);

        toast.promise(
            fetch("/api/formulari/update", {
                method: "PUT",
                body: formData,
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.refresh();
                setEdited(false);
            }),
            {
                loading: "Modifica in corso...",
                success: "Formulario modificato con successo!",
                error: "Errore durante la modifica del formulario.",
                position: "bottom-center",
            },
        );

    }

    return (
        <div className="flex flex-col gap-6">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <FieldGroup>
                    <Field>
                        <Label htmlFor="titolo-1">Titolo del formulario</Label>
                        <Input
                            id="titolo-1"
                            name="titolo"
                            value={formulario.titolo}
                            onInput={(e) => { setFormulario({ ...formulario, titolo: (e.target as HTMLInputElement).value }); setEdited(true) }}
                            maxLength={30}
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="descrizione-1">Descrizione del formulario</Label>
                        <Textarea
                            id="descrizione-1"
                            name="descrizione"
                            value={formulario.descrizione}
                            onInput={(e) => { setFormulario({ ...formulario, descrizione: (e.target as HTMLTextAreaElement).value }); setEdited(true) }}
                            maxLength={200}
                        />
                    </Field>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="visibility-1">Condividi con link</Label>
                            <Switch
                                id="visibility-1"
                                checked={formulario.visibility >= 1}
                                onCheckedChange={(checked) => {
                                    setFormulario({ ...formulario, visibility: checked ? 1 : 0 });
                                    setEdited(true)
                                }}
                            />
                        </div>
                        {formulario.visibility >= 1 && (
                            <div className="flex items-center justify-between">
                                <Label htmlFor="visibility-2">Condividi con la community</Label>
                                <Switch
                                    id="visibility-2"
                                    checked={formulario.visibility === 2}
                                    onCheckedChange={(checked) => {
                                        setFormulario({ ...formulario, visibility: checked ? 2 : 1 });
                                        setEdited(true)
                                    }}
                                />
                            </div>
                        )}
                        <input type="hidden" name="visibility" value={formulario.visibility} />
                    </div>
                </FieldGroup>
                <Button type="submit" variant={edited ? "default" : "secondary"} disabled={!edited}>
                    <SaveAll size={16} /> Salva le modifiche
                </Button>
            </form>
        </div>
    );
}