import { Lightbulb } from "lucide-react";

export const BlockquoteComponent = ({ children }: any) => (
  <blockquote className="my-6 pl-5 pr-4 py-3 bg-muted/40 border-l-4 border-primary rounded-r-lg text-muted-foreground flex gap-3.5 items-start [&>div>*:last-child]:mb-0">
    <Lightbulb className="text-primary shrink-0 mt-0.5" size={18} />
    <div className="flex-1 not-italic text-foreground/95">{children}</div>
  </blockquote>
);
