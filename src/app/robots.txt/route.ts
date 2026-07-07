export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://formulario-five.vercel.app";

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /editor/
Disallow: /settings/
Disallow: /home/

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
