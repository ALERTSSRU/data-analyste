import type { MetadataRoute } from 'next';

/**
 * The back-office must never end up in search results: it is reachable by URL
 * and renders a login form, which is exactly the kind of page bots collect.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/login', '/api/'],
      },
    ],
  };
}
