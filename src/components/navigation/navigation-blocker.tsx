"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export function NavigationBlocker({ blocked }: { blocked: boolean }) {
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {

        if (!blocked) return

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (blocked) e.preventDefault()
        }
        const handleClick = (e: MouseEvent) => {
            if (!blocked) return

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
        const handlePopState = () => {
            if (!blocked) return

            if (!globalThis.confirm("Ci sono modifiche non salvate. Vuoi uscire?")) {
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
    }, [blocked])

    return null
}