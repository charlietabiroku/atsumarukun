import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "集丸くん",
    short_name: "集丸くん",
    description: "集まる日、すぐ決まる。",
    start_url: "/ja",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#34C759",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
