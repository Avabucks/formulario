"use client";

import { usePathname } from "next/navigation";

const HIDE_HEADER_ROUTES = ["/login"];

export function HeaderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  if (HIDE_HEADER_ROUTES.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
