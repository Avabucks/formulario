import { Button } from "@/src/components/ui/button";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { ArrowRight, Coffee, Pi } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { AvatarLogic } from "../auth/avatar-logic";
import { LandingMenu } from "./landing-menu";
import { SearchLogic } from "./search-logic";

export async function Header() {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    return (
        <div className="fixed bg-background top-0 left-0 right-0 z-50 flex flex-row justify-between items-center py-3 px-2 md:px-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <Pi />
                    </Link>
                </Button>
                {!session.uid && (
                    <LandingMenu />
                )}
                <Button asChild variant="ghost">
                    <Link href="/community/page/1">
                        Community
                    </Link>
                </Button>
            </div>
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <Button
                    asChild
                    variant="ghost"
                    className="gap-1.5 bg-purple-500/10 px-2 text-purple-700 shadow-none hover:bg-purple-500/20 hover:text-purple-900 focus-visible:border-purple-400/40 focus-visible:ring-purple-500/20 dark:bg-purple-400/10 dark:text-purple-300 dark:hover:bg-purple-400/20 dark:hover:text-purple-100 md:px-3"
                >
                    <Link
                        href="https://ko-fi.com/formulabase"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Supporta FormulaBase su Ko-fi"
                    >
                        <Coffee className="h-4 w-4" />
                        <span>Supporta<span className="hidden md:inline"> il progetto</span></span>
                    </Link>
                </Button>
            </div>
            <div className="flex items-center gap-2">
                {session.uid && (
                    <SearchLogic />
                )}
                <div className="h-6 border-l"></div>
                {session.uid ? <AvatarLogic /> : (
                    <Link href="/login">
                        <Button variant="default" className="w-fit">
                            Accedi
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}
