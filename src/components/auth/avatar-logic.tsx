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
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";
import { auth } from "@/src/lib/firebase";
import { signOut } from "firebase/auth";
import {
  BadgeInfo,
  Book,
  Coffee,
  Keyboard,
  LogOutIcon,
  Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DiscordDialog, DiscordIcon } from "../home/discord-widget";
import { NewAccountPopup } from "../home/new-account-popup";
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
          <Link href="/settings">
            <DropdownMenuItem className="cursor-pointer">
              <Avatar size="sm" className="mt-0.5">
                {photoURL && <AvatarImage src={photoURL} alt="foto profilo" />}
                <AvatarFallback>
                  {name?.substring(0, 1).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm leading-none">{name}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  Impostazioni profilo
                </span>
              </div>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <Link href="/home">
            <DropdownMenuItem>
              <Book />
              Visualizza i tuoi formulari
            </DropdownMenuItem>
          </Link>
          <Link href="/community/page/1">
            <DropdownMenuItem>
              <Users />
              Community
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpenOBPopup(true)}>
            <BadgeInfo />
            Scopri come funziona
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenKbShortcut(true)}>
            <Keyboard />
            Scorciatoie da tastiera
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpenDiscord(true)}>
            <DiscordIcon className="size-4" />
            Entra su Discord
          </DropdownMenuItem>
          <Link
            href="https://ko-fi.com/formulabase"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DropdownMenuItem>
              <Coffee />
              Supporta il progetto
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOutIcon />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <NewAccountPopup setOpen={setOpenOBPopup} open={openOBPopup} />
      <KbShortcuts setOpen={setOpenKbShortcut} open={openKbShortcut} />
      <DiscordDialog open={openDiscord} onOpenChange={setOpenDiscord} />
    </>
  );
}
