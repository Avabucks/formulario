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
import { ArrowLeft, ArrowRight, FileVideo, X } from "lucide-react";
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
            <DialogStackHeader className="p-4 pb-2 sm:p-6 sm:pb-3 text-left space-y-2 w-full shrink-0 relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 h-8 w-8 cursor-pointer"
                aria-label="Chiudi"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2.5 w-full pr-8">
                <p className="text-xs font-medium text-primary uppercase tracking-wide">
                  {slide.label}
                </p>
                <span className="text-[11px] font-semibold text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded-md shrink-0">
                  {i + 1} di {slides.length}
                </span>
              </div>
              <DialogStackTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground w-full">
                {slide.title}
              </DialogStackTitle>
              <DialogStackDescription className="text-sm text-muted-foreground leading-relaxed w-full">
                {slide.description}
              </DialogStackDescription>
            </DialogStackHeader>

            {/* Video / Preview area */}
            <div className="px-4 pt-1.5 pb-5 sm:px-6 w-full flex-1 flex items-center justify-center min-h-0">
              <div className="relative bg-muted/30 aspect-video w-full max-h-full rounded-xl sm:rounded-2xl flex items-center justify-center border border-border/70 overflow-hidden shadow-sm group">
                {slide.video ? (
                  <video
                    src={slide.video}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                    ref={(el) => {
                      if (el) {
                        if (i === current) {
                          el.play().catch(() => {});
                        } else {
                          el.pause();
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2.5 text-muted-foreground p-6 text-center">
                    <FileVideo className="h-10 w-10 opacity-30 animate-pulse" />
                    <span className="text-xs font-medium opacity-60">
                      Anteprima video in arrivo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            <DialogStackFooter className="p-0 pt-0 w-full mt-auto shrink-0">
              <div className="flex items-center justify-between w-full px-4 py-3 sm:px-6 sm:py-4 border-t border-border/70 bg-muted/20 backdrop-blur-sm gap-3">
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
                          ? "w-7 bg-primary shadow-xs"
                          : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40",
                      )}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  {current === 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      Salta
                    </Button>
                  ) : (
                    <DialogStackPrevious asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        <span>Indietro</span>
                      </Button>
                    </DialogStackPrevious>
                  )}

                  {isLast ? (
                    <div onClick={handleClose}>
                      <ForumlarioAdd allowKey={false} showLabel={true} />
                    </div>
                  ) : (
                    <DialogStackNext asChild>
                      <Button
                        size="sm"
                        className="gap-1.5 cursor-pointer font-medium shadow-xs group"
                      >
                        <span>Avanti</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
