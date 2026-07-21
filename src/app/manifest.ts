import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Bolo — Voice to Text",
    short_name: "Bolo",
    description:
      "Speak naturally, listen back, and copy your words with one tap.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7ff",
    theme_color: "#635bff",
    categories: ["accessibility", "productivity", "utilities"],
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
