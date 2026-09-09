import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/sign-in", "/sign-up", "/auth"],
    },
    sitemap: "https://hopayola.com/sitemap.xml",
  };
}