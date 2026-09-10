import type { MetadataRoute } from "next";

/** Jangan index area privat/API internal (PRD §40). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api/"],
      },
    ],
    sitemap: "/sitemap.xml",
  };
}
