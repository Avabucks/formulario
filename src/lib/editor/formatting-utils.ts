import type { editor, Selection } from "monaco-editor";

// Helper functions for Monaco Editor contexts and offsets
function getEditorContext(
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
) {
  const editor = editorRef.current;
  if (!editor) return null;
  const model = editor.getModel();
  if (!model) return null;
  const selection = editor.getSelection();
  if (!selection) return null;
  return { editor, model, selection };
}

function getSelectionOffsets(model: editor.ITextModel, selection: Selection) {
  const startOffset = model.getOffsetAt({
    lineNumber: selection.startLineNumber,
    column: selection.startColumn,
  });
  const endOffset = model.getOffsetAt({
    lineNumber: selection.endLineNumber,
    column: selection.endColumn,
  });
  return { startOffset, endOffset };
}

function getAdjustedEndLine(selection: Selection): number {
  return selection.endColumn === 1 &&
    selection.endLineNumber > selection.startLineNumber
    ? selection.endLineNumber - 1
    : selection.endLineNumber;
}

// REGEX Helpers and Constants
const makeHeaderRegex = (level: number) => () =>
  new RegExp(String.raw`^${"#".repeat(level)}\s(.+)$`, "gm");

export const getH1Regex = makeHeaderRegex(1);
export const getH2Regex = makeHeaderRegex(2);
export const getH3Regex = makeHeaderRegex(3);
export const getH4Regex = makeHeaderRegex(4);
export const getH5Regex = makeHeaderRegex(5);
export const getH6Regex = makeHeaderRegex(6);

export const getBoldRegex = () => /\*\*(.*?)\*\*/g;
export const getItalicRegex = () => /_(.*?)_/g; // Fixed typo: changed /_(. +?)_/g to /_(.+?)_/g
export const getQuoteRegex = () => /^>\s/;

export const getOrderedListRegex = () => /^\s*\d+\.\s/;
export const getUnorderedListRegex = () => /^\s*[-*]\s/;

export const getCodeInlineRegex = () => /`(.*?)`/g;

export function getIsActiveWord(
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
  getRegex: () => RegExp,
): boolean {
  const ctx = getEditorContext(editorRef);
  if (!ctx) return false;

  const { model, selection } = ctx;
  const fullText = model.getValue();
  const regex = getRegex();

  const cursorOffset = model.getOffsetAt({
    lineNumber: selection.positionLineNumber,
    column: selection.positionColumn,
  });
  const { startOffset, endOffset } = getSelectionOffsets(model, selection);

  const isCursor = startOffset === endOffset;

  let match;
  while ((match = regex.exec(fullText)) !== null) {
    if (isCursor) {
      if (
        cursorOffset > match.index &&
        cursorOffset < match.index + match[0].length
      )
        return true;
    } else if (
      startOffset >= match.index &&
      endOffset <= match.index + match[0].length
    )
      return true;
  }
  return false;
}

