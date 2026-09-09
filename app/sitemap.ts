import { MetadataRoute } from "next";

const baseUrl = "https://hopayola.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/about",
    "/fashion",
    "/fashion/hire-a-talent",
    "/fashion/create-a-team",
    "/fashion/design-my-outfit",
    "/lifestyle",
  ];

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
}