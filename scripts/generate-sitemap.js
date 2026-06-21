#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const siteUrl = process.env.SITE_URL;
const supabaseUrl = process.env.MEMARS_SUPABASE_URL;
const anonKey = process.env.MEMARS_SUPABASE_ANON_KEY;
if (!siteUrl || !supabaseUrl || !anonKey) {
  console.error('SITE_URL, MEMARS_SUPABASE_URL, and MEMARS_SUPABASE_ANON_KEY are required.');
  process.exit(1);
}
const client = createClient(supabaseUrl, anonKey);
const url = (path) => `${siteUrl.replace(/\/$/, '')}${path}`;
const run = async () => {
  const staticUrls = ['/', '/#programs', '/#stories', '/#reports', '/#contact'];
  const [events, news, reports] = await Promise.all([
    client.from('events').select('slug, updated_at').eq('status', 'published').is('deleted_at', null),
    client.from('news').select('slug, updated_at').eq('status', 'published').is('deleted_at', null),
    client.from('reports').select('slug, updated_at').eq('status', 'published').is('deleted_at', null)
  ]);
  const dynamic = [
    ...(events.data || []).map((r) => `/events/${r.slug}`),
    ...(news.data || []).map((r) => `/news/${r.slug}`),
    ...(reports.data || []).map((r) => `/reports/${r.slug}`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...dynamic].map((path) => `  <url><loc>${url(path)}</loc><changefreq>weekly</changefreq></url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync('sitemap.xml', xml);
};
run().catch((error) => { console.error(error); process.exit(1); });
