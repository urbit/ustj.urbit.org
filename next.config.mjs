import { execSync } from "child_process";

// Resolve the commit the site was built from, for the debug footer. Prefer a
// CI-provided SHA (so it works on hosts without a .git dir), then fall back to
// the local git checkout, then to a placeholder.
function commitHash() {
  const fromEnv =
    process.env.NEXT_PUBLIC_COMMIT_HASH ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GITHUB_SHA;
  if (fromEnv) return fromEnv.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_COMMIT_HASH: commitHash(),
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: "path-browserify",
        events: false,
      };
    }
    if (isServer) {
      config.externals.push("_http_common");
    }
    config.resolve.alias.stream = "stream-browserify";
    config.resolve.alias.zlib = "browserify-zlib";
    return config;
  },
};

export default nextConfig;
