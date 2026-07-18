"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { auth } from "@/src/lib/firebase";
import { signOut } from "firebase/auth";
import {
  BadgeInfo,
  Book,
  Brush,
  Cookie,
  Handshake,
  Keyboard,
  LogOutIcon,
  Shield,
  User,
  Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DiscordDialog } from "../shared/discord-widget";
import { NewAccountPopup } from "../shared/new-account-popup";
import { KbShortcuts } from "../navigation/kb-shortcuts";

export function AvatarLogic() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const [openOBPopup, setOpenOBPopup] = useState<boolean>(false);
  const [openKbShortcut, setOpenKbShortcut] = useState<boolean>(false);
  const [openDiscord, setOpenDiscord] = useState<boolean>(false);

  useEffect(() => {
    setName(localStorage.getItem("name"));
    setPhotoURL(localStorage.getItem("photoURL"));

    const alreadyClosed = localStorage.getItem("new-account-popup-closed");
    if (!alreadyClosed) {
      setOpenOBPopup(true);
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/api/auth/logout");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              {photoURL && <AvatarImage src={photoURL} alt="foto profilo" />}
              <AvatarFallback>
                {name?.substring(0, 1).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex items-center gap-2 p-1">
            <Avatar size="default" className="mt-0.5">
              {photoURL && <AvatarImage src={photoURL} alt="foto profilo" />}
              <AvatarFallback>
                {name?.substring(0, 1).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="font-medium text-sm leading-none">{name}</span>
              <Button size="icon" variant="outline" onClick={handleLogout}>
                <LogOutIcon />
              </Button>
            </div>
          </div>
          <DropdownMenuSeparator />
          <Link href="/settings">
            <DropdownMenuItem>
              <User />
              Profilo
            </DropdownMenuItem>
          </Link>
          <Link href="/settings/account">
            <DropdownMenuItem>
              <Shield />
              Account
            </DropdownMenuItem>
          </Link>
          <Link href="/home">
            <DropdownMenuItem>
              <Book />
              Visualizza i tuoi formulari
            </DropdownMenuItem>
          </Link>
          <Link href="/settings/preferences">
            <DropdownMenuItem>
              <Brush />
              Preferenze
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator />
          <Link href="/community/page/1">
            <DropdownMenuItem>
              <Users />
              Community
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onSelect={() => setOpenOBPopup(true)}>
            <BadgeInfo />
            Scopri come funziona
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenKbShortcut(true)}>
            <Keyboard />
            Scorciatoie da tastiera
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <Link href="/terms">
            <DropdownMenuItem>
              <Handshake />
              Termini e condizioni
            </DropdownMenuItem>
          </Link>
          <Link href="/privacy">
            <DropdownMenuItem>
              <Cookie />
              Privacy Policy
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
      <NewAccountPopup setOpen={setOpenOBPopup} open={openOBPopup} />
      <KbShortcuts setOpen={setOpenKbShortcut} open={openKbShortcut} />
      <DiscordDialog open={openDiscord} onOpenChange={setOpenDiscord} />
    </>
  );
}
