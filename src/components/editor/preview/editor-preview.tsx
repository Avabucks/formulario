"use client";

import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Toggle } from "@/src/components/ui/toggle";
import "katex/dist/katex.min.css";
import { Maximize2, Scan, ZoomIn, ZoomOut } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useIsMobile } from "@/src/hooks/useIsMobile";
import { OutlineNavigator, type PreviewHeading } from "./outline-navigator";
import { markdownComponents } from "./markdown-components";

const remarkPlugins = [remarkMath, remarkBreaks, remarkGfm];
const rehypePlugins = [rehypeKatex];

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 3;
const HEADING_SELECTOR = "h1, h2, h3, h4, h5, h6";
const SCROLL_OFFSET = 48;
const HEADING_SCROLL_NUDGE_PX = 6;
const NAVIGATOR_HIDE_DELAY_MS = 700;

function extractMarkdownHeadings(markdown: string) {
  const headings: Array<{ level: number; title: string }> = [];
  let inCodeBlock = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    headings.push({
      level: match[1].length,
      title: match[2].replace(/\s+#+$/, "").trim(),
    });
  }

  return headings;
}

export const EditorPreview = memo(function EditorPreview({
  markdownContent,
}: Readonly<{ markdownContent: string }>) {
  const patternId = `cross-${useId()}`;
  const isMobile = useIsMobile();
  const [scale, setScale] = useState(1);
  const [fitMode, setFitMode] = useState<"manual" | "fit">("manual");
  const [headings, setHeadings] = useState<PreviewHeading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigatorHoverRef = useRef(false);
  const navigatorHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const clickedHeadingRef = useRef<string | null>(null);
  const clickTimeRef = useRef<number>(0);

  const processedContent = useMemo(() => {
    return markdownContent.replaceAll(
      /(^[ \t]*)\$\$([\s\S]*?)\$\$/gm,
      (_, indent, math) => {
        const cleaned = math.trim();
        const indentedMath = cleaned
          .split("\n")
          .map((line: string) => indent + "    " + line)
          .join("\n");
        return `${indent}$$\n${indentedMath}\n${indent}$$`;
      },
    );
  }, [markdownContent]);

  const markdownHeadings = useMemo(
    () => extractMarkdownHeadings(processedContent),
    [processedContent],
  );

  const computeFitScale = useCallback(() => {
    if (!containerRef.current) return 1;
    const self = containerRef.current.getBoundingClientRect().width;
    const parent =
      containerRef.current.parentElement?.getBoundingClientRect().width ?? 0;
    const win = window.innerWidth;
    const width = self || parent || win;
    if (width === 0) return 1;
    const padding = width < 640 ? 24 : 64;
    return Math.max(ZOOM_MIN, (width - padding) / A4_WIDTH_PX);
  }, []);

  const handleZoomOut = () => {
    setFitMode("manual");
    setScale((s) =>
      Math.max(ZOOM_MIN, Number.parseFloat((s - ZOOM_STEP).toFixed(2))),
    );
  };

  const handleZoomIn = () => {
    setFitMode("manual");
    setScale((s) =>
      Math.min(ZOOM_MAX, Number.parseFloat((s + ZOOM_STEP).toFixed(2))),
    );
  };

  const handleZoom100 = () => {
    setFitMode("manual");
    setScale(1);
  };

  const handleFitWidth = useCallback(() => {
    setFitMode("fit");
    setScale(computeFitScale());
  }, [computeFitScale]);

  const clearNavigatorHideTimer = useCallback(() => {
    if (!navigatorHideTimerRef.current) return;
    clearTimeout(navigatorHideTimerRef.current);
    navigatorHideTimerRef.current = null;
  }, []);

  const scheduleNavigatorHide = useCallback(() => {
    clearNavigatorHideTimer();
    navigatorHideTimerRef.current = setTimeout(() => {
      if (!navigatorHoverRef.current) {
        setNavigatorVisible(false);
      }
    }, NAVIGATOR_HIDE_DELAY_MS);
  }, [clearNavigatorHideTimer]);

  const showNavigatorTemporarily = useCallback(() => {
    setNavigatorVisible(true);
    scheduleNavigatorHide();
  }, [scheduleNavigatorHide]);

  useEffect(() => {
    return () => clearNavigatorHideTimer();
  }, [clearNavigatorHideTimer]);

  useEffect(() => {
    if (fitMode !== "fit") return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setScale(computeFitScale()));
    const frame = requestAnimationFrame(() => setScale(computeFitScale()));
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [fitMode, computeFitScale, isMobile]);

  useEffect(() => {
    const init = () => {
      const width = containerRef.current?.getBoundingClientRect().width ?? 0;
      if (width === 0) return;
      if (A4_WIDTH_PX > width) {
        handleFitWidth();
      } else {
        setScale(1);
        setFitMode("manual");
      }
    };

    requestAnimationFrame(() => requestAnimationFrame(init));
  }, [handleFitWidth, isMobile]);

  const updateActiveHeading = useCallback(() => {
    const container = containerRef.current;
    if (!container || headings.length === 0) return;

    // Check if we are currently scrolling to a clicked heading
    if (clickedHeadingRef.current) {
      const timeSinceClick = Date.now() - clickTimeRef.current;
      if (timeSinceClick < 800) {
        setActiveHeadingId(clickedHeadingRef.current);
        return;
      }

      // After the smooth scroll should have finished (800ms), check if we have scrolled away
      const headingClick = headings.find(
        (h) => h.id === clickedHeadingRef.current,
      );
      if (headingClick) {
        const containerTop = container.getBoundingClientRect().top;
        const headingTop = headingClick.element.getBoundingClientRect().top;
        const targetScrollTop =
          container.scrollTop +
          headingTop -
          containerTop -
          SCROLL_OFFSET +
          HEADING_SCROLL_NUDGE_PX;

        const maxScrollTop = container.scrollHeight - container.clientHeight;
        const expectedScrollTop = Math.max(
          0,
          Math.min(maxScrollTop, targetScrollTop),
        );

        // If the scroll position is still close to the expected scroll target, keep it active
        if (Math.abs(container.scrollTop - expectedScrollTop) <= 10) {
          setActiveHeadingId(clickedHeadingRef.current);
          return;
        } else {
          // The user has scrolled away manually! Release the lock
          clickedHeadingRef.current = null;
        }
      }
    }

    const containerTop = container.getBoundingClientRect().top;
    const scrollLine = containerTop + SCROLL_OFFSET;
    let active = headings[0];

    for (const heading of headings) {
      const top = heading.element.getBoundingClientRect().top;
      if (top <= scrollLine) {
        active = heading;
      } else {
        break;
      }
    }

    setActiveHeadingId(active.id);
  }, [headings]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const content = contentRef.current;
      if (!content) {
        setHeadings([]);
        setActiveHeadingId(null);
        return;
      }

      const nextHeadings = Array.from(
        content.querySelectorAll<HTMLElement>(HEADING_SELECTOR),
      )
        .map((element, index) => {
          const level = Number.parseInt(element.tagName.slice(1), 10);
          const title = element.textContent?.trim().replace(/\s+/g, " ") ?? "";
          const sourceHeading = markdownHeadings[index];
          return {
            id: `preview-heading-${index}`,
            level: sourceHeading?.level ?? (Number.isNaN(level) ? 1 : level),
            title,
            sourceTitle: sourceHeading?.title ?? title,
            element,
          };
        })
        .filter(
          (heading) =>
            heading.title.length > 0 || heading.sourceTitle.length > 0,
        );

      setHeadings(nextHeadings);
      setActiveHeadingId(nextHeadings[0]?.id ?? null);
    });

    return () => cancelAnimationFrame(frame);
  }, [processedContent, markdownHeadings, isMobile]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || headings.length === 0) return;

    const frame = requestAnimationFrame(updateActiveHeading);
    const handleScroll = () => {
      updateActiveHeading();
      showNavigatorTemporarily();
    };

    container.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [headings, showNavigatorTemporarily, updateActiveHeading, isMobile]);

  const handleHeadingClick = useCallback(
    (heading: PreviewHeading) => {
      const container = containerRef.current;
      if (!container) return;

      clickedHeadingRef.current = heading.id;
      clickTimeRef.current = Date.now();
      setActiveHeadingId(heading.id);

      const isFirst = headings.length > 0 && heading.id === headings[0].id;
      if (isFirst) {
        container.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        return;
      }

      const containerTop = container.getBoundingClientRect().top;
      const headingTop = heading.element.getBoundingClientRect().top;
      const nextScrollTop =
        container.scrollTop +
        headingTop -
        containerTop -
        SCROLL_OFFSET +
        HEADING_SCROLL_NUDGE_PX;

      container.scrollTo({
        top: Math.max(0, nextScrollTop),
        behavior: "smooth",
      });
    },
    [headings],
  );
  const previewMarkdown = () => (
    <div ref={contentRef} className="editor p-4 md:p-9 leading-loose relative">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );

  const desktopView = () => (
    <div className="flex flex-col flex-1 h-full w-full min-w-0 overflow-hidden relative">
      <div
        ref={containerRef}
        className="group/container flex-1 overflow-auto bg-card/40"
      >
        <div className="py-10" style={{ minWidth: A4_WIDTH_PX * scale }}>
          <div
            style={{
              width: A4_WIDTH_PX * scale,
              marginLeft: "auto",
              marginRight: "auto",
              position: "relative",
            }}
          >
            <div
              style={{
                width: A4_WIDTH_PX,
                paddingBottom: 90,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <div
                className="relative w-full bg-background border border-border overflow-hidden"
                style={{ minHeight: A4_HEIGHT_PX }}
              >
                {/* Grid pattern */}
                <svg
                  className="absolute inset-0 h-full w-full opacity-[0.08] pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <pattern
                      id={patternId}
                      width="22"
                      height="22"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M16 0v22M0 16h22"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${patternId})`}
                  />
                </svg>

                {previewMarkdown()}
              </div>
            </div>
          </div>
        </div>

        <OutlineNavigator
          headings={headings}
          activeHeadingId={activeHeadingId}
          navigatorVisible={navigatorVisible}
          setNavigatorVisible={setNavigatorVisible}
          navigatorHoverRef={navigatorHoverRef}
          clearNavigatorHideTimer={clearNavigatorHideTimer}
          showNavigatorTemporarily={showNavigatorTemporarily}
          onHeadingClick={handleHeadingClick}
        />

        {/* Floating zoom toolbar — bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-0 group-hover/container:opacity-100 transition-opacity duration-300">
          <div className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-lg border bg-background/90 backdrop-blur-sm">
            {/* Zoom controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= ZOOM_MIN}
              aria-label="Zoom out"
              className="h-7 w-7 p-0"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>

            <span className="min-w-13 text-center text-xs tabular-nums text-muted-foreground select-none px-1">
              {Math.round(scale * 100)}%
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= ZOOM_MAX}
              aria-label="Zoom in"
              className="h-7 w-7 p-0"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>

            <Separator orientation="vertical" className="mx-0.5 h-4!" />

            {/* Fit / 100% — toggles mutuamente esclusivi */}
            <Toggle
              size="sm"
              pressed={fitMode === "fit"}
              onPressedChange={(pressed) =>
                pressed ? handleFitWidth() : handleZoom100()
              }
              aria-label="Fit width"
              className="h-7 px-2 gap-1 text-xs"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Fit
            </Toggle>

            <Toggle
              size="sm"
              pressed={fitMode === "manual" && scale === 1}
              onPressedChange={(pressed) =>
                pressed ? handleZoom100() : setFitMode("manual")
              }
              aria-label="Zoom to 100%"
              className="h-7 px-2 gap-1 text-xs"
            >
              <Scan className="h-3.5 w-3.5" />
              100%
            </Toggle>
          </div>
        </div>
      </div>
    </div>
  );

  const mobileView = () => (
    <div className="flex-1 w-full overflow-auto" ref={containerRef}>
      <div className="relative min-w-full w-fit min-h-full bg-background">
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.08] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id={patternId}
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M16 0v22M0 16h22"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>

        {previewMarkdown()}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 h-full w-full min-w-0 overflow-hidden relative">
      {isMobile ? mobileView() : desktopView()}
    </div>
  );
});
