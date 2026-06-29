"use client";

import { useEffect, useRef } from "react";
import { InlineLatex } from "./inline-latex";

export type PreviewHeading = {
  id: string;
  level: number;
  title: string;
  sourceTitle: string;
  element: HTMLElement;
};

interface OutlineNavigatorProps {
  headings: PreviewHeading[];
  activeHeadingId: string | null;
  navigatorVisible: boolean;
  setNavigatorVisible: (visible: boolean) => void;
  navigatorHoverRef: React.RefObject<boolean>;
  clearNavigatorHideTimer: () => void;
  showNavigatorTemporarily: () => void;
  onHeadingClick: (heading: PreviewHeading) => void;
}

const getDashWidth = (level: number) => {
  if (level === 1) return 20;
  if (level === 2) return 15;
  if (level === 3) return 10;
  return 6;
};

export function OutlineNavigator({
  headings,
  activeHeadingId,
  navigatorVisible,
  setNavigatorVisible,
  navigatorHoverRef,
  clearNavigatorHideTimer,
  showNavigatorTemporarily,
  onHeadingClick,
}: Readonly<OutlineNavigatorProps>) {
  const navigatorListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigatorVisible || !activeHeadingId) return;

    const list = navigatorListRef.current;
    if (!list) return;

    const isFirst = headings.length > 0 && activeHeadingId === headings[0].id;
    if (isFirst) {
      list.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const activeButton = list.querySelector<HTMLButtonElement>(
      `[data-heading-id="${activeHeadingId}"]`,
    );

    activeButton?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [activeHeadingId, navigatorVisible, headings]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Popover */}
      <div
        className={`absolute right-11 top-1/2 -translate-y-1/2 z-10 max-h-[70vh] w-52 overflow-hidden rounded-xl border border-border/40 bg-background shadow-lg transition duration-300 ${
          navigatorVisible
            ? "pointer-events-auto opacity-100 translate-x-0"
            : "pointer-events-none opacity-0 translate-x-1.5"
        }`}
        onMouseEnter={() => {
          navigatorHoverRef.current = true;
          clearNavigatorHideTimer();
          setNavigatorVisible(true);
        }}
        onMouseLeave={() => {
          navigatorHoverRef.current = false;
          showNavigatorTemporarily();
        }}
      >
        <div
          ref={navigatorListRef}
          className="max-h-72 overflow-y-auto p-1.5"
          style={{ scrollbarWidth: "none" }}
        >
          {headings.map((heading) => (
            <button
              key={heading.id}
              type="button"
              data-heading-id={heading.id}
              onClick={() => onHeadingClick(heading)}
              className={`relative flex min-h-7 w-full items-center rounded-md py-1 pr-2 text-left text-[11px] ${
                activeHeadingId === heading.id
                  ? "text-primary bg-primary/10 shadow-xs"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
              style={{ paddingLeft: 14 + (heading.level - 1) * 8 }}
              title={heading.title}
            >
              {activeHeadingId === heading.id && (
                <span className="absolute left-1.5 w-0.5 h-3 rounded-full bg-primary" />
              )}
              <span className="line-clamp-2 leading-4">
                <InlineLatex>{heading.sourceTitle}</InlineLatex>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dash Outline Minimap */}
      <div
        className="absolute right-5  bg-background top-1/2 -translate-y-1/2 z-10 flex flex-col items-end gap-1.5 transition-all duration-300 group/outline max-h-[70vh] overflow-y-auto scrollbar-none"
        style={{ scrollbarWidth: "none" }}
        onMouseEnter={() => {
          navigatorHoverRef.current = true;
          clearNavigatorHideTimer();
          setNavigatorVisible(true);
        }}
        onMouseLeave={() => {
          navigatorHoverRef.current = false;
          showNavigatorTemporarily();
        }}
      >

        {headings.map((heading) => (
          <button
            key={heading.id}
            type="button"
            onClick={() => onHeadingClick(heading)}
            className={`z-10 h-0.5 rounded-full focus:outline-none ${
              activeHeadingId === heading.id
                ? "bg-primary opacity-100 scale-y-150 shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
                : "bg-muted-foreground/30 group-hover/outline:bg-muted-foreground/50 hover:bg-primary/80! opacity-60 hover:opacity-100 hover:scale-y-150"
            }`}
            style={{
              width: `${getDashWidth(heading.level)}px`,
            }}
            title={heading.title}
          />
        ))}
      </div>
    </>
  );
}
