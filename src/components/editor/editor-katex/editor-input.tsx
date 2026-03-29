"use client";
import { AlertTriangle, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { NavigationBlocker } from "../../navigation/navigation-blocker";
import { Spinner } from "../../ui/spinner";

export function EditorInput({ argomentoId, value, onChange }: Readonly<{ argomentoId: string, value: string, onChange: (value: string) => void }>) {
    const [internalValue, setInternalValue] = useState(value)
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
            onChange(content)
        })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                setInternalValue(prev => {
                    save(prev)
                    return prev
                })
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        if (internalValue === value) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(false)
        const timeout = setTimeout(() => save(internalValue), 1000)
        return () => clearTimeout(timeout)
    }, [internalValue])

    return (
        <div className="relative h-full overflow-hidden group">
            <NavigationBlocker blocked={loading} />
            <textarea
                placeholder="Scrivi qui..."
                className="resize-none w-full h-full bg-primary/5 group-hover:bg-primary/8 outline-none p-3 font-mono text-xs duration-300"
                value={internalValue}
                onChange={(e) => setInternalValue(e.target.value)}
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