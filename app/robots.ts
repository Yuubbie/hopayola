import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/admin", "/artisan/account", "/auth"],
    },
    sitemap: "https://www.hopayola.com/sitemap.xml",
  };
}
