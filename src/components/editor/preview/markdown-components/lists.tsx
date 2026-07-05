export const UlComponent = ({ children }: any) => (
  <ul className="list-disc pl-8 space-y-2.5 mb-5 text-foreground/80 [&_ul]:mb-0 [&_ol]:mb-0 [&_ul]:mt-2.5 [&_ol]:mt-2.5">
    {children}
  </ul>
);

export const OlComponent = ({ children }: any) => (
  <ol className="list-decimal pl-8 space-y-2.5 mb-5 text-foreground/80 [&_ul]:mb-0 [&_ol]:mb-0 [&_ul]:mt-2.5 [&_ol]:mt-2.5">
    {children}
  </ol>
);

export const LiComponent = ({ children }: any) => (
  <li className="leading-relaxed text-[15px] md:text-[16px] text-foreground/90">
    {children}
  </li>
);
