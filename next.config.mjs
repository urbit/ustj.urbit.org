/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
