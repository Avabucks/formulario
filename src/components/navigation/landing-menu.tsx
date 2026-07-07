"use client";

<<<<<<< HEAD
=======
import { usePathname, useRouter } from "next/navigation";
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
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
<<<<<<< HEAD
        onClick={() =>
          document
            .getElementById("pricing")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        Pricing
      </Button>
      <Button
        variant="ghost"
        className="cursor-pointer"
        onClick={() =>
          document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })
        }
=======
        onClick={() => handleScroll("faq")}
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
      >
        FAQ
      </Button>
    </div>
  );
}
