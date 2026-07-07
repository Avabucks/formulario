"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function LandingMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const handleScroll = (id: string) => {
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <div className="hidden md:flex items-center gap-2">
      <Button
        variant="ghost"
        className="cursor-pointer"
        onClick={() => handleScroll("demo")}
      >
        Demo
      </Button>
      <Button
        variant="ghost"
        className="cursor-pointer"
        onClick={() => handleScroll("features")}
      >
        Funzionalità
      </Button>
      <Button
        variant="ghost"
        className="cursor-pointer"
        onClick={() => handleScroll("faq")}
      >
        FAQ
      </Button>
    </div>
  );
}
