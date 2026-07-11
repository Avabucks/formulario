import { pool } from "@/src/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://formulario-five.vercel.app";

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-02-01").toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-04-01").toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  let pages = [...staticPages];

  try {
    // Dynamic public formulari (visibility = 2 means public in community)
    const { rows: formulari } = await pool.query(
      `SELECT beautiful_id, data_creazione 
       FROM formulari 
       WHERE visibility = 2 
       ORDER BY data_creazione DESC`,
    );

    const formulariUrls = formulari.map((f) => ({
      url: `${baseUrl}/formulario/${f.beautiful_id}`,
      lastModified: f.data_creazione
        ? new Date(f.data_creazione).toISOString()
        : new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Dynamic public capitoli belonging to public formulari
    const { rows: capitoli } = await pool.query(
      `SELECT c.beautiful_id 
       FROM capitoli c
       JOIN formulari f ON c.formulario = f.beautiful_id
       WHERE f.visibility = 2`,
    );

    const capitoliUrls = capitoli.map((c) => ({
      url: `${baseUrl}/capitolo/${c.beautiful_id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    pages = [...pages, ...formulariUrls, ...capitoliUrls];
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join("")}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
