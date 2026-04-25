export const dynamic = "force-dynamic";
import packageJson from '@/package.json';
import { LoginForm } from "@/src/components/auth/login-form";
import { Pi } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Login - ${packageJson.displayName}`,
  description: `Crea, organizza e condividi i tuoi formulari e cheat sheet con ${packageJson.displayName}. Usa l'editor avanzato e l'assistente AI per generare formule e appunti in pochi secondi.`,
};

export default function LoginPage() {
  return (
    <div className="bg-muted flex-1 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Pi className="size-4" />
          </div>
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
