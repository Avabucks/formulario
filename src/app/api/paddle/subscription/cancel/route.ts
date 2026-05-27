import { cancelUserSubscriptions } from "@/src/lib/paddle-server";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.uid) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const canceledCount = await cancelUserSubscriptions(session.uid);

    return NextResponse.json({ success: true, canceledCount });
  } catch {
    return NextResponse.json(
      { error: "Errore durante la cancellazione dell'abbonamento" },
      { status: 500 },
    );
  }
}
