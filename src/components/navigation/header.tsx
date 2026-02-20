"use client"

import { Book, Pi, Search } from "lucide-react";
import { ModeToggle } from "../theme/theme-toggler";
import Link from "next/link";
import { Button } from "@/src/components/ui/button"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/src/components/ui/command"
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
    LogOutIcon,
} from "lucide-react"

export function Header() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState<string | null>(null);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    useEffect(() => {
        setName(localStorage.getItem("name"));
        setPhotoURL(localStorage.getItem("photoURL"));
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        localStorage.removeItem("photoURL");

        router.push("/");
    };

    return (
        <div className="flex flex-row justify-between items-center py-3">
            <Link href="/">
                <Button variant="ghost" size="icon">
                    <Pi />
                </Button>
            </Link>
            <div className="flex items-center gap-2">
                <div className="flex flex-col gap-4">
                    <Button onClick={() => setOpen(true)} variant="outline" className="w-fit">
                        <Search />
                        <span className="hidden md:flex">Cerca un formulario</span>
                    </Button>
                    <CommandDialog open={open} onOpenChange={setOpen}>
                        <Command shouldFilter={false}>
                            <CommandInput placeholder="Cerca un formulario..." />
                        </Command>
                    </CommandDialog>
                </div>
                <div className="h-6 border-l"></div>
                <ModeToggle />
                <div className="h-6 border-l"></div>
                {photoURL === null ? (
                    <Link href="/login">
                        <Button variant="default" className="w-fit">
                            Accedi
                        </Button>
                    </Link>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={photoURL} alt="foto profilo" />
                                    <AvatarFallback>{name?.substring(0, 1).toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{name}</DropdownMenuLabel>
                            <Link href="/home">
                                <DropdownMenuItem>
                                    <Book />
                                    Visualizza Formulari
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                <LogOutIcon />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    )
}