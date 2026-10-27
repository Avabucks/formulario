"use client";

import { usePathname } from "next/navigation";

const HIDE_HEADER_ROUTES = new Set(["/login"]);
// The workspace has its own chrome: keep the header mounted (for Ctrl+K) but hidden
const WORKSPACE_ROUTE = /^\/(editor|formulario)\//;

export function HeaderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  if (HIDE_HEADER_ROUTES.has(pathname)) {
    return null;
  }

  if (WORKSPACE_ROUTE.test(pathname))
    return <div className="hidden">{children}</div>;

  return <>{children}</>;
}
