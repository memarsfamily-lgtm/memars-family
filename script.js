const fallback = {
  programs: [
    { icon: '🛡️', title: 'Child Protection', points: ['Protecting and promoting children\'s rights.', 'Preventing and combating violence against children.', 'Promoting positive parenting practices within families.', 'Providing tailored assistance to children facing hardship.'] },
    { icon: '💚', title: 'Psychosocial Support', points: ['Mental health and counseling services.', 'Trauma recovery support.', 'Disability inclusion advocacy.', 'Mental health awareness campaigns.'] },
    { icon: '🤝', title: 'Family Resilience & Gender', points: ['Healthy household relationships.', 'Social and economic resilience.', 'Gender equality in parenting and decisions.', 'Socioeconomic development initiatives.'] }
  ],
  beneficiaries: ['Children from vulnerable families and their households.', 'Families facing socio-economic distress.', 'Children who are victims of abuse, neglect, or marginalization.', 'Children and individuals living with disabilities, alongside their families.', 'Families dealing with trauma or psychological hardships.'],
  partners: ['Rubavu District Local Government', 'Local Schools and Academic Institutions', 'Community Health Centers', 'Civil society organizations and development partners']
};

// Utilities
const esc = (value = '') => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

let revealObserver;
const observeReveals = (root = document) => root.querySelectorAll?.('.reveal').forEach((element) => revealObserver?.observe(element));

const renderList = (selector, items, template, emptyMessage = '') => {
  const node = document.querySelector(selector);
  if (!node) return;
  
  if (!items?.length) {
    if (emptyMessage) node.innerHTML = `<p class="state-message">${esc(emptyMessage)}</p>`;
    return;
  }

  node.innerHTML = items.map(template).join('');
  observeReveals(node);
};

const setLoading = (selector, text = 'Loading...') => {
  const node = document.querySelector(selector);
  if (node) node.innerHTML = `<p class="state-message">${esc(text)}</p>`;
};

const client = window.memarsSupabase;

// 1. Initial Observer Setup
revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }
}), { threshold: 0.12 });

// 2. Render Fallback UI First
renderList('[data-programs]', fallback.programs, (program) => `<article class="program-card reveal"><div class="card-icon" aria-hidden="true">${program.icon}</div><h3>${esc(program.title)}</h3><ul>${program.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul></article>`);
renderList('[data-beneficiaries]', fallback.beneficiaries, (item, index) => `<article class="beneficiary-card reveal"><span aria-hidden="true">${index + 1}</span><p>${esc(item)}</p></article>`);
renderList('[data-partners]', fallback.partners, (partner) => `<div class="partner-item">${esc(partner)}</div>`);

