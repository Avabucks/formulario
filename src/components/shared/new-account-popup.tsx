"use client";

import { Button } from "@/src/components/ui/button";
import {
  DialogStack,
  DialogStackBody,
  DialogStackContent,
  DialogStackDescription,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
  DialogStackTitle,
} from "@/src/components/ui/dialog-stack";
import slides from "@/src/data/slides.json";
import { cn } from "@/src/lib/utils";
import { ArrowLeft, ArrowRight, FileVideo } from "lucide-react";
import { useEffect, useState } from "react";
import ForumlarioAdd from "../home/formulario-add";

const STORAGE_KEY = "new-account-popup-closed";

export function NewAccountPopup({
  setOpen,
  open,
}: Readonly<{
  setOpen: (value: boolean) => void;
  open: boolean;
}>) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (open) {
      localStorage.setItem(STORAGE_KEY, "true");
      setCurrent(0);
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  const isLast = current === slides.length - 1;

  return (
    <DialogStack
      open={open}
      activeIndex={current}
      onActiveIndexChange={setCurrent}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogStackOverlay />
      <DialogStackBody>
        {slides.map((slide, i) => (
          <DialogStackContent
            key={slide.id || i}
            className="overflow-hidden p-0 sm:p-0 max-h-[92vh] sm:max-h-[85vh] w-full flex flex-col justify-between"
          >
            {/* Header section */}
            <DialogStackHeader className="p-6 pb-3 text-left space-y-2 w-full shrink-0">
              <div className="flex items-center justify-between gap-2 w-full">
                <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1.5">
                  {slide.label}
                </p>
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {i + 1} di {slides.length}
                </span>
              </div>
              <DialogStackTitle className="text-xl font-bold tracking-tight text-foreground w-full">
                {slide.title}
              </DialogStackTitle>
              <DialogStackDescription className="text-sm text-muted-foreground leading-relaxed w-full">
                {slide.description}
              </DialogStackDescription>
            </DialogStackHeader>

            {/* Video / Preview area */}
            <div className="px-6 py-2 w-full flex-1 flex items-center justify-center min-h-0">
              <div className="relative bg-muted/40 aspect-video w-full max-h-full rounded-xl flex items-center justify-center border border-border/60 overflow-hidden shadow-inner">
                {slide.video ? (
                  <video
                    src={slide.video}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(el) => {
                      if (el) {
                        if (i === current) {
                          el.play().catch(() => { });
                        } else {
                          el.pause();
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-6 text-center">
                    <FileVideo className="h-10 w-10 opacity-30" />
                    <span className="text-xs font-medium opacity-50">
                      Anteprima video in arrivo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            <DialogStackFooter className="p-0 pt-0 w-full mt-auto shrink-0">
              <div className="flex items-center justify-between w-full px-6 py-4 border-t border-border bg-muted/30 gap-3">
                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      type="button"
                      onClick={() => setCurrent(dotIndex)}
                      aria-label={`Slide ${dotIndex + 1}`}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50",
                        dotIndex === current
                          ? "w-6 bg-primary"
                          : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  {current === 0 ? (
                    <Button variant="ghost" size="sm" onClick={handleClose}>
                      Salta
                    </Button>
                  ) : (
                    <DialogStackPrevious asChild>
                      <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        <span>Indietro</span>
                      </Button>
                    </DialogStackPrevious>
                  )}

                  {isLast ? (
                    <ForumlarioAdd allowKey={false} showLabel={true} />
                  ) : (
                    <DialogStackNext asChild>
                      <Button size="sm" className="gap-1.5 cursor-pointer">
                        <span>Avanti</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogStackNext>
                  )}
                </div>
              </div>
            </DialogStackFooter>
          </DialogStackContent>
        ))}
      </DialogStackBody>
    </DialogStack>
  );
}
