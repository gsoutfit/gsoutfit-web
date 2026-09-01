import { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/db";

// Products come from Postgres now — render the sitemap per request so newly
// added products show up without waiting for a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://gentlemansavage.com";

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  try {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    const productUrls = products.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(product.createdAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const categoryUrls = categories.map((cat) => ({
      url: `${baseUrl}/shop?category=${encodeURIComponent(cat.name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...productUrls, ...categoryUrls];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticPages;
  }
}
