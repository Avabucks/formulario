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
    addPrefix: (line: string, index: number) => string,
    removePrefix: (line: string) => string,
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

export function getIsActiveBlock(
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    openMarker: string,
    closeMarker: string,
): { language: string | null } | null {
    if (!editorRef.current) return null;
    const model = editorRef.current.getModel();
    if (!model) return null;
 
    const sel = editorRef.current.getSelection();
    if (!sel) return null;
 
    const totalLines = model.getLineCount();
 
    // Cerca la riga di apertura più vicina sopra il cursore.
    // Accetta "```" oppure "```python" (marker + eventuale suffisso senza spazi interni).
    let openLine = -1;
    let language: string | null = null;
    for (let l = sel.startLineNumber; l >= 1; l--) {
        const content = model.getLineContent(l).trim();
        if (content === openMarker) {
            openLine = l;
            language = null;
            break;
        }
        if (content.startsWith(openMarker) && content.length > openMarker.length) {
            const suffix = content.slice(openMarker.length).trim();
            if (/^\S+$/.test(suffix)) {
                openLine = l;
                language = suffix;
                break;
            }
        }
    }
    if (openLine === -1) return null;
 
    // Cerca la riga di chiusura più vicina sotto il cursore (deve essere esattamente il marker)
    let closeLine = -1;
    for (let l = sel.endLineNumber; l <= totalLines; l++) {
        if (model.getLineContent(l).trim() === closeMarker) {
            closeLine = l;
            break;
        }
    }
    if (closeLine === -1) return null;
 
    // Il blocco è attivo se la selezione è contenuta tra i due marker,
    // oppure se il cursore si trova esattamente sulla riga di apertura o chiusura
    const cursorOnOpenLine = sel.startLineNumber === openLine && sel.endLineNumber === openLine;
    const cursorOnCloseLine = sel.startLineNumber === closeLine && sel.endLineNumber === closeLine;
    const insideBlock = openLine < sel.startLineNumber && closeLine > sel.endLineNumber;
 
    if (!insideBlock && !cursorOnOpenLine && !cursorOnCloseLine) return null;
 
    return { language };
}
 
export function handleBlockToggle(
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    blockState: { language: string | null } | null,
    openMarker: string,
    closeMarker: string,
    /** Se fornito e blockState è attivo, aggiorna solo il linguaggio sulla riga di apertura */
    newLanguage?: string | null,
) {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;
 
    const sel = editorRef.current.getSelection();
    if (!sel) return;
 
    const totalLines = model.getLineCount();
 
    if (blockState !== null) {
        // Trova le righe dei marker (apertura può avere suffisso lingua)
        let openLine = -1;
        for (let l = sel.startLineNumber; l >= 1; l--) {
            const lineContent = model.getLineContent(l).trim();
            if (lineContent === openMarker || (lineContent.startsWith(openMarker) && lineContent.length > openMarker.length)) {
                openLine = l;
                break;
            }
        }
 
        // Se è richiesto solo l'aggiornamento del linguaggio, sostituisce la riga di apertura
        if (newLanguage !== undefined && openLine !== -1) {
            const newOpenLine = newLanguage ? `${openMarker}${newLanguage}` : openMarker;
            const currentLineLength = model.getLineContent(openLine).length;
            model.pushEditOperations([], [{
                range: {
                    startLineNumber: openLine,
                    startColumn: 1,
                    endLineNumber: openLine,
                    endColumn: currentLineLength + 1,
                },
                text: newOpenLine,
            }], () => null);
            editorRef.current.focus();
            return;
        }
        let closeLine = -1;
        for (let l = sel.endLineNumber; l <= totalLines; l++) {
            if (model.getLineContent(l).trim() === closeMarker) { closeLine = l; break; }
        }
        if (openLine === -1 || closeLine === -1) return;
 
        const edits = [];
 
        // Rimuove la riga di chiusura (prima, per non spostare gli indici)
        edits.push({
            range: {
                startLineNumber: closeLine,
                startColumn: 1,
                endLineNumber: closeLine < totalLines ? closeLine + 1 : closeLine,
                endColumn: closeLine < totalLines ? 1 : model.getLineContent(closeLine).length + 1,
            },
            text: "",
        });
 
        // Rimuove la riga di apertura
        edits.push({
            range: {
                startLineNumber: openLine,
                startColumn: 1,
                endLineNumber: openLine + 1,
                endColumn: 1,
            },
            text: "",
        });
 
        model.pushEditOperations([], edits, () => null);
 
        // Riposiziona il cursore alla fine del contenuto rimasto
        const newEndLine = closeLine - 2; // -2: rimossa apertura e chiusura
        const safeEndLine = Math.max(1, Math.min(newEndLine, model.getLineCount()));
        const endCol = model.getLineContent(safeEndLine).length + 1;
        editorRef.current.setSelection({
            startLineNumber: safeEndLine,
            startColumn: endCol,
            endLineNumber: safeEndLine,
            endColumn: endCol,
        });
    } else {
        // Calcola la selezione escludendo il trailing newline vuoto
        const endLine =
            sel.endColumn === 1 && sel.endLineNumber > sel.startLineNumber
                ? sel.endLineNumber - 1
                : sel.endLineNumber;
 
        const startCol = 1;
        const endCol = model.getLineContent(endLine).length + 1;
 
        const selectedText = model.getValueInRange({
            startLineNumber: sel.startLineNumber,
            startColumn: startCol,
            endLineNumber: endLine,
            endColumn: endCol,
        });
 
        const newText = `${openMarker}\n${selectedText}\n${closeMarker}`;
 
        model.pushEditOperations(
            [],
            [{
                range: {
                    startLineNumber: sel.startLineNumber,
                    startColumn: startCol,
                    endLineNumber: endLine,
                    endColumn: endCol,
                },
                text: newText,
            }],
            () => null,
        );
 
        // Cursore alla fine del blocco inserito
        const newEndLine = sel.startLineNumber + selectedText.split("\n").length;
        const newEndCol = closeMarker.length + 1;
        editorRef.current.setSelection({
            startLineNumber: newEndLine,
            startColumn: newEndCol,
            endLineNumber: newEndLine,
            endColumn: newEndCol,
        });
    }
 
    editorRef.current.focus();
}