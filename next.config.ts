import type { NextConfig } from "next";
import path from "node:path";
import pkg from "./package.json";
import { formatVersion, resolveSha } from "./src/core/config/app-version";

const nextConfig: NextConfig = {
  // APP_VERSION (package.json + short sha) is shown in the footer of every deployed site.
  // NEXT_PUBLIC_APP_ENV names the environment in the bar's badge (`dev`, `production`): this repository deploys the dev
  // console only until a production one exists, hence the default.
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION || formatVersion(pkg.version, resolveSha()),
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase() || "dev",
  },
  // An administration console: no search engine indexes it, whatever the page.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@krizaka/orazaka-design-system", "@krizaka/orazaka-shared", "@krizaka/ui", "@krizaka/icons", "@krizaka/intl"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
