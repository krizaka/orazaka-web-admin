import type { NextConfig } from "next";
import path from "node:path";
import { SECURITY_HEADERS } from "./src/core/config/security-headers";
import pkg from "./package.json";
import { formatVersion, resolveSha } from "./src/core/config/app-version";

const nextConfig: NextConfig = {
  // APP_VERSION (package.json + short sha) is shown in the footer of every deployed site.
  env: { NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION || formatVersion(pkg.version, resolveSha()) },
  // An administration console: no search engine indexes it, whatever the page.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, ...SECURITY_HEADERS] }];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@krizaka/orazaka-design-system", "@krizaka/orazaka-shared", "@krizaka/ui", "@krizaka/icons", "@krizaka/intl"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
