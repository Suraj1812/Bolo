import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_NAME} — Voice to Text & Text to Speech`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    lang: "en-IN",
    dir: "ltr",
    background_color: "#f5f7ff",
    theme_color: "#635bff",
    categories: ["accessibility", "productivity", "utilities"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/bolo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/bolo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
