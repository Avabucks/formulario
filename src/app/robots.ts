import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://formulario-five.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/editor/", "/settings/", "/home/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
