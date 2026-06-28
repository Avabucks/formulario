"use client";
import Editor, { Monaco } from "@monaco-editor/react";
import { AlertTriangle, CheckCheck } from "lucide-react";
import { editor } from "monaco-editor";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavigationBlocker } from "../../navigation/navigation-blocker";
import { Spinner } from "../../ui/spinner";

export function EditorInput({
  argomentoId,
  textAreaContent,
  setTextAreaContent,
  edited,
  setEdited,
  handleEditorDidMount,
  editable,
  saveLoading,
  setSaveLoading,
  saveError,
  setSaveError,
}: Readonly<{
  argomentoId: string;
  textAreaContent: string;
  setTextAreaContent: (value: string) => void;
  edited: boolean;
  setEdited: (value: boolean) => void;
  handleEditorDidMount: (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => void;
  editable: boolean;
  saveLoading: boolean;
  setSaveLoading: (value: boolean) => void;
  saveError: boolean;
  setSaveError: (value: boolean) => void;
}>) {
  const router = useRouter();

  const save = (content: string) => {
    setSaveLoading(true);
    setSaveError(false);
    fetch("/api/editor/save", {
      method: "POST",
      body: JSON.stringify({ argomentoId, content }),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          setSaveError(true);
          const text = await res.text();
          throw new Error(text);
        }
        router.refresh();
      })
      .catch(() => setSaveError(true))
      .finally(() => {
        setSaveLoading(false);
        setEdited(false);
      });
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        if (timeout) return;
        timeout = setTimeout(() => {
          timeout = null;
        }, 1000);
        save(textAreaContent);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!edited) return;
    setSaveLoading(true);
    setSaveError(false);
    const timeout = setTimeout(() => save(textAreaContent), 1000);
    return () => clearTimeout(timeout);
  }, [textAreaContent]);

  const handleChange = (content = "") => {
    setTextAreaContent(content);
    setEdited(true);
  };

  return (
    <div className="relative h-full overflow-hidden group">
      <NavigationBlocker blocked={saveLoading} />
      <Editor
        defaultLanguage="markdown-math"
        defaultValue={textAreaContent}
        onMount={handleEditorDidMount}
        onChange={handleChange}
        theme="markdown-math-theme"
        options={{
          readOnly: !editable,
          links: false,
          minimap: { enabled: false },
          automaticLayout: true,
          wordWrap: "on",
          quickSuggestions: false,
        }}
        loading={<Spinner />}
      />
    </div>
  );
}

export const SyncStatus = ({
  error,
  loading,
}: {
  error: boolean;
  loading: boolean;
}) => {
  if (loading)
    return (
      <div className="absolute right-6 bottom-3 flex items-center justify-center bg-muted/80 text-muted-foreground rounded-md p-1.5 backdrop-blur-xs">
        <Spinner className="size-3.5" />
      </div>
    );

  if (error)
    return (
      <div className="absolute right-6 bottom-3 flex items-center gap-1.5 bg-destructive/10 text-destructive rounded-md px-2 py-1 text-xs">
        <AlertTriangle className="size-3.5" />
        <span>Non sincronizzato</span>
      </div>
    );

  return (
    <div className="absolute right-6 bottom-3 flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 rounded-md px-2 py-1 text-xs">
      <CheckCheck className="size-3.5" />
      <span>Sincronizzato</span>
    </div>
  );
};
