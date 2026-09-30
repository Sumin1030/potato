import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Potato",
    short_name: "Potato",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/icon.png",
        sizes: "2475x2475",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
