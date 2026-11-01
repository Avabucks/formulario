"use client";
import Editor, { Monaco } from "@monaco-editor/react";
import { AlertTriangle, CheckCheck } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
  getOrderedListRegex,
  getUnorderedListRegex,
} from "@/src/lib/editor/formatting-utils";
import { toast } from "sonner";
import {
  altFromFileName,
  isUploadableImage,
  uploadImage,
} from "@/src/lib/editor/image-upload";
import { NavigationBlocker } from "../../navigation/navigation-blocker";
import {
  getEditorViewState,
  setEditorViewState,
} from "../../workspace/workspace-store";
import { Spinner } from "../../ui/spinner";
import { ImageManager } from "../../shared/image-manager";

const darkRules = [
  { token: "math.display", foreground: "4EC9B0" },
  { token: "math.inline", foreground: "4EC9B0" },
  { token: "math.content", foreground: "CE9178" },
  { token: "markdown.blockquote", foreground: "6A9955" },
  { token: "markdown.code.inline", foreground: "D7BA7D" },
  { token: "markdown.code.block", foreground: "D7BA7D" },
  { token: "strong", foreground: "C586C0" },
  { token: "markup.bold.italic", foreground: "E06C75" },
];

const lightRules = [
  { token: "math.display", foreground: "267F99" },
  { token: "math.inline", foreground: "267F99" },
  { token: "math.content", foreground: "A31515" },
  { token: "markdown.blockquote", foreground: "008000" },
  { token: "markdown.code.inline", foreground: "795E26" },
  { token: "markdown.code.block", foreground: "795E26" },
  { token: "strong", foreground: "7B2FBE" },
  { token: "markup.bold.italic", foreground: "C0392B" },
];

function handleUnorderedList(
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco,
  position: any,
  lineContent: string,
  textBeforeCursor: string,
): boolean {
  const match = new RegExp(getUnorderedListRegex()).exec(textBeforeCursor);
  if (!match) return false;

  const marker = match[0];
  const isEmpty = textBeforeCursor === marker;
  const text = isEmpty
    ? new RegExp(/^\s*/).exec(marker)?.[0] || ""
    : "\n" + marker;
  const range = isEmpty
    ? new monaco.Range(
        position.lineNumber,
        1,
        position.lineNumber,
        lineContent.length + 1,
      )
    : new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column,
      );

  editor.executeEdits("list-autocomplete", [
    {
      range,
      text,
      forceMoveMarkers: true,
    },
  ]);

  return true;
}

function handleOrderedList(
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco,
  position: any,
  lineContent: string,
  textBeforeCursor: string,
): boolean {
  const match = new RegExp(getOrderedListRegex()).exec(textBeforeCursor);
  if (!match) return false;

  const marker = match[0];
  const isEmpty = textBeforeCursor === marker;

  let text = "";
  let range;

  if (isEmpty) {
    text = new RegExp(/^\s*/).exec(marker)?.[0] || "";
    range = new monaco.Range(
      position.lineNumber,
      1,
      position.lineNumber,
      lineContent.length + 1,
    );
  } else {
    const numMatch = new RegExp(/\d+/).exec(marker);
    const nextNum = numMatch ? Number.parseInt(numMatch[0], 10) + 1 : 1;
    const nextMarker = marker.replace(/\d+/, nextNum.toString());
    text = "\n" + nextMarker;
    range = new monaco.Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column,
    );
  }

  editor.executeEdits("list-autocomplete", [
    {
      range,
      text,
      forceMoveMarkers: true,
    },
  ]);

  return true;
}

function handleListEnter(
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco,
  e: any,
): boolean {
  if (e.keyCode !== monaco.KeyCode.Enter) return false;

  const selection = editor.getSelection();
  if (!selection?.isEmpty()) return false;

  const position = editor.getPosition();
  if (!position) return false;

  const model = editor.getModel();
  if (!model) return false;

  const lineContent = model.getLineContent(position.lineNumber);
  const textBeforeCursor = lineContent.substring(0, position.column - 1);

  if (
    handleUnorderedList(editor, monaco, position, lineContent, textBeforeCursor)
  ) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }

  if (
    handleOrderedList(editor, monaco, position, lineContent, textBeforeCursor)
  ) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }

  return false;
}

