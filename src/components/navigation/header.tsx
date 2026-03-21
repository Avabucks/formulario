import { Button } from "@/src/components/ui/button";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { Pi } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { AvatarLogic } from "../auth/avatar-logic";
import { ModeToggle } from "../theme/theme-toggler";
import { SearchLogic } from "./search-logic";

export async function Header() {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    return (
        <div className="fixed bg-background top-0 left-0 right-0 z-50 flex flex-row justify-between items-center py-3 px-2 md:px-6">
            <Link href="/" className="flex gap-2 items-center">
                <Button variant="ghost" size="icon">
                    <Pi />
                </Button>
            </Link>
            <div className="flex items-center gap-2">
                {session.uid && (
                    <>
                        <SearchLogic />
                        <div className="h-6 border-l"></div>
                    </>
                )}
                <ModeToggle />
                <div className="h-6 border-l"></div>
                {session.uid ? <AvatarLogic /> : (
                    <Link href="/login">
                        <Button variant="default" className="w-fit">
                            Accedi
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}