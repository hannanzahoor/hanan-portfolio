import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static output: no server runtime, no API routes, $0 hosting on any
  // static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).
  output: "export",
  // Next's image optimizer needs a server; unavailable under static export.
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
