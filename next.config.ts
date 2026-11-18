import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second dev server (e.g. a preview) run without clobbering your main .next folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Load Neon's config/env helpers from node_modules at runtime instead of bundling them
  // (their config loader uses dynamic requires that webpack can't analyse).
  serverExternalPackages: ["@neon/config", "@neon/env"],
};

export default nextConfig;
