export const TableComponent = ({ children }: any) => (
  <div className="overflow-x-auto my-6 border border-border rounded-lg bg-card/50 shadow-xs">
    <table className="w-full border-collapse text-[15px] text-left">
      {children}
    </table>
  </div>
);

export const TheadComponent = ({ children }: any) => (
  <thead className="bg-muted/50 border-b border-border">{children}</thead>
);

export const TbodyComponent = ({ children }: any) => <tbody>{children}</tbody>;

export const TrComponent = ({ children }: any) => (
  <tr className="border-b border-foreground/10 last:border-b-0">{children}</tr>
);

export const ThComponent = ({ children, ...props }: any) => (
  <th
    {...props}
    className="px-4 py-3 font-semibold text-foreground border-r border-foreground/10 last:border-r-0"
  >
    {children}
  </th>
);

export const TdComponent = ({ children, ...props }: any) => (
  <td
    {...props}
    className="px-4 py-3 text-muted-foreground border-r border-foreground/10 last:border-r-0"
  >
    {children}
  </td>
);
