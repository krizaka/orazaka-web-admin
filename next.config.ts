import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@krizaka/orazaka-design-system", "@krizaka/orazaka-shared", "@krizaka/intl"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
