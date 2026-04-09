"use client";
import { AlertTriangle, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { NavigationBlocker } from "../../navigation/navigation-blocker";
import { Spinner } from "../../ui/spinner";

interface Selection {
    start: number;
    end: number;
    text: string;
}

export function EditorInput({
    textAreaRef,
    argomentoId,
    textAreaContent,
    setTextAreaContent,
    setSelection,
    edited,
    setEdited,
}: Readonly<{
    textAreaRef: React.RefObject<HTMLTextAreaElement | null>,
    argomentoId: string,
    textAreaContent: string,
    setTextAreaContent: (value: string) => void,
    setSelection: (selection: Selection | null) => void,
    edited: boolean
    setEdited: (value: boolean) => void,
}>) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const save = (content: string) => {
        setLoading(true)
        setError(false)
        fetch("/api/editor/save", {
            method: "POST",
            body: JSON.stringify({ argomentoId, content }),
            headers: { "Content-Type": "application/json" },
        }).then(async (res) => {
            if (!res.ok) {
                setError(true)
                const text = await res.text()
                throw new Error(text)
            }
        })
            .catch(() => setError(true))
            .finally(() => {
                setLoading(false)
                setEdited(false)
            })
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        if (!edited) return;
        setLoading(true)
        setError(false)
        const timeout = setTimeout(() => save(textAreaContent), 1000)
        return () => clearTimeout(timeout)
    }, [edited])

    const handleChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        setTextAreaContent(target.value)
        setEdited(true)
    }

    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;

        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;
        const text = target.value.substring(start, end);

        setSelection({ start, end, text });
    }

    return (
        <div className="relative h-full overflow-hidden group">
            <NavigationBlocker blocked={loading} />
            <textarea
                ref={textAreaRef}
                placeholder="Scrivi qui..."
                className="resize-none w-full h-full bg-primary/5 group-hover:bg-primary/8 outline-none p-3 font-mono text-xs duration-300"
                value={textAreaContent}
                onChange={handleChange}
                onSelect={handleSelect}
                onMouseUp={handleSelect}
                onBlur={() => setSelection(null)}
            />
            {loading ? (
                <div className="absolute right-3 bottom-3">
                    <Spinner />
                </div>
            ) : (
                <SyncStatus error={error} loading={loading} />
            )}
        </div>
    )
}

const SyncStatus = ({ error, loading }: { error: boolean, loading: boolean }) => {
    if (error) return (
        <div className="absolute right-3 bottom-3 flex items-center gap-1.5 bg-destructive/10 text-destructive rounded-md px-2 py-1 text-xs group-hover:opacity-30 duration-300">
            <AlertTriangle className="size-3.5" />
            <span>Modifiche non sincronizzate</span>
        </div>
    )

    return (
        <div className="absolute right-3 bottom-3 flex items-center gap-1.5 bg-green-500/10 text-green-500 rounded-md px-2 py-1 text-xs group-hover:opacity-30 duration-300">
            <CheckCheck className="size-3.5" />
            <span>Modifiche sincronizzate</span>
        </div>
    )
}