export function EditorInput({
  argomentoId,
  textAreaContent,
  setTextAreaContent,
  edited,
  setEdited,
  editorRef,
  setSelection,
  setIsFocused,
  undoBtnRef,
  redoBtnRef,
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
  editorRef: React.RefObject<any>;
  setSelection: (selection: Selection | null) => void;
  setIsFocused: (focused: boolean) => void;
  undoBtnRef: React.RefObject<HTMLButtonElement | null>;
  redoBtnRef: React.RefObject<HTMLButtonElement | null>;
  editable: boolean;
  saveLoading: boolean;
  setSaveLoading: (value: boolean) => void;
  saveError: boolean;
  setSaveError: (value: boolean) => void;
}>) {
  const { resolvedTheme } = useTheme();
  const monacoRef = useRef<Monaco | null>(null);
  const [monacoReady, setMonacoReady] = useState(false);

  useEffect(() => {
    if (!monacoRef.current) return;

    monacoRef.current.editor.defineTheme("markdown-math-theme", {
      base: resolvedTheme === "dark" ? "vs-dark" : "vs",
      inherit: true,
      rules: resolvedTheme === "dark" ? darkRules : lightRules,
      colors: {},
    });

    monacoRef.current.editor.setTheme("markdown-math-theme");
  }, [resolvedTheme, monacoReady]);

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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  // Inserts an image picked from the image manager at the cursor
  const insertImageUrl = (url: string) => {
    const editorInstance = editorRef.current as editor.IStandaloneCodeEditor;
    const selection = editorInstance?.getSelection();
    if (!editorInstance || !selection) return;
    editorInstance.executeEdits("image-insert", [
      {
        range: selection,
        text: `![immagine](${url})\n`,
        forceMoveMarkers: true,
      },
    ]);
    // Let the dialog finish closing before giving focus back to Monaco
    setTimeout(() => editorInstance.focus(), 0);
  };

  // Inserts a placeholder at once, then swaps it with the real link when the upload lands
  const insertImages = (
    files: File[],
    position?: { lineNumber: number; column: number } | null,
  ) => {
    const editorInstance = editorRef.current as editor.IStandaloneCodeEditor;
    const model = editorInstance?.getModel();
    if (!editorInstance || !model) return;

    const images = files.filter(isUploadableImage);
    if (images.length === 0) {
      if (files.length > 0)
        toast.error("Formato non supportato (usa PNG, JPG, WebP o GIF)", {
          position: "bottom-center",
        });
      return;
    }

    if (position) editorInstance.setPosition(position);

    for (const file of images) {
      const placeholder = `![Caricamento immagine…](upload-${crypto.randomUUID()})`;
      const selection = editorInstance.getSelection();
      if (!selection) continue;
      editorInstance.executeEdits("image-upload", [
        { range: selection, text: placeholder + "\n", forceMoveMarkers: true },
      ]);

      const replacePlaceholder = (text: string) => {
        const match = model.findMatches(
          placeholder,
          false,
          false,
          true,
          null,
          false,
        )[0];
        if (match)
          editorInstance.executeEdits("image-upload", [
            { range: match.range, text },
          ]);
      };

      uploadImage(file, argomentoId)
        .then((url) =>
          replacePlaceholder(`![${altFromFileName(file.name)}](${url})`),
        )
        .catch((error: Error) => {
          replacePlaceholder("");
          toast.error(error.message, { position: "bottom-center" });
        });
    }
    editorInstance.focus();
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !editable) return;

    const imageFiles = (data: DataTransfer | null) =>
      Array.from(data?.files ?? []).filter((f) => f.type.startsWith("image/"));

    // Capture phase so Monaco never sees image pastes/drops
    const handlePaste = (e: ClipboardEvent) => {
      const files = imageFiles(e.clipboardData);
      if (files.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      insertImages(files);
    };
    const handleDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    };
    const handleDrop = (e: DragEvent) => {
      const files = imageFiles(e.dataTransfer);
      if (files.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const target = (
        editorRef.current as editor.IStandaloneCodeEditor | null
      )?.getTargetAtClientPoint(e.clientX, e.clientY);
      insertImages(files, target?.position);
    };
    const handleOpenPicker = () => setImagePickerOpen(true);

    wrapper.addEventListener("paste", handlePaste, true);
    wrapper.addEventListener("dragover", handleDragOver, true);
    wrapper.addEventListener("drop", handleDrop, true);
    globalThis.addEventListener("editor:insert-image", handleOpenPicker);
    return () => {
      wrapper.removeEventListener("paste", handlePaste, true);
      wrapper.removeEventListener("dragover", handleDragOver, true);
      wrapper.removeEventListener("drop", handleDrop, true);
      globalThis.removeEventListener("editor:insert-image", handleOpenPicker);
    };
    // insertImages only reads refs and argomentoId, fixed for this mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable]);

  const handleChange = (content = "") => {
    setTextAreaContent(content);
    setEdited(true);
  };

  const updateSelection = (editor: editor.IStandaloneCodeEditor) => {
    const sel = editor.getSelection();
    if (!sel) return;
    setSelection(sel);
  };

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme("markdown-math-theme", {
      base: resolvedTheme === "dark" ? "vs-dark" : "vs",
      inherit: true,
      rules: resolvedTheme === "dark" ? darkRules : lightRules,
      colors: {},
    });
    monaco.editor.setTheme("markdown-math-theme");

    setMonacoReady(true);

    monaco.languages.register({ id: "markdown-math" });

    monaco.languages.setMonarchTokensProvider("markdown-math", {
      tokenizer: {
        root: [
          [/\$\$/, { token: "math.display", next: "@mathDisplay" }],
          [/\$/, { token: "math.inline", next: "@mathInline" }],
          [/^#{1,6}\s.*$/, "keyword"],
          [/^\s*>.*$/, "markdown.blockquote"],
          [/\*\*[^*]+\*\*/, "strong"],
          [/^(`{3,}).*$/, { token: "markdown.code.block", next: "@codeBlock" }],
          [/`[^`]+`/, "markdown.code.inline"],
        ],
        mathDisplay: [
          [/[^$]+/, "math.content"],
          [/\$\$/, { token: "math.display", next: "@pop" }],
        ],
        mathInline: [
          [/[^$]+/, "math.content"],
          [/\$/, { token: "math.inline", next: "@pop" }],
        ],
        codeBlock: [
          [/^`{3,}$/, { token: "markdown.code.block", next: "@pop" }],
          [/.*$/, "markdown.code.block"],
        ],
      },
    });

    editor.onDidChangeCursorSelection(() => updateSelection(editor));
    editor.onDidChangeCursorPosition(() => updateSelection(editor));

    editor.onDidBlurEditorWidget(() => {
      setIsFocused(false);
    });

    editor.onDidFocusEditorWidget(() => {
      setIsFocused(true);
    });

    const updateButtons = () => {
      const model = editor.getModel();

      if (model) {
        if (undoBtnRef.current) undoBtnRef.current.disabled = !model.canUndo();
        if (redoBtnRef.current) redoBtnRef.current.disabled = !model.canRedo();
      }
    };

    editor.onDidChangeModelContent(() => {
      updateButtons();
    });
    updateButtons();
    if (undoBtnRef.current) undoBtnRef.current.disabled = true;
    if (redoBtnRef.current) redoBtnRef.current.disabled = true;
  };

  return (
    <div ref={wrapperRef} className="relative h-full overflow-hidden group">
      <NavigationBlocker blocked={saveLoading} />
      {editable && (
        <ImageManager
          open={imagePickerOpen}
          setOpen={setImagePickerOpen}
          argomentoId={argomentoId}
          onPick={(image) => insertImageUrl(image.url)}
        />
      )}
      <Editor
        defaultLanguage="markdown-math"
        defaultValue={textAreaContent}
        onMount={(editor, monaco) => {
          editor.onKeyDown((e: any) => {
            handleListEnter(editor, monaco, e);
          });
          handleEditorDidMount(editor, monaco);

          // Restore scroll/cursor when coming back to this tab
          const viewState = getEditorViewState(argomentoId);
          if (viewState)
            editor.restoreViewState(viewState as editor.ICodeEditorViewState);
          const saveViewState = () =>
            setEditorViewState(argomentoId, editor.saveViewState());
          editor.onDidScrollChange(saveViewState);
          editor.onDidChangeCursorPosition(saveViewState);
        }}
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
