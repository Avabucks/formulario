"use client";
import { auth } from "@/src/lib/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense } from "react";

type User = {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

declare global {
    interface Window {
        google: any;
    }
}

export function GoogleOneTapInner() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const saveUserAndRedirect = (user: User) => {
        localStorage.setItem("email", user.email ?? "");
        localStorage.setItem("name", user.displayName ?? "");
        localStorage.setItem("photoURL", user.photoURL ?? "");

        const next = searchParams.get("next") || "/home";
        router.refresh();
        router.push(next);
        (globalThis as unknown as { umami?: any }).umami?.track('created_account');
    };

    const handleGoogle = () => {
        if (!window.google) return;

        window.google.accounts.id.initialize({
            use_fedcm_for_prompt: true,
            auto_select: true,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
                const credential = GoogleAuthProvider.credential(response.credential);
                const result = await signInWithCredential(auth, credential);
                const idToken = await result.user.getIdToken();

                await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken }),
                });

                saveUserAndRedirect(result.user);
            },
            promptMomentNotification: (notification: any) => {
                if (
                    notification.isNotDisplayed() ||
                    notification.isSkippedMoment()
                ) {
                    console.log("One Tap non mostrato");
                }
            },
        });

        window.google.accounts.id.prompt();
    };

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            async
            defer
            onLoad={handleGoogle}
        />
    );
}

export function GoogleOneTap() {
    return (
        <Suspense fallback={null}>
            <GoogleOneTapInner />
        </Suspense>
    );
}