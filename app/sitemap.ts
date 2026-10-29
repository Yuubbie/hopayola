import { MetadataRoute } from "next";

const baseUrl = "https://www.hopayola.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/about",
    "/fashion",
    "/fashion/hire-a-talent",
    "/fashion/create-a-team",
    "/fashion/design-my-outfit",
    "/artisan/sign-up",
    "/shop",
    "/contact",
    "/terms",
    "/projects/new",
    "/lifestyle",
    "/custom-outfit-nigeria",
    "/hire-a-tailor",
    "/aso-ebi",
    "/wedding-outfit",
    "/artisan-jobs",
  ];

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
