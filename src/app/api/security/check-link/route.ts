import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json(
      { error: "Dominio obbligatorio" },
      { status: 400 },
    );
  }

  let cleanDomain = domain.trim().toLowerCase();
  try {
    if (cleanDomain.includes("://")) {
      cleanDomain = new URL(cleanDomain).hostname;
    }
    if (cleanDomain.startsWith("www.")) {
      cleanDomain = cleanDomain.substring(4);
    }
  } catch {
    // Mantieni originale se URL parsing fallisce
  }

  const resolver = new dns.Resolver();
  resolver.setServers(["1.1.1.2", "1.0.0.2"]);

  return new Promise<NextResponse>((resolve) => {
    resolver.resolve4(cleanDomain, (err, addresses) => {
      if (err?.code === "ENOTFOUND") {
        resolve(NextResponse.json({ safe: false, reason: "domain_not_found" }));
        return;
      }

      if (addresses?.includes("0.0.0.0")) {
        resolve(NextResponse.json({ safe: false, reason: "malware_blocked" }));
        return;
      }

      const quad9Resolver = new dns.Resolver();
      quad9Resolver.setServers(["9.9.9.9"]);

      quad9Resolver.resolve4(cleanDomain, (q9Err, q9Addresses) => {
        // Quad9 blocca ma Cloudflare aveva risolto → threat
        if (q9Err?.code === "ENOTFOUND" && addresses && addresses.length > 0) {
          resolve(NextResponse.json({ safe: false, reason: "threat_blocked" }));
          return;
        }

        resolve(NextResponse.json({ safe: true }));
      });
    });
  });
}
