import type { editor } from "monaco-editor";

export function getIsActive(
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    getRegex: () => RegExp,
): boolean {
    if (!editorRef.current) return false;
    const model = editorRef.current.getModel();
    if (!model) return false;

    const fullText = model.getValue();
    const regex = getRegex();

    const sel = editorRef.current.getSelection();
    if (!sel) return false;

    const cursorOffset = model.getOffsetAt({
        lineNumber: sel.positionLineNumber,
        column: sel.positionColumn,
    });
    const startOffset = model.getOffsetAt({
        lineNumber: sel.startLineNumber,
        column: sel.startColumn,
    });
    const endOffset = model.getOffsetAt({
        lineNumber: sel.endLineNumber,
        column: sel.endColumn,
    });

    const isCursor = startOffset === endOffset;

    let match;
    while ((match = regex.exec(fullText)) !== null) {
        if (isCursor) {
            if (cursorOffset > match.index && cursorOffset < match.index + match[0].length) return true;
        } else {
            if (startOffset >= match.index && endOffset <= match.index + match[0].length) return true;
        }
    }
    return false;
}

export function handleFormattingToggle(
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    isActive: boolean,
    getRegex: () => RegExp,
    wrap: (text: string) => string,   // es. (t) => `**${t}**`
    unwrap: (match: RegExpExecArray) => string,  // es. (m) => m[1]
    cursorOffsetAfterWrap: (trimStart: number, trimmedText: string) => number,
    cursorOffsetAfterUnwrap: (matchIndex: number, match: RegExpExecArray) => number,
) {
    if (!editorRef.current) return false;

    const model = editorRef.current.getModel();
    if (!model) return;

    const fullText = model.getValue();

    const sel = editorRef.current.getSelection();
    if (!sel) return false;

    const startOffset = model.getOffsetAt({
        lineNumber: sel.startLineNumber,
        column: sel.startColumn,
    });
    const endOffset = model.getOffsetAt({
        lineNumber: sel.endLineNumber,
        column: sel.endColumn,
    });

    const raw = fullText.slice(startOffset, endOffset);
    const trimmedText = raw.trim();
    const leadingSpaces = raw.length - raw.trimStart().length;
    const trimStart = startOffset + leadingSpaces;
    const trimEnd = trimStart + trimmedText.length;

    if (isActive) {
        const regex = getRegex();
        let match;
        while ((match = regex.exec(fullText)) !== null) {
            if (trimStart >= match.index && trimEnd <= match.index + match[0].length) {
                const trimStartPos = model.getPositionAt(match.index);
                const trimEndPos = model.getPositionAt(match.index + match[0].length);
                const cursorPos = model.getPositionAt(cursorOffsetAfterUnwrap(match.index, match));
                model.pushEditOperations(
                    [],
                    [{
                        range: {
                            startLineNumber: trimStartPos.lineNumber,
                            startColumn: trimStartPos.column,
                            endLineNumber: trimEndPos.lineNumber,
                            endColumn: trimEndPos.column,
                        },
                        text: unwrap(match),
                    }],
                    () => null,
                );
                editorRef.current.setSelection({
                    startLineNumber: cursorPos.lineNumber,
                    startColumn: cursorPos.column,
                    endLineNumber: cursorPos.lineNumber,
                    endColumn: cursorPos.column,
                });
                editorRef.current.focus();
                return;
            }
        }
    } else {
        if (trimmedText === "") return;
        const trimStartPos = model.getPositionAt(trimStart);
        const trimEndPos = model.getPositionAt(trimEnd);
        model.pushEditOperations(
            [],
            [{
                range: {
                    startLineNumber: trimStartPos.lineNumber,
                    startColumn: trimStartPos.column,
                    endLineNumber: trimEndPos.lineNumber,
                    endColumn: trimEndPos.column,
                },
                text: wrap(trimmedText),
            }],
            () => null,
        );
        const cursorPos = model.getPositionAt(cursorOffsetAfterWrap(trimStart, trimmedText));
        editorRef.current.setSelection({
            startLineNumber: cursorPos.lineNumber,
            startColumn: cursorPos.column,
            endLineNumber: cursorPos.lineNumber,
            endColumn: cursorPos.column,
        });
        editorRef.current.focus();
    }
}

export function getIsActiveList(
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    getLineRegex: () => RegExp,
): boolean {
    if (!editorRef.current) return false;
    const model = editorRef.current.getModel();
    if (!model) return false;

    const sel = editorRef.current.getSelection();
    if (!sel) return false;

    for (let line = sel.startLineNumber; line <= sel.endLineNumber; line++) {
        const lineContent = model.getLineContent(line);
        if (!getLineRegex().test(lineContent)) return false;
    }
    return true;
}

export function handleListToggle(
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    isActive: boolean,
    getLineRegex: () => RegExp,
    addPrefix: (line: string, index: number) => string,  // es. (line, i) => `${i + 1}. ${line}`
    removePrefix: (line: string) => string,              // es. (line) => line.replace(/^\d+\.\s/, "")
) {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const sel = editorRef.current.getSelection();
    if (!sel) return;

    const endLine =
        sel.endColumn === 1 && sel.endLineNumber > sel.startLineNumber
            ? sel.endLineNumber - 1
            : sel.endLineNumber;

    const edits = [];
    for (let lineNumber = sel.startLineNumber; lineNumber <= sel.endLineNumber; lineNumber++) {
        const lineContent = model.getLineContent(lineNumber);
        const newContent = isActive
            ? removePrefix(lineContent)
            : addPrefix(lineContent, lineNumber - sel.startLineNumber);

        edits.push({
            range: {
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: lineContent.length + 1,
            },
            text: newContent,
        });
    }

    model.pushEditOperations([], edits, () => null);

    const lastLineContent = model.getLineContent(endLine);
    editorRef.current.setSelection({
        startLineNumber: endLine,
        startColumn: lastLineContent.length + 1,
        endLineNumber: endLine,
        endColumn: lastLineContent.length + 1,
    });
    editorRef.current.focus();
}