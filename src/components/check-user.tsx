"use client"

import { useRouter } from "next/navigation";

export default function CheckUser({ check }: Readonly<{ check: boolean }>) {
    const router = useRouter()

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "GET" });
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        localStorage.removeItem("photoURL");
        router.push("/");
    };

    if (!check) handleLogout();

    return (
        <></>
    )
}