// 3. Main Data Fetching Function
const loadPublicData = async () => {
  if (!client) return;
  
  try {
    ['[data-updates]', '[data-gallery]', '[data-reports]'].forEach((selector) => setLoading(selector));
    
    const [home, stats, news, events, media, reports, partners, testimonials] = await Promise.all([
      client.from('homepage_settings').select('*').eq('is_active', true).is('deleted_at', null).maybeSingle(),
      client.from('impact_statistics').select('*').eq('is_active', true).is('deleted_at', null).order('sort_order'),
      client.from('news').select('*').eq('status', 'published').is('deleted_at', null).order('publish_date', { ascending: false }).limit(6),
      client.from('events').select('*').eq('status', 'published').is('deleted_at', null).order('event_date', { ascending: false }).limit(6),
      client.from('event_media').select('*, events(title,status)').eq('visibility', 'public').eq('approval_status', 'approved').is('deleted_at', null).order('sort_order').limit(12),
      client.from('reports').select('*').eq('status', 'published').is('deleted_at', null).order('publication_date', { ascending: false }).limit(6),
      client.from('partner_logos').select('*').eq('is_active', true).is('deleted_at', null).order('sort_order'),
      client.from('testimonials').select('*').eq('is_active', true).eq('consent_confirmed', true).is('deleted_at', null).order('sort_order').limit(3)
    ]);

    // Populate Hero Section
    if (home?.data) {
      document.querySelector('#hero-title').textContent = home.data.hero_title || 'ME MARS FAMILY';
      document.querySelector('.hero-tagline').textContent = home.data.hero_subtitle || '';
      document.querySelector('.hero-intro').textContent = home.data.hero_intro || '';
      
      const [primary, secondary] = document.querySelectorAll('.hero-copy .btn');
      if (primary) { primary.textContent = home.data.primary_cta_label || 'Learn More'; primary.href = home.data.primary_cta_url || '#about'; }
      if (secondary) { secondary.textContent = home.data.secondary_cta_label || 'Donate Now'; secondary.href = home.data.secondary_cta_url || '#donate'; }
    }

    // Populate Grids
    if (stats?.data?.length) {
      renderList('.stats-grid', stats.data, (stat) => `<div class="stat reveal"><span>${esc(stat.value)}</span><p>${esc(stat.label)}</p></div>`);
    }

    const updates = [...(news?.data || []), ...(events?.data || [])].slice(0, 6);
    renderList('[data-updates]', updates, (item) => `<article class="update-card reveal"><div class="update-media" data-label="${esc(item.category || 'Event')}"></div><div><h3>${esc(item.title)}</h3><p>${esc(item.summary || item.description || '')}</p></div></article>`, 'News and success stories will appear here when published.');

    const publishedMedia = (media?.data || []).filter((item) => item.events?.status === 'published');
    renderList('[data-gallery]', publishedMedia, (item) => `<article class="gallery-card reveal">${item.media_type === 'image' ? `<img class="public-media" loading="lazy" src="${esc(item.public_url)}" alt="${esc(item.alt_text || item.caption || 'Event image')}">` : `<video class="public-media" controls preload="metadata" src="${esc(item.public_url)}"></video>`}<div><h3>${esc(item.events?.title || 'Event media')}</h3><p>${esc(item.caption || '')}</p></div></article>`, 'Gallery media will appear here when published.');

    renderList('[data-reports]', reports?.data || [], (report) => `<article class="update-card reveal"><div><h3>${esc(report.title)}</h3><p>${esc(report.description || report.category)}</p><a class="btn btn-light" href="${esc(report.public_url)}" target="_blank" rel="noopener">Download PDF</a></div></article>`, 'Reports will appear here when published.');

    if (partners?.data?.length) {
      renderList('[data-partners]', partners.data, (partner) => `<a class="partner-item" href="${esc(partner.website_url || '#')}" aria-label="${esc(partner.alt_text || partner.name)}">${esc(partner.name)}</a>`);
    }

    renderList('[data-testimonials]', testimonials?.data || [], (testimonial) => `<blockquote class="testimonial-card reveal"><p>“${esc(testimonial.quote)}”</p><cite>${esc(testimonial.attribution || 'Community member')}</cite></blockquote>`, 'Testimonials will appear here when published.');
  
  } catch (error) {
    console.error(error);
    client.rpc?.('log_client_error', { source: 'public_home', message: error.message, context: { path: location.pathname } });
  }
};

// 4. UI Interactions (Header & Nav)
const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-nav-toggle]');
const navPanel = document.querySelector('[data-nav-panel]');

