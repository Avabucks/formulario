"use client";
import Editor, { Monaco } from '@monaco-editor/react';
import { AlertTriangle, CheckCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { NavigationBlocker } from "../../navigation/navigation-blocker";
import { Spinner } from "../../ui/spinner";
import { editor } from 'monaco-editor';

export function EditorInput({
    argomentoId,
    textAreaContent,
    setTextAreaContent,
    edited,
    setEdited,
    handleEditorDidMount,
}: Readonly<{
    argomentoId: string,
    textAreaContent: string,
    setTextAreaContent: (value: string) => void,
    edited: boolean
    setEdited: (value: boolean) => void,
    handleEditorDidMount: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
}>) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const { resolvedTheme } = useTheme();

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
        if (!edited) return
        setLoading(true)
        setError(false)
        const timeout = setTimeout(() => save(textAreaContent), 1000)
        return () => clearTimeout(timeout)
    }, [textAreaContent])

    const handleChange = (content = "") => {
        setTextAreaContent(content);
        setEdited(true);
    };

    return (
        <div className="relative h-full overflow-hidden group">
            <NavigationBlocker blocked={loading} />
            <Editor
                defaultLanguage="markdown"
                theme={resolvedTheme === "dark" ? "vs-dark" : "vs-light"}
                defaultValue={textAreaContent}
                onMount={handleEditorDidMount}
                onChange={handleChange}
                options={{
                    links: false,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    wordWrap: "on",
                }}
                loading={<Spinner />}
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
        <div className="absolute right-3 bottom-3 flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 rounded-md px-2 py-1 text-xs group-hover:opacity-30 duration-300">
            <CheckCheck className="size-3.5" />
            <span>Modifiche sincronizzate</span>
        </div>
    )
}