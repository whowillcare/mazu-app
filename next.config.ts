import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" } : {}),
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
