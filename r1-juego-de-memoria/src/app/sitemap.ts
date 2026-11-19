import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/records"].map((ruta) => ({ url: new URL(ruta, config.urlSitio).toString() }));
}
