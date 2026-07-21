"use client";

import { usePathname } from "next/navigation";

const HIDE_HEADER_ROUTES = new Set(["/login"]);

export function HeaderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  if (HIDE_HEADER_ROUTES.has(pathname)) {
    return null;
  }

  return <>{children}</>;
}
