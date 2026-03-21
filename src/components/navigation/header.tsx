import { ModeToggle } from "../theme/theme-toggler";
import Link from "next/link";
import { Button } from "@/src/components/ui/button"
import { AvatarLogic } from "../auth/avatar-logic";
import { SearchLogic } from "./search-logic";
import { Pi } from "lucide-react";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/src/lib/session";

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