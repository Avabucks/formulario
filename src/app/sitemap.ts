import { MetadataRoute } from "next";
import { pool } from "@/src/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://formulario-five.vercel.app";

  // Static routes
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-02-01"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-04-01"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  try {
    // Dynamic public formulari (visibility = 2 means public in community)
    const { rows: formulari } = await pool.query(
      `SELECT beautiful_id, data_creazione 
       FROM formulari 
       WHERE visibility = 2 
       ORDER BY data_creazione DESC`
    );

    const formulariUrls = formulari.map((f) => ({
      url: `${baseUrl}/formulario/${f.beautiful_id}`,
      lastModified: f.data_creazione ? new Date(f.data_creazione) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Dynamic public capitoli belonging to public formulari
    const { rows: capitoli } = await pool.query(
      `SELECT c.beautiful_id 
       FROM capitoli c
       JOIN formulari f ON c.formulario = f.beautiful_id
       WHERE f.visibility = 2`
    );

    const capitoliUrls = capitoli.map((c) => ({
      url: `${baseUrl}/capitolo/${c.beautiful_id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...formulariUrls, ...capitoliUrls];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