toggle?.addEventListener('click', () => {
  const isOpen = navPanel?.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', () => {
  navPanel?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// 5. Slider Logic
const slides = [...document.querySelectorAll('[data-slide]')];
const dots = document.querySelector('[data-slider-dots]');
let currentSlide = 0;

const setSlide = (index) => {
  currentSlide = index;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  dots?.querySelectorAll('button').forEach((dot, i) => dot.classList.toggle('active', i === index));
};

slides.forEach((_, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `Show slide ${index + 1}`);
  button.addEventListener('click', () => setSlide(index));
  dots?.appendChild(button);
});

if (slides.length) {
  setSlide(0);
  setInterval(() => setSlide((currentSlide + 1) % slides.length), 5000);
}

// 6. Form Submission Logic
const spamTrap = (form) => form.querySelector('[name="website"]')?.value;
const setFormStatus = (form, message, type = 'error') => window.MemarsFormSecurity?.showInlineStatus(form, message, type);

const submitForm = async (form, table, fields) => {
  if (!client) throw new Error('Supabase is not configured.');
  if (spamTrap(form)) return;
  
  const turnstileConfigured = form.dataset.turnstileConfigured === 'true';
  const turnstileToken = window.MemarsFormSecurity?.getTurnstileToken(form) || '';
  
  if (turnstileConfigured && !turnstileToken) {
    throw new Error('Please complete the verification challenge before submitting.');
  }
  
  const formData = new FormData(form);
  const row = {};
  fields.forEach(([from, to = from]) => { row[to] = String(formData.get(from) || '').trim(); });
  row.user_agent = navigator.userAgent;
  
  const { error } = await client.from(table).insert(row);
  if (error) throw error;
  
  form.reset();
  if (window.turnstile) window.turnstile.reset();
  setFormStatus(form, 'Thank you. Your submission has been received.', 'success');
};

document.querySelector('.contact-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try { 
    await submitForm(form, 'contact_messages', [['full-name', 'name'], ['email'], ['phone'], ['subject'], ['message']]); 
  } catch (error) { 
    setFormStatus(form, error.message || 'Unable to submit form.'); 
  }
});

document.querySelector('[data-volunteer-form]')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try { 
    await submitForm(form, 'volunteer_applications', [['full_name'], ['email'], ['phone'], ['skills'], ['interests'], ['availability'], ['motivation']]); 
  } catch (error) { 
    setFormStatus(form, error.message || 'Unable to submit form.'); 
  }
});

document.querySelector('[data-partnership-form]')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try { 
    await submitForm(form, 'partnership_requests', [['organization'], ['contact_person'], ['email'], ['phone'], ['partnership_proposal']]); 
  } catch (error) { 
    setFormStatus(form, error.message || 'Unable to submit form.'); 
  }
});

// 7. Language Switcher Logic
const translations = {
  en: {
    nav_home: "Home",
    nav_about: "About Us",
    nav_programs: "Our Programs",
    nav_stories: "Success Stories",
    nav_reports: "Reports",
    nav_contact: "Contact Us"
  },
  fr: {
    nav_home: "Accueil",
    nav_about: "À propos de nous",
    nav_programs: "Nos Programmes",
    nav_stories: "Histoires de Réussite",
    nav_reports: "Rapports",
    nav_contact: "Contactez-nous"
  },
  kiny: {
    nav_home: "Ahabanza",
    nav_about: "Ibyerekeye Twebwe",
    nav_programs: "Gahunda Zacu",
    nav_stories: "Inkuru z'Ibyagezweho",
    nav_reports: "Raporo",
    nav_contact: "Tuvugishe"
  }
};

const langButtons = document.querySelectorAll('.language-switcher button');

langButtons.forEach(button => {
  button.addEventListener('click', () => {
    // 1. Change active style immediately to verify the click works
    langButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // 2. Read language token
    const selectedLang = button.getAttribute('data-lang');
    if (!selectedLang) {
      console.error("Language switcher error: Your HTML button is missing the 'data-lang' attribute!", button);
      return;
    }

    // 3. Dynamically query and update elements matching data-i18n
    const translatableElements = document.querySelectorAll('[data-i18n]');
    translatableElements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[selectedLang] && translations[selectedLang][key]) {
        element.textContent = translations[selectedLang][key];
      }
    });
  });
});
// Kickoff
loadPublicData();
observeReveals(); // Trigger the observer scan once at the end
