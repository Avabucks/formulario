export const H1Component = ({ children }: any) => (
  <h1 className="text-(--editor-title) text-[2.2em] font-bold tracking-tight mb-6 pb-1 leading-tight">
    {children}
  </h1>
);

export const H2Component = ({ children }: any) => (
  <h2 className="text-(--editor-title) text-[1.6em] font-bold tracking-tight mt-6 mb-5 pb-1 leading-snug">
    {children}
  </h2>
);

export const H3Component = ({ children }: any) => (
  <h3 className="text-(--editor-title) text-[1.3em] font-semibold mt-6 mb-4 leading-normal">
    {children}
  </h3>
);

export const H4Component = ({ children }: any) => (
  <h4 className="text-(--editor-title) text-[1.1em] font-semibold mt-5 mb-3 leading-normal">
    {children}
  </h4>
);

export const H5Component = ({ children }: any) => (
  <h5 className="text-(--editor-title) text-[0.95em] font-semibold mt-4 mb-2">
    {children}
  </h5>
);

export const H6Component = ({ children }: any) => (
  <h6 className="text-(--editor-title)/70 text-[0.85em] font-semibold mt-4 mb-2">
    {children}
  </h6>
);
