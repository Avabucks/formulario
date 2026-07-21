import { Button } from "@/src/components/ui/button";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { ArrowRight, Pi } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { AvatarLogic } from "../auth/avatar-logic";
import { LandingMenu } from "./landing-menu";
import { SearchLogic } from "./search-logic";
import { DiscordTrigger } from "../shared/discord-widget";
import { GithubButton } from "../shared/github-button";

export async function Header() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  let isAdmin = false;
  if (session.uid) {
    const { rows } = await pool.query(
      `SELECT is_admin as "isAdmin" FROM users WHERE uid = $1`,
      [session.uid],
    );
    isAdmin = !!rows[0]?.isAdmin;
  }

  return (
    <div className="fixed bg-background top-0 left-0 right-0 z-50 flex flex-row justify-between items-center py-3 px-2 md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <Pi />
          </Link>
        </Button>
        {!session.uid && <LandingMenu />}
        <Button asChild variant="ghost">
          <Link href="/community/page/1">Community</Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <DiscordTrigger variant="button" />
          <GithubButton />
        </div>
        <div className="h-6 border-l"></div>
        {session.uid && (
          <>
            <SearchLogic />
            <div className="h-6 border-l"></div>
          </>
        )}
        {session.uid ? (
          <AvatarLogic isAdmin={isAdmin} />
        ) : (
          <Link href="/login">
            <Button variant="default" className="w-fit">
              Accedi
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