export function handleWordToggle(
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
  isActive: boolean,
  getRegex: () => RegExp,
  wrap: (text: string) => string, // es. (t) => `**${t}**`
  unwrap: (match: RegExpExecArray) => string, // es. (m) => m[1]
  cursorOffsetAfterUnwrap: (
    matchIndex: number,
    match: RegExpExecArray,
  ) => number,
) {
  const ctx = getEditorContext(editorRef);
  if (!ctx) return false;

  const { editor, model, selection } = ctx;
  const fullText = model.getValue();
  const { startOffset, endOffset } = getSelectionOffsets(model, selection);

  const raw = fullText.slice(startOffset, endOffset);
  const trimmedText = raw.trim();
  const leadingSpaces = raw.length - raw.trimStart().length;
  const trimStart = startOffset + leadingSpaces;
  const trimEnd = trimStart + trimmedText.length;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controller = editor.getContribution("snippetController2") as any;
  if (!controller) return false;

  if (isActive) {
    const regex = getRegex();
    let match;
    while ((match = regex.exec(fullText)) !== null) {
      if (
        trimStart >= match.index &&
        trimEnd <= match.index + match[0].length
      ) {
        const trimStartPos = model.getPositionAt(match.index);
        const trimEndPos = model.getPositionAt(match.index + match[0].length);
        const cursorPos = model.getPositionAt(
          cursorOffsetAfterUnwrap(match.index, match),
        );
        model.pushEditOperations(
          [],
          [
            {
              range: {
                startLineNumber: trimStartPos.lineNumber,
                startColumn: trimStartPos.column,
                endLineNumber: trimEndPos.lineNumber,
                endColumn: trimEndPos.column,
              },
              text: unwrap(match),
            },
          ],
          () => null,
        );
        editor.setSelection({
          startLineNumber: cursorPos.lineNumber,
          startColumn: cursorPos.column,
          endLineNumber: cursorPos.lineNumber,
          endColumn: cursorPos.column,
        });
        editor.focus();
        return;
      }
    }
  }
  const escapedText = trimmedText.replace(/[\$\\]/g, (m) => "\\" + m);
  const text = wrap(escapedText);
  controller.insert(text);
  setTimeout(() => editor.focus(), 0);
}

