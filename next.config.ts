import type { NextConfig } from "next";

// Served from https://keplerentertainment.github.io/kepler-site/, so every route
// and asset lives under /kepler-site. The build is a plain static export: no
// server, no image optimiser, nothing that needs a Node process at runtime.
const basePath = "/kepler-site";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
