import type { NextConfig } from "next";

/**
 * Baseline security headers applied to every route.
 * (A Content-Security-Policy is intentionally omitted for now: the 3D scene,
 * Supabase realtime and the on-demand translation endpoint would all need to be
 * allow-listed explicitly.)
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