export function getIsActiveList(
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
  getLineRegex: () => RegExp,
): boolean {
  const ctx = getEditorContext(editorRef);
  if (!ctx) return false;

  const { model, selection } = ctx;

  for (
    let line = selection.startLineNumber;
    line <= selection.endLineNumber;
    line++
  ) {
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
  const ctx = getEditorContext(editorRef);
  if (!ctx) return;

  const { editor, model, selection } = ctx;
  const endLine = getAdjustedEndLine(selection);

  const edits = [];
  for (
    let lineNumber = selection.startLineNumber;
    lineNumber <= selection.endLineNumber;
    lineNumber++
  ) {
    const lineContent = model.getLineContent(lineNumber);
    const newContent = isActive
      ? removePrefix(lineContent)
      : addPrefix(lineContent, lineNumber - selection.startLineNumber);

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
  editor.setSelection({
    startLineNumber: endLine,
    startColumn: lastLineContent.length + 1,
    endLineNumber: endLine,
    endColumn: lastLineContent.length + 1,
  });
  editor.focus();
}

// --- Refactored Code Block Helpers ---

interface CodeBlock {
  startLine: number;
  endLine: number;
  language: string | null;
}

function findCodeBlocks(
  model: editor.ITextModel,
  maxLine: number,
): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  let startLine: number | null = null;
  let language: string | null = null;

  for (let l = 1; l <= model.getLineCount(); l++) {
    const content = model.getLineContent(l).trim();

    if (startLine === null) {
      if (content.startsWith("```")) {
        const suffix = content.slice(3).trim();
        language = suffix.length > 0 ? suffix : null;
        startLine = l;
      }
    } else if (content === "```") {
      blocks.push({ startLine, endLine: l, language });
      startLine = null;
      language = null;
    }

    if (l > maxLine && startLine === null) {
      break;
    }
  }
  return blocks;
}

export function getIsActiveCode(
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
): { language: string | null } | null {
  const ctx = getEditorContext(editorRef);
  if (!ctx) return null;

  const { model, selection } = ctx;
  const cursorLine = selection.startLineNumber;
  const blocks = findCodeBlocks(model, cursorLine);

  const activeBlock = blocks.find(
    (b) => cursorLine >= b.startLine && cursorLine < b.endLine,
  );

  return activeBlock ? { language: activeBlock.language } : null;
}

function wrapInBlock(
  editor: editor.IStandaloneCodeEditor,
  model: editor.ITextModel,
  selection: Selection,
  openMarker: string,
  closeMarker: string,
) {
  const endLine = getAdjustedEndLine(selection);
  const startCol = 1;
  const endCol = model.getLineContent(endLine).length + 1;

  const selectedText = model.getValueInRange({
    startLineNumber: selection.startLineNumber,
    startColumn: startCol,
    endLineNumber: endLine,
    endColumn: endCol,
  });

  const newText = `${openMarker}\n${selectedText}\n${closeMarker}`;

  model.pushEditOperations(
    [],
    [
      {
        range: {
          startLineNumber: selection.startLineNumber,
          startColumn: startCol,
          endLineNumber: endLine,
          endColumn: endCol,
        },
        text: newText,
      },
    ],
    () => null,
  );

  const newEndLine =
    selection.startLineNumber + selectedText.split("\n").length;
  const newEndCol = closeMarker.length + 1;
  editor.setSelection({
    startLineNumber: newEndLine,
    startColumn: newEndCol,
    endLineNumber: newEndLine,
    endColumn: newEndCol,
  });
  editor.focus();
}

function findOpenLine(
  model: editor.ITextModel,
  startLine: number,
  openMarker: string,
): number {
  for (let l = startLine; l >= 1; l--) {
    const lineContent = model.getLineContent(l).trim();
    if (
      lineContent === openMarker ||
      (lineContent.startsWith(openMarker) &&
        lineContent.length > openMarker.length)
    ) {
      return l;
    }
  }
  return -1;
}

function findCloseLine(
  model: editor.ITextModel,
  startLine: number,
  closeMarker: string,
): number {
  const totalLines = model.getLineCount();
  for (let l = startLine; l <= totalLines; l++) {
    if (model.getLineContent(l).trim() === closeMarker) {
      return l;
    }
  }
  return -1;
}

function updateBlockLanguage(
  editor: editor.IStandaloneCodeEditor,
  model: editor.ITextModel,
  openLine: number,
  openMarker: string,
  newLanguage: string | null,
) {
  const newOpenLine = newLanguage ? `${openMarker}${newLanguage}` : openMarker;
  const currentLineLength = model.getLineContent(openLine).length;
  model.pushEditOperations(
    [],
    [
      {
        range: {
          startLineNumber: openLine,
          startColumn: 1,
          endLineNumber: openLine,
          endColumn: currentLineLength + 1,
        },
        text: newOpenLine,
      },
    ],
    () => null,
  );
  editor.focus();
}

function unwrapBlock(
  editor: editor.IStandaloneCodeEditor,
  model: editor.ITextModel,
  openLine: number,
  closeLine: number,
) {
  const totalLines = model.getLineCount();
  const edits = [
    {
      range: {
        startLineNumber: closeLine,
        startColumn: 1,
        endLineNumber: closeLine < totalLines ? closeLine + 1 : closeLine,
        endColumn:
          closeLine < totalLines
            ? 1
            : model.getLineContent(closeLine).length + 1,
      },
      text: "",
    },
    {
      range: {
        startLineNumber: openLine,
        startColumn: 1,
        endLineNumber: openLine + 1,
        endColumn: 1,
      },
      text: "",
    },
  ];

  model.pushEditOperations([], edits, () => null);

  const newEndLine = closeLine - 2;
  const safeEndLine = Math.max(1, Math.min(newEndLine, model.getLineCount()));
  const endCol = model.getLineContent(safeEndLine).length + 1;
  editor.setSelection({
    startLineNumber: safeEndLine,
    startColumn: endCol,
    endLineNumber: safeEndLine,
    endColumn: endCol,
  });
  setTimeout(() => editor.focus(), 0);
}

export function handleBlockToggle(
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
  blockState: { language: string | null } | null,
  openMarker: string,
  closeMarker: string,
  newLanguage?: string | null,
) {
  const ctx = getEditorContext(editorRef);
  if (!ctx) return;

  const { editor, model, selection } = ctx;

  if (blockState === null) {
    wrapInBlock(editor, model, selection, openMarker, closeMarker);
    return;
  }

  const openLine = findOpenLine(model, selection.startLineNumber, openMarker);
  if (openLine === -1) return;

  if (newLanguage !== undefined) {
    updateBlockLanguage(editor, model, openLine, openMarker, newLanguage);
    return;
  }

  const closeLine = findCloseLine(model, selection.endLineNumber, closeMarker);
  if (closeLine === -1) return;

  unwrapBlock(editor, model, openLine, closeLine);
}

// --- Refactored Latex Helpers ---

interface LatexMatch {
  kind: "single" | "double";
  matchIndex: number;
  matchEnd: number;
  lineNumber: number;
}

function getInlineLatexMatch(
  lineContent: string,
  lineNumber: number,
  cursorCol: number,
): LatexMatch | null {
  const inlinePatterns = [
    {
      regex: /\$\$(?:[\s\S]*?)\$\$/g,
      kind: "double" as const,
      delimiterLen: 2,
    },
    {
      regex: /(?<!\$)\$(?!\$)(?:[\s\S]+?)(?<!\$)\$(?!\$)/g,
      kind: "single" as const,
      delimiterLen: 1,
    },
    {
      regex: /(?<!\$)\$\$(?!\$)/g,
      kind: "single" as const,
      delimiterLen: 1,
    },
  ];

  for (const { regex, kind, delimiterLen } of inlinePatterns) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(lineContent)) !== null) {
      const startCol = match.index + 1;
      const endCol = startCol + match[0].length;

      const afterStartDelimiter = cursorCol > startCol + delimiterLen - 1;
      const beforeEndDelimiter = cursorCol <= endCol - delimiterLen;

      if (afterStartDelimiter && beforeEndDelimiter) {
        return {
          kind,
          matchIndex: match.index,
          matchEnd: match.index + match[0].length,
          lineNumber,
        };
      }
    }
  }
  return null;
}

