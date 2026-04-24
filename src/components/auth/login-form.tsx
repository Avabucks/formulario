"use client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup
} from "@/src/components/ui/field";
import { auth, googleProvider } from "@/src/lib/firebase";
import { cn } from "@/src/lib/utils";
import { signInWithPopup, signOut } from "firebase/auth";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

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

  const saveUserAndRedirect = (user: User) => {
    localStorage.setItem("email", user.email ?? "");
    localStorage.setItem("name", user.displayName ?? "");
    localStorage.setItem("photoURL", user.photoURL ?? "");

    const next = searchParams.get("next") || "/home";
    router.refresh();
    router.push(next);
  };

  const handleLoginGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const idToken = await result.user.getIdToken();

      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      saveUserAndRedirect(result.user);
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Popup chiuso dall'utente", { position: "bottom-center" });
      } else {
        toast.error("Errore durante il login con Google. Riprova.", { position: "bottom-center" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    signOut(auth).then(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }, [])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Benvenuto</CardTitle>
          <CardDescription>
            Accedi con il tuo account Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button" onClick={handleLoginGoogle} disabled={loading}>
                  {loading ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Login with Google
                    </>
                  )}
                </Button>
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
        Cliccando qui sotto, accetti i nostri <Link href="/terms">Termini di servizio</Link> e la nostra{" "}<Link href="/privacy">Informativa sulla privacy</Link>.
      </FieldDescription>
    </div >
  )
}
