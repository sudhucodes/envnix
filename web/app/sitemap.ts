import { source } from '@/lib/source';

export default function sitemap() {
    return source.generateSitemap({
        baseUrl: 'https://example.com',
        priority: 0.8,
        changefreq: 'weekly',
        lastmod: new Date().toISOString(),
    });
}
