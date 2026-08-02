import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WebP only: the AVIF encoder hangs the dev optimizer outright (requests
    // with an image/avif Accept header never return), and at these sizes the
    // savings over WebP would be noise anyway.
    formats: ["image/webp"],
  },
};

export default nextConfig;
