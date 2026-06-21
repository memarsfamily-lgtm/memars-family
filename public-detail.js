const esc = (value = '') => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
const client = window.memarsSupabase;
const typeConfig = {
  events: { table: 'events', date: 'event_date', summary: 'description', title: 'Event', base: '/events/' },
  news: { table: 'news', date: 'publish_date', summary: 'summary', title: 'News', base: '/news/' },
  reports: { table: 'reports', date: 'publication_date', summary: 'description', title: 'Report', base: '/reports/' }
};
const type = document.body.dataset.contentType;
const config = typeConfig[type];
const slug = new URLSearchParams(location.search).get('slug') || location.pathname.split('/').filter(Boolean).pop();
const setMeta = (selector, attr, value) => { let node = document.head.querySelector(selector); if (!node) { node = document.createElement('meta'); if (selector.includes('property=')) node.setAttribute('property', selector.match(/property="([^"]+)/)?.[1] || ''); else node.setAttribute('name', selector.match(/name="([^"]+)/)?.[1] || ''); document.head.appendChild(node); } node.setAttribute(attr, value); };
const setCanonical = (url) => { let link = document.querySelector('link[rel="canonical"]'); if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); } link.href = url; };
const absoluteUrl = (path) => new URL(path, location.origin).href;
const render = (row, media = []) => {
  const title = row.seo_title || row.title;
  const description = row.seo_description || row[config.summary] || `${config.title} from ME MARS FAMILY`;
  const canonical = absoluteUrl(`${config.base}${row.slug}`);
  document.title = `${title} | ME MARS FAMILY`;
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:type"]', 'content', type === 'events' ? 'event' : 'article');
  setMeta('meta[property="og:url"]', 'content', canonical);
  if (row.cover_image_url || row.og_image_url) setMeta('meta[property="og:image"]', 'content', row.cover_image_url || row.og_image_url);
  setCanonical(canonical);
  const jsonLd = { '@context': 'https://schema.org', '@type': type === 'events' ? 'Event' : type === 'reports' ? 'Report' : 'Article', name: row.title, headline: row.title, description, url: canonical, datePublished: row.published_at || row[config.date] };
  if (row.location) jsonLd.location = row.location;
  document.querySelector('[data-jsonld]').textContent = JSON.stringify(jsonLd);
  document.querySelector('[data-detail]').innerHTML = `<article class="detail-card reveal visible"><p class="eyebrow">${esc(config.title)}</p><h1>${esc(row.title)}</h1><p>${esc(row[config.date] || '')}${row.location ? ` · ${esc(row.location)}` : ''}</p><div class="rich-content">${esc(row.content || row.description || row.summary || '').replace(/\n/g, '<br>')}</div>${row.public_url ? `<p><a class="btn btn-primary" href="${row.public_url}" target="_blank" rel="noopener">Download PDF</a></p>` : ''}<div class="button-group"><a class="btn btn-light" href="/">Back to Home</a><button class="btn btn-secondary" type="button" data-share>Share</button></div></article>${media.length ? `<section class="gallery-grid">${media.map((m) => m.media_type === 'image' ? `<img class="public-media" src="${m.public_url}" alt="${esc(m.alt_text || m.caption || row.title)}" loading="lazy">` : `<video class="public-media" src="${m.public_url}" controls preload="metadata"></video>`).join('')}</section>` : ''}`;
  document.querySelector('[data-share]')?.addEventListener('click', async () => { if (navigator.share) await navigator.share({ title, text: description, url: canonical }); else await navigator.clipboard.writeText(canonical); });
};
const load = async () => {
  if (!client || !slug) { document.querySelector('[data-detail]').innerHTML = '<p class="state-message">Content is unavailable.</p>'; return; }
  const { data, error } = await client.from(config.table).select('*').eq('slug', slug).eq('status', 'published').is('deleted_at', null).maybeSingle();
  if (error || !data) { document.querySelector('[data-detail]').innerHTML = '<p class="state-message">This content is not available or has not been published.</p>'; return; }
  let media = [];
  if (type === 'events') {
    const mediaResult = await client.from('event_media').select('*').eq('event_id', data.id).eq('visibility', 'public').eq('approval_status', 'approved').is('deleted_at', null).order('sort_order');
    media = mediaResult.data || [];
  }
  render(data, media);
};
load();