function getBlockLatexMatch(
  model: editor.ITextModel,
  cursorLine: number,
  cursorCol: number,
): LatexMatch | null {
  const fullText = model.getValue();
  const blockRegex = /\$\$([\s\S]*?)\$\$/g;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(fullText)) !== null) {
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;

    const startPos = model.getPositionAt(startOffset);
    const endPos = model.getPositionAt(endOffset);

    const isStrictlyAfterStart =
      cursorLine > startPos.lineNumber ||
      (cursorLine === startPos.lineNumber && cursorCol > startPos.column + 1);

    const isStrictlyBeforeEnd =
      cursorLine < endPos.lineNumber ||
      (cursorLine === endPos.lineNumber && cursorCol <= endPos.column - 2);

    if (isStrictlyAfterStart && isStrictlyBeforeEnd) {
      const isStartLine = cursorLine === startPos.lineNumber;
      const isEndLine = cursorLine === endPos.lineNumber;

      const matchIndex = isStartLine ? startPos.column - 1 : 0;
      const matchEnd = isEndLine
        ? endPos.column - 1
        : model.getLineContent(cursorLine).length;

      return {
        kind: "double",
        matchIndex,
        matchEnd,
        lineNumber: cursorLine,
      };
    }
  }
  return null;
}

export function getIsActiveLatex(
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
): LatexMatch | null {
  const ctx = getEditorContext(editorRef);
  if (!ctx) return null;

  const { model, selection } = ctx;
  const cursorLine = selection.startLineNumber;
  const cursorCol = selection.startColumn;
  const lineContent = model.getLineContent(cursorLine);

  const inlineMatch = getInlineLatexMatch(lineContent, cursorLine, cursorCol);
  if (inlineMatch) return inlineMatch;

  return getBlockLatexMatch(model, cursorLine, cursorCol);
}

export function checkActiveLatexOrCode(
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
): boolean {
  const code = getIsActiveCode(editorRef);
  const latex = getIsActiveLatex(editorRef);
  return !!(latex?.kind === "double" || code);
}
