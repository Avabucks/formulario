"use client";
import { AlertTriangle, CheckCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "../../ui/spinner";

export function EditorInput({ argomentoId, value, onChange }: Readonly<{ argomentoId: string, value: string, onChange: (value: string) => void }>) {
    const router = useRouter();
    const pathname = usePathname();

    const [internalValue, setInternalValue] = useState(value)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (internalValue === value) return
        
        setLoading(true)
        setError(false)
        const timeout = setTimeout(() => {
            fetch("/api/editor/save", {
                method: "POST",
                body: JSON.stringify({ argomentoId, content: internalValue }),
                headers: { "Content-Type": "application/json" },
            }).then(async (res) => {
                if (!res.ok) {
                    setError(true)
                    const text = await res.text()
                    throw new Error(text)
                }
                onChange(internalValue)
            })
                .catch(() => setError(true))
                .finally(() => setLoading(false))
        }, 1000)
        return () => clearTimeout(timeout)
    }, [internalValue])

    // Before unload (refresh, close tab) and navigation (click on link, back/forward) handler to prevent data loss
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (loading) e.preventDefault()
        }
        const handleClick = (e: MouseEvent) => {
            if (!loading) return

            const link = (e.target as HTMLElement).closest("a")
            if (!link) return

            const href = link.getAttribute("href")
            if (!href || href === pathname) return

            e.preventDefault()
            e.stopPropagation()

            if (globalThis.confirm("Ci sono modifiche non salvate. Vuoi uscire?")) {
                router.push(href)
            }
        }
        const handlePopState = (e: PopStateEvent) => {
            if (!loading) return

            const confirm = globalThis.confirm("Ci sono modifiche non salvate. Vuoi uscire?")
            if (!confirm) {
                // ripristina lo stato precedente
                globalThis.history.pushState(null, "", pathname)
            }
        }

        globalThis.history.pushState(null, "", pathname)
        globalThis.addEventListener("beforeunload", handleBeforeUnload)
        document.addEventListener("click", handleClick, true)
        globalThis.addEventListener("popstate", handlePopState)
        return () => {
            globalThis.removeEventListener("beforeunload", handleBeforeUnload)
            document.removeEventListener("click", handleClick, true)
            globalThis.removeEventListener("popstate", handlePopState)
        }
    }, [loading])

    return (
        <div className="relative h-full overflow-hidden group">
            <textarea
                placeholder="Scrivi qui..."
                className="resize-none w-full h-full bg-primary/5 group-hover:bg-primary/8 outline-none p-3 font-mono text-xs duration-300"
                value={internalValue}
                onChange={(e) => setInternalValue(e.target.value)}
            />
            {loading ? (
                <div className="absolute right-1.5 bottom-2">
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
        <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1.5 bg-destructive/10 text-destructive rounded-md px-2 py-1 text-xs group-hover:opacity-30 duration-300">
            <AlertTriangle className="size-3.5" />
            <span>Modifiche non sincronizzate</span>
        </div>
    )

    return (
        <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1.5 bg-green-500/10 text-green-500 rounded-md px-2 py-1 text-xs group-hover:opacity-30 duration-300">
            <CheckCheck className="size-3.5" />
            <span>Modifiche sincronizzate</span>
        </div>
    )
}