import { Button } from "@/src/components/ui/button";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { ArrowRight, Pi } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { AvatarLogic } from "../auth/avatar-logic";
import { LandingMenu } from "./landing-menu";
import { SearchLogic } from "./search-logic";

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      {...props}
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5A52.49,52.49,0,0,0,31,78.22a74.37,74.37,0,0,0,65.17,0,52.49,52.49,0,0,0,2.83,2.29,68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,122.56,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
    </svg>
  );
}

export async function Header() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

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
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <Button
          asChild
          variant="ghost"
          className="gap-1.5 bg-brand-purple/10 px-2 text-brand-purple shadow-none hover:bg-brand-purple/20 focus-visible:border-brand-purple/40 focus-visible:ring-brand-purple/20 md:px-3"
        >
          <Link
            href="https://discord.gg/uuRuWtteZ"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Entra nel server Discord"
          >
            <DiscordIcon className="h-4 w-4" />
            <span>Discord</span>
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {session.uid && <SearchLogic />}
        <div className="h-6 border-l"></div>
        {session.uid ? (
          <AvatarLogic />
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

