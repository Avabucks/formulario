"use client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/src/components/ui/field";
import { signInWithCredential, signOut, GoogleAuthProvider } from "firebase/auth";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/src/lib/firebase";
import { cn } from "@/src/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import Script from "next/script";
import { useTheme } from "next-themes";

type User = {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();

  const saveUserAndRedirect = (user: User) => {
    localStorage.setItem("email", user.email ?? "");
    localStorage.setItem("name", user.displayName ?? "");
    localStorage.setItem("photoURL", user.photoURL ?? "");

    const next = searchParams.get("next") || "/home";
    router.refresh();
    router.push(next);
    (globalThis as unknown as { umami?: any }).umami?.track("created_account");
  };

  const handleGoogleLoad = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "69453402916-lsasjrcj77oiri129k5udhouodde4f7s.apps.googleusercontent.com",
      use_fedcm_for_prompt: true,
      callback: async (response: any) => {
        setLoading(true);
        try {
          const credential = GoogleAuthProvider.credential(response.credential);
          const result = await signInWithCredential(auth, credential);
          const idToken = await result.user.getIdToken();

          await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          saveUserAndRedirect(result.user);
        } catch (error: any) {
          console.error("Errore durante l'accesso con Google:", error.message);
          toast.error("Errore durante l'accesso con Google. Riprova.", {
            position: "bottom-center",
          });
          setLoading(false);
        }
      },
    });

    const btnContainer = document.getElementById("google-signin-btn");
    if (btnContainer) {
      btnContainer.innerHTML = ""; // Evita duplicazioni o sovrapposizioni
      window.google.accounts.id.renderButton(btnContainer, {
        type: "standard",
        theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 272,
      });
    }
  };

  useEffect(() => {
    signOut(auth).then(() => {
      ["email", "name", "photoURL"].forEach((key) =>
        localStorage.removeItem(key),
      );
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      handleGoogleLoad();
    }
  }, [resolvedTheme]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={handleGoogleLoad}
      />
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Benvenuto</CardTitle>
          <CardDescription>Accedi con il tuo account Google</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <div className="w-full flex flex-col items-center justify-center min-h-11">
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Spinner /> Autenticazione in corso...
                    </div>
                  )}
                  <div
                    id="google-signin-btn"
                    style={{ colorScheme: "light" }}
                    className={cn(
                      "w-full flex justify-center items-center gap-2",
                      loading ? "hidden" : "flex"
                    )}
                  >
                    <Spinner data-icon="inline-start" /> Caricamento...
                  </div>
                </div>
              </Field>
              {/*
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
              */}
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Cliccando qui sotto, accetti i nostri{" "}
        <Link href="/terms">Termini di servizio</Link> e la nostra{" "}
        <Link href="/privacy">Informativa sulla privacy</Link>.
      </FieldDescription>
    </div>
  );
}
