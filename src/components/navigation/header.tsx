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
        <div className="flex flex-row justify-between items-center py-3">
            <Link href="/">
                <Button variant="ghost" size="icon">
                    <Pi />
                </Button>
            </Link>
            <div className="flex items-center gap-2">
                {session.uid && <SearchLogic />}
                <div className="h-6 border-l"></div>
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