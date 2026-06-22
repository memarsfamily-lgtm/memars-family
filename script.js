// ==========================================
// 0. GLOBAL LANGUAGE ENGINE & DICTIONARIES
// ==========================================
let currentLang = 'en';

const translations = {
  en: {
    skip_link: "Skip to main content", nav_home: "Home", nav_about: "About Us", nav_programs: "Our Programs", nav_stories: "Success Stories", nav_reports: "Reports", nav_contact: "Contact Us",
    hero_eyebrow: "Registered Non-Governmental Organization", hero_title: "ME MARS FAMILY", hero_tagline: "Together, let us build a safe society that nurtures every child.",
    hero_intro: "ME MARS FAMILY is dedicated to improving the well-being of children and families by protecting children's rights, preventing violence and exclusion, promoting positive parenting, and empowering families to build a resilient, equitable, and sustainable future.",
    btn_learn_more: "Learn More", btn_donate: "Donate Now", slide1_title: "Child rights awareness", slide2_title: "Positive parenting training", slide3_title: "Psychosocial support", slide_placeholder: "Editable photo placeholder",
    stat_pillars: "Core intervention pillars", stat_beneficiaries: "Beneficiary groups prioritized", stat_hq: "Headquarters district", stat_mandate: "Scalable mandate with General Assembly approval",
    about_eyebrow: "About Us", about_heading: "A community-rooted organization protecting children and strengthening families.",
    about_p1: "ME MARS FAMILY works to safeguard children's rights, prevent violence and marginalization, foster positive parenting and healthy family relationships, and empower communities to achieve self-reliance.",
    about_p2: "Our primary headquarters are located in Rubavu District, Western Province, Rwanda. The organization is legally empowered to scale and implement its operations nationwide upon approval of the General Assembly.",
    vision_title: "Our Vision", vision_p: "To build a society where the well-being of every child and family is guaranteed, and where every child is protected and given equal opportunities to thrive and achieve their full potential.",
    mission_title: "Our Mission", mission_p: "To promote the well-being of children and families by safeguarding children's rights, preventing violence and marginalization, fostering positive parenting and healthy family relationships, and empowering communities to achieve self-reliance.",
    programs_eyebrow: "What We Do", programs_heading: "Our Core Pillars", programs_p: "Our programs are organized around practical, family-centered interventions that support children's safety and dignity.",
    beneficiaries_eyebrow: "Our Beneficiaries", beneficiaries_heading: "Focused support for vulnerable children, families, and communities.",
    stories_eyebrow: "News & Success Stories", stories_heading: "Field updates, event highlights, and grassroots impact.", stories_p: "Use this section to publish verified updates, testimonies, and photo galleries from Rubavu and other service areas.",
    gallery_eyebrow: "Gallery / Events", gallery_heading: "Documenting activities with dignity and consent.", gallery_p: "Editable placeholder gallery: replace these cards with provided event photos and approved captions.",
    reports_eyebrow: "Reports Library", reports_heading: "Public reports and organizational documents.", reports_p: "Download annual reports, financial reports, strategic plans, research documents, and program reports.", reports_empty: "Reports will appear here when published.",
    partners_eyebrow: "Our Partners", partners_heading: "Working hand-in-hand with local authorities and development partners.", partners_p: "ME MARS FAMILY operates under the legal compliance of its official endorsement, the 'Collaboration letter ME MARS FAMILY'.",
    donate_eyebrow: "Donate / Support Us", donate_heading: "Make a difference in the life of a child and their family today.",
    donate_p: "Your generosity directly funds grassroots interventions including child protection, safe psychosocial counseling, support for children with disabilities, positive parenting training, and socio-economic resilience tools.",
    btn_partner: "Partner With Us", btn_volunteer: "Volunteer", ways_to_give: "Ways to Give", momo_title: "Mobile Money", bank_title: "Bank Transfer",
    contact_eyebrow: "Contact Us", contact_heading: "Get in touch with ME MARS FAMILY.", hq_title: "Headquarters", hq_address: "Western Province, Rwanda<br />Rubavu District, Rubavu Sector<br />Gikombe Cell",
    label_email: "Email", label_phone: "Phone", label_social: "Social", label_name: "Full Name", label_subject: "Subject", label_message: "Your Message", btn_submit_msg: "Submit Message", form_note: "Your message is stored securely for staff review.",
    involved_eyebrow: "Get Involved", involved_heading: "Volunteer or request a partnership.", involved_p: "These accessible forms are reviewed by ME MARS FAMILY staff in Supabase-powered admin workflows.",
    title_volunteer: "Volunteer Application", btn_submit_volunteer: "Submit Volunteer Application", title_partnership: "Partnership Request", btn_submit_partnership: "Submit Partnership Request",
    footer_p: "Together, let us build a safe society that nurtures every child.", footer_links: "Quick Links", footer_follow: "Follow", footer_rights: "© 2026 ME MARS FAMILY. All Rights Reserved.", staff_access: "Staff Access",
    ph_name: "Full name", ph_email: "Email", ph_phone: "Phone", ph_skills: "Skills", ph_interests: "Interests", ph_availability: "Availability", ph_motivation: "Motivation", ph_org: "Organization", ph_contact: "Contact person", ph_proposal: "Proposal"
  },
  fr: {
    skip_link: "Passer au contenu principal", nav_home: "Accueil", nav_about: "À propos de nous", nav_programs: "Nos Programmes", nav_stories: "Histoires de Réussite", nav_reports: "Rapports", nav_contact: "Contactez-nous",
    hero_eyebrow: "Organisation Non Gouvernementale Enregistrée", hero_title: "ME MARS FAMILY", hero_tagline: "Ensemble, construisons une société sûre qui protège chaque enfant.",
    hero_intro: "ME MARS FAMILY s'engage à améliorer le bien-être des enfants et des familles en protégeant leurs droits, en prévenant la violence et l'exclusion, en promouvant une parentalité positive et en soutenant l'autonomie des communautés.",
    btn_learn_more: "En savoir plus", btn_donate: "Faire un don", slide1_title: "Sensibilisation aux droits de l'enfant", slide2_title: "Formation à la parentalité positive", slide3_title: "Soutien psychosocial", slide_placeholder: "Espace réservé modifiable",
    stat_pillars: "Piliers d'intervention centraux", stat_beneficiaries: "Groupes bénéficiaires prioritaires", stat_hq: "District du siège social", stat_mandate: "Mandat évolutif avec l'approbation de l'Assemblée",
    about_eyebrow: "À Propos de Nous", about_heading: "Une organisation enracinée dans la communauté qui protège les enfants et fortifie les familles.",
    about_p1: "ME MARS FAMILY s'efforce de sauvegarder les droits des enfants, de prévenir la violence et la marginalisation, de favoriser une parentalité positive et des relations familiales saines, et d'offrir aux communautés les moyens de devenir autonomes.",
    about_p2: "Notre siège principal est situé dans le district de Rubavu, province de l'Ouest, au Rwanda. L'organisation est légalement habilitée à étendre ses opérations à l'échelle nationale après approbation de l'Assemblée générale.",
    vision_title: "Notre Vision", vision_p: "Bâtir une société où le bien-être de chaque enfant et de chaque famille est garanti, et où chaque enfant est protégé et bénéficie de chances égales de s'épanouir et de réaliser son plein potentiel.",
    mission_title: "Notre Mission", mission_p: "Promouvoir le bien-être des enfants et des familles en préservant les droits des enfants, en prévenant la violence et la marginalisation, en favorisant une parentalité positive et des relations familiales saines, et en offrant aux communautés les moyens de devenir autonomes.",
    programs_eyebrow: "Ce que nous faisons", programs_heading: "Nos Piliers Centraux", programs_p: "Nos programmes sont organisés autour d'interventions pratiques, centrées sur la famille, qui soutiennent la sécurité et la dignité des enfants.",
    beneficiaries_eyebrow: "Nos Bénéficiaires", beneficiaries_heading: "Un soutien ciblé pour les enfants, les familles et les communautés vulnérables.",
    stories_eyebrow: "Nouvelles & Histoires", stories_heading: "Mises à jour du terrain, événements marquants et impact local.", stories_p: "Utilisez cette section pour publier des mises à jour vérifiées, des témoignages et des galeries de photos de Rubavu et d'autres zones.",
    gallery_eyebrow: "Galerie / Événements", gallery_heading: "Documenter les activités avec dignité et consentement.", gallery_p: "Galerie d'espace réservé modifiable : remplacez ces cartes par les photos d'événements fournies.",
    reports_eyebrow: "Bibliothèque", reports_heading: "Rapports publics et documents officiels.", reports_p: "Téléchargez les rapports annuels, rapports financiers, plans stratégiques et documents de recherche.", reports_empty: "Les rapports apparaîtront ici dès leur publication.",
    partners_eyebrow: "Nos Partenaires", partners_heading: "Travailler main dans la main avec les autorités locales et les partenaires.", partners_p: "ME MARS FAMILY opère en conformité légale sous son approbation officielle, la 'Collaboration letter ME MARS FAMILY'.",
    donate_eyebrow: "Faire un don", donate_heading: "Faites une différence dans la vie d'un enfant et de sa famille aujourd'hui.",
    donate_p: "Votre générosité finance directement des interventions de base, notamment la protection de l'enfance, le conseil psychosocial sûr, le soutien aux enfants handicapés, la formation à la parentalité positive et les outils de résilience socio-économique.",
    btn_partner: "Devenir Partenaire", btn_volunteer: "Devenir Bénévole", ways_to_give: "Façons de Donner", momo_title: "Mobile Money", bank_title: "Transfert Bancaire",
    contact_eyebrow: "Contactez-nous", contact_heading: "Contactez ME MARS FAMILY.", hq_title: "Siège Social", hq_address: "Province de l'Ouest, Rwanda<br />District de Rubavu, Secteur Rubavu<br />Cellule Gikombe",
    label_email: "E-mail", label_phone: "Téléphone", label_social: "Réseaux", label_name: "Nom Complet", label_subject: "Sujet", label_message: "Votre Message", btn_submit_msg: "Envoyer le Message", form_note: "Votre message est stocké en toute sécurité pour examen par le personnel.",
    involved_eyebrow: "Impliquez-vous", involved_heading: "Devenez bénévole ou demandez un partenariat.", involved_p: "Ces formulaires accessibles sont examinés par le personnel de ME MARS FAMILY dans le cadre de flux de travail administratifs optimisés par Supabase.",
    title_volunteer: "Candidature de Bénévole", btn_submit_volunteer: "Soumettre la Candidature", title_partnership: "Demande de Partenariat", btn_submit_partnership: "Soumettre la Demande",
    footer_p: "Ensemble, construisons une société sûre qui protège chaque enfant.", footer_links: "Liens Rapides", footer_follow: "Suivez-nous", footer_rights: "© 2026 ME MARS FAMILY. Tous droits réservés.", staff_access: "Accès Personnel",
    ph_name: "Nom complet", ph_email: "Adresse e-mail", ph_phone: "Téléphone", ph_skills: "Compétences", ph_interests: "Intérêts", ph_availability: "Disponibilité", ph_motivation: "Motivation", ph_org: "Organisation", ph_contact: "Personne de contact", ph_proposal: "Proposition de projet"
  },
  kiny: {
    skip_link: "Simbuka ujye ku birimo", nav_home: "Ahabanza", nav_about: "Ibyerekeye Twebwe", nav_programs: "Gahunda Zacu", nav_stories: "Inkuru z'Ibyagezweho", nav_reports: "Raporo", nav_contact: "Tuvugishe",
    hero_eyebrow: "Umuryango utegamiye kuri Leta Wanditse", hero_title: "ME MARS FAMILY", hero_tagline: "Twese hamwe, twubake umuryango utekanye urera buri mwana.",
    hero_intro: "ME MARS FAMILY yiyemeje gukomeza imibereho myiza y'abana n'imiryango binyuze mu kurengera uburenganzira bw'abana, gukumira ihohoterwa n'itandukanywa, guteza imbere uburere bwiza, no guha ubushobozi imiryango bwo kubaka ibihe biri mbere birambye.",
    btn_learn_more: "Nyura Hano", btn_donate: "Tanga Inkunga", slide1_title: "Kumenyekanisha uburenganzira bw'abana", slide2_title: "Amahugurwa ku burere bwiza", slide3_title: "Ubufasha mu ntekerezo", slide_placeholder: "Igice cy'ifoto gihindurwa",
    stat_pillars: "Inkingi z'ingezu z'ubutabazi", stat_beneficiaries: "Amatsinda y'abagenerwabikorwa bashyizwe imbere", stat_hq: "Akarere k'icyicaro gikuru", stat_mandate: "Inshingano zagurwa n'icyemezo cy'Inteko Rusange",
    about_eyebrow: "Ibyerekeye Twebwe", about_heading: "Umuryango ushingiye ku baturage urinda abana kandi ugakomeza imiryango.",
    about_p1: "ME MARS FAMILY ikora mu kurengera uburenganzira bw'abana, gukumira ihohoterwa n'itandukanywa, guteza imbere uburere bwiza n'umubano mwiza mu muryango, no guha ubushobozi abaturage bwo kwigira.",
    about_p2: "Icyicaro gikuru cyacu giherereye mu Karere ka Rubavu, Intara y'Uburengerazuba, mu Rwanda. Umuryango ufite uburenganzira bwemewe n'amategeko bwo kwagura ibikorwa byawo mu gihugu hose bimaze kwemerwa n'Inteko Rusange.",
    vision_title: "Icyerekezo Cyacu", vision_p: "Kubaka umuryango aho imibereho myiza ya buri mwana n'umuryango yizewe, kandi aho buri mwana arinzwe agahabwa amahirwe angana yo gukura no kugera ku bushobozi bwe bwose.",
    mission_title: "Inshingano Zacu", mission_p: "Guteza imbere imibereho myiza y'abana n'imiryango binyuze mu kurengera uburenganzira bw'abana, gukumira ihohoterwa n'itandukanywa, guteza imbere uburere bwiza n'umubano mwiza mu muryango, no guha ubushobozi abaturage bwo kwigira.",
    programs_eyebrow: "Ibyo Tukora", programs_heading: "Inkingi Zacu Zikuru", programs_p: "Gahunda zacu ziteguye ku buryo bw'ibikorwa bifatika, byibanda ku muryango bishyigikira umutekano n'icyubahiro cy'abana.",
    beneficiaries_eyebrow: "Abagenerwabikorwa Bacu", beneficiaries_heading: "Ubufasha bwibanda ku bana, imiryango, n'abaturage bacyeneye ubufasha.",
    stories_eyebrow: "Amakuru n'Inkuru", stories_heading: "Amakuru yo mu kibuga, ibyaranze ibikorwa, n'umusaruro ufatika.", stories_p: "Koresha iki gice ucyandikamo amakuru yizewe, ubuhamya, n'amafoto biva mu Karere ka Rubavu n'ahandi hose dukorera.",
    gallery_eyebrow: "Amafoto / Ibikorwa", gallery_heading: "Gufata amafoto y'ibikorwa mu cyubahiro n'uburenganzira.", gallery_p: "Igice cy'amafoto gihindurwa: hano hashyirwa amafoto y'ibikorwa n'ibisobanuro byemejwe.",
    reports_eyebrow: "Isomero rya Raporo", reports_heading: "Raporo n'inyandiko z'umuryango zigenewe abaturage.", reports_p: "Yana raporo z'umwaka, raporo z'imari, gahunda z'ibikorwa, inyandiko z'ubushakashatsi, n'izindi raporo za gahunda zacu.", reports_empty: "Raporo zizagaragara hano mu gihe zamaze gusohoka.",
    partners_eyebrow: "Abafanyabikorwa Bacu", partners_heading: "Gukorana urugwiro n'inzego z'ibanze n'abafanyabikorwa mu majyambere.", partners_p: "ME MARS FAMILY ikora ikurikije amategeko n'icyemezo cyayo cy'ubufatanye, 'Collaboration letter ME MARS FAMILY'.",
    donate_eyebrow: "Tanga Inkunga", donate_heading: "Hana itandukaniro mu buzima bw'umwana n'umuryango we uyu munsi.",
    donate_p: "Ubugwaneza bwawe bufasha mu buryo butaziguye ibikorwa byacu by'ibanze birimo kurengera abana, ubufasha mu ntekerezo, gushyigikira abana bafite ubumuga, amahugurwa ku burere bwiza, n'ibikoresho byo kwiteza imbere.",
    btn_partner: "Koranira Natwe", btn_volunteer: "Ba Umukorerabushake", ways_to_give: "Uburyo bwo Gutanga", momo_title: "Mobile Money", bank_title: "Kwirekura kuri Banki",
    contact_eyebrow: "Tuvugishe", contact_heading: "Ohereza ubutumwa kuri ME MARS FAMILY.", hq_title: "Icyicaro Gikuru", hq_address: "Intara y'Uburengerazuba, Rwanda<br />Akarere ka Rubavu, Umurenge wa Rubavu<br />Akagari ka Gikombe",
    label_email: "Imeli", label_phone: "Terefone", label_social: "Mbuga nkoranyambaga", label_name: "Amazina Yose", label_subject: "Imitwe y'Ubutumwa", label_message: "Ubutumwa Bwawe", btn_submit_msg: "Ohereza Ubutumwa", form_note: "Ubutumwa bwawe bubikwa mu buryo bwizewe kugira ngo busuzumwe.",
    involved_eyebrow: "Gira Ibyo Ukora", involved_heading: "Ba umukorerabushake cyangwa usabe ubufatanye.", involved_p: "Izi fomu zisuzumwa n'abakozi ba ME MARS FAMILY binyuze kuri gahunda y'ubuyobozi ikoresha Supabase.",
    title_volunteer: "Gusaba kuba Umukorerabushake", btn_submit_volunteer: "Ohereza fomu y'Ubukorerabushake", title_partnership: "Gusaba Ubufatanye", btn_submit_partnership: "Ohereza fomu y'Ubufatanye",
    footer_p: "Twese hamwe, twubake umuryango utekanye urera buri mwana.", footer_links: "Imiyoboro ya vuba", footer_follow: "Tukurikirane", footer_rights: "© 2026 ME MARS FAMILY. Uburenganzira bwose burasuguye.", staff_access: "Kwinjira nk'Umukozi",
    ph_name: "Amazina yose", ph_email: "Imeli", ph_phone: "Terefone", ph_skills: "Ibikorwa ushoboye", ph_interests: "Ibyo ukunda", ph_availability: "Uburyo uboneka", ph_motivation: "Imbaraga n'intego", ph_org: "Umuryango/Ikigo", ph_contact: "Uwo twavugisha", ph_proposal: "Umutwe w'ubufatanye"
  }
};

const localizedFallback = {
  en: {
    programs: [
      { icon: '🛡️', title: 'Child Protection', points: ['Protecting and promoting children\'s rights.', 'Preventing and combating violence against children.', 'Promoting positive parenting practices within families.', 'Providing tailored assistance to children facing hardship.'] },
      { icon: '💚', title: 'Psychosocial Support', points: ['Mental health and counseling services.', 'Trauma recovery support.', 'Disability inclusion advocacy.', 'Mental health awareness campaigns.'] },
      { icon: '🤝', title: 'Family Resilience & Gender', points: ['Healthy household relationships.', 'Social and economic resilience.', 'Gender equality in parenting and decisions.', 'Socioeconomic development initiatives.'] }
    ],
    beneficiaries: ['Children from vulnerable families and their households.', 'Families facing socio-economic distress.', 'Children who are victims of abuse, neglect, or marginalization.', 'Children and individuals living with disabilities, alongside their families.', 'Families dealing with trauma or psychological hardships.'],
    partners: ['Rubavu District Local Government', 'Local Schools and Academic Institutions', 'Community Health Centers', 'Civil society organizations and development partners']
  },
  fr: {
    programs: [
      { icon: '🛡️', title: 'Protection de l\'Enfance', points: ['Protéger et promouvoir les droits des enfants.', 'Prévenir et combattre la violence envers les enfants.', 'Promouvoir des pratiques parentales positives au sein des familles.', 'Fournir une assistance adaptée aux enfants en difficulté.'] },
      { icon: '💚', title: 'Soutien Psychosocial', points: ['Services de santé mentale et de conseil.', 'Soutien à la guérison des traumatismes.', 'Plaidoyer pour l\'inclusion des personnes handicapées.', 'Campagnes de sensibilisation à la santé mentale.'] },
      { icon: '🤝', title: 'Résilience Familiale & Genre', points: ['Relations familiales saines.', 'Résilience sociale et économique.', 'Égalité des sexes dans la parentalité et les décisions.', 'Initiatives de développement socio-économique.'] }
    ],
    beneficiaries: ['Enfants issus de familles vulnérables et leurs ménages.', 'Familles confrontées à la détresse socio-économique.', 'Enfants victimes d\'abus, de négligence ou de marginalisation.', 'Enfants et personnes vivant avec un handicap, ainsi que leurs familles.', 'Familles aux prises avec des traumatismes ou des difficultés psychologiques.'],
    partners: ['Gouvernement local du district de Rubavu', 'Écoles locales et institutions académiques', 'Centres de santé communautaires', 'Organisations de la société civile et partenaires au développement']
  },
  kiny: {
    programs: [
      { icon: '🛡️', title: 'Kurengera Umwana', points: ['Kurengera no guteza imbere uburenganzira bw\'abana.', 'Gukumira no kurwanya ihohoterwa rirorera abana.', 'Guteza imbere uburere bwiza mu miryango.', 'Guha ubufasha bwihariye abana bafite ibibazo bitoroshye.'] },
      { icon: '💚', title: 'Ubufasha mu ntekerezo', points: ['Serivisi z\'ubuzima bwo mu nmutwe na gahunda zo kugira inama.', 'Ubufasha bwo gukira ihungabana.', 'Ubuvugizi bwo gushyira mu bikorwa kwakirwa kw\'abafite ubumuga.', 'Ubukangurambaga ku buzima bwo mu mutwe.'] },
      { icon: '🤝', title: 'Gukomera k\'Umuryango & Uburinganire', points: ['Umubano mwiza mu ngo.', 'Gukomera mu mibereho no mu bukungu.', 'Uburinganire bw\'ibitsina mu burere n\'imyanzuro.', 'Ibikorwa by\'iterambere ry\'imibereho n\'ubukungu.'] }
    ],
    beneficiaries: ['Abana bakomoka mu miryango itishoboye n\'ingo zabo.', 'Imiryango iri mu kaga k\'imibereho n\'ubukungu.', 'Abana bahuye n\'ihohoterwa, kweswa cyangwa guhezwa.', 'Abana n\'abantu babana n\'ubumuga, hamwe n\'imiryango yabo.', 'Imiryango ihura n\'ihungabana cyangwa ibibazo byo mu mutwe.'],
    partners: ['Ubuyobozi bw\'Akarere ka Rubavu', 'Amashuri y\'icyo gihe n\'Ibigo by\'Uburezi', 'Ibigo by\'Ubuzima by\'Abaturage', 'Imiryango itegamiye kuri leta n\'abafanyabikorwa mu majyambere']
  }
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

// Reusable function to render local arrays based on language
const renderLanguageFallbacks = (lang) => {
  const currentFallback = localizedFallback[lang] || localizedFallback.en;
  renderList('[data-programs]', currentFallback.programs, (program) => `<article class="program-card reveal"><div class="card-icon" aria-hidden="true">${program.icon}</div><h3>${esc(program.title)}</h3><ul>${program.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul></article>`);
  renderList('[data-beneficiaries]', currentFallback.beneficiaries, (item, index) => `<article class="beneficiary-card reveal"><span aria-hidden="true">${index + 1}</span><p>${esc(item)}</p></article>`);
  renderList('[data-partners]', currentFallback.partners, (partner) => `<div class="partner-item">${esc(partner)}</div>`);
};

// 2. Render Initial Fallback UI Right Away
renderLanguageFallbacks(currentLang);

// 3. Main Data Fetching Function From Database
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

    // Populate Hero Section with dynamic language columns matching your selected state
    if (home?.data) {
      document.querySelector('#hero-title').textContent = home.data[`hero_title_${currentLang}`] || home.data.hero_title || 'ME MARS FAMILY';
      document.querySelector('.hero-tagline').textContent = home.data[`hero_subtitle_${currentLang}`] || home.data.hero_subtitle || '';
      document.querySelector('.hero-intro').textContent = home.data[`hero_intro_${currentLang}`] || home.data.hero_intro || '';
      
      const [primary, secondary] = document.querySelectorAll('.hero-copy .btn');
      if (primary) { 
        primary.textContent = home.data[`primary_cta_label_${currentLang}`] || home.data.primary_cta_label || (translations[currentLang]?.btn_learn_more || 'Learn More'); 
        primary.href = home.data.primary_cta_url || '#about'; 
      }
      if (secondary) { 
        secondary.textContent = home.data[`secondary_cta_label_${currentLang}`] || home.data.secondary_cta_label || (translations[currentLang]?.btn_donate || 'Donate Now'); 
        secondary.href = home.data.secondary_cta_url || '#donate'; 
      }
    }

    // Populate Dynamic Stats Grid
    if (stats?.data?.length) {
      renderList('.stats-grid', stats.data, (stat) => `<div class="stat reveal"><span>${esc(stat.value)}</span><p>${esc(stat[`label_${currentLang}`] || stat.label)}</p></div>`);
    }

    // Populate News & Updates
    const updates = [...(news?.data || []), ...(events?.data || [])].slice(0, 6);
    renderList('[data-updates]', updates, (item) => {
      const dbTitle = item[`title_${currentLang}`] || item.title;
      const dbSummary = item[`summary_${currentLang}`] || item.summary || item.description || '';
      return `<article class="update-card reveal"><div class="update-media" data-label="${esc(item.category || 'Event')}"></div><div><h3>${esc(dbTitle)}</h3><p>${esc(dbSummary)}</p></div></article>`;
    }, 'News and success stories will appear here when published.');

    // Populate Gallery Media Cards
    const publishedMedia = (media?.data || []).filter((item) => item.events?.status === 'published');
    renderList('[data-gallery]', publishedMedia, (item) => {
      const dbEventTitle = item.events ? (item.events[`title_${currentLang}`] || item.events.title) : 'Event media';
      const dbCaption = item[`caption_${currentLang}`] || item.caption || '';
      return `<article class="gallery-card reveal">${item.media_type === 'image' ? `<img class="public-media" loading="lazy" src="${esc(item.public_url)}" alt="${esc(item.alt_text || dbCaption || 'Event image')}">` : `<video class="public-media" controls preload="metadata" src="${esc(item.public_url)}"></video>`}<div><h3>${esc(dbEventTitle)}</h3><p>${esc(dbCaption)}</p></div></article>`;
    }, 'Gallery media will appear here when published.');

    // Populate Reports Library
    renderList('[data-reports]', reports?.data || [], (report) => {
      const dbReportTitle = report[`title_${currentLang}`] || report.title;
      const dbReportDesc = report[`description_${currentLang}`] || report.description || report.category || '';
      const downloadText = currentLang === 'fr' ? 'Télécharger PDF' : (currentLang === 'kiny' ? 'Yana PDF' : 'Download PDF');
      return `<article class="update-card reveal"><div><h3>${esc(dbReportTitle)}</h3><p>${esc(dbReportDesc)}</p><a class="btn btn-light" href="${esc(report.public_url)}" target="_blank" rel="noopener">${downloadText}</a></div></article>`;
    }, 'Reports will appear here when published.');

    // Populate Partner Brands List
    if (partners?.data?.length) {
      renderList('[data-partners]', partners.data, (partner) => `<a class="partner-item" href="${esc(partner.website_url || '#')}" aria-label="${esc(partner.alt_text || partner.name)}">${esc(partner.name)}</a>`);
    }

    // Populate Testimonials Slider
    renderList('[data-testimonials]', testimonials?.data || [], (testimonial) => {
      const dbQuote = testimonial[`quote_${currentLang}`] || testimonial.quote;
      const dbAttribution = testimonial.attribution || (currentLang === 'fr' ? 'Membre de la communauté' : (currentLang === 'kiny' ? 'Umuturage' : 'Community member'));
      return `<blockquote class="testimonial-card reveal"><p>“${esc(dbQuote)}”</p><cite>${esc(dbAttribution)}</cite></blockquote>`;
    }, 'Testimonials will appear here when published.');
  
  } catch (error) {
    console.error(error);
    client.rpc?.('log_client_error', { source: 'public_home', message: error.message, context: { path: location.pathname } });
  }
};

// ==========================================
// CENTRAL LANGUAGE ENGINE OVERLAY ENGINE
// ==========================================
const langButtons = document.querySelectorAll('.language-switcher button');

const applyLanguageSwaps = () => {
  // 1. Process standard labels
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[currentLang] && translations[currentLang][key]) {
      element.innerHTML = translations[currentLang][key];
    }
  });

  // 2. Process form input placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[currentLang] && translations[currentLang][key]) {
      element.placeholder = translations[currentLang][key];
    }
  });
};

langButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedLang = button.getAttribute('data-lang');
    if (!selectedLang) return; 

    currentLang = selectedLang;

    // Shift active classes visually
    langButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Trigger complete structural repaint
    applyLanguageSwaps();
    renderLanguageFallbacks(currentLang);
    loadPublicData();
  });
});

// ==========================================
// 4. UI Interactions (Header & Nav Panel)
// ==========================================
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

// ==========================================
// 5. Slider Core Logic Rotation
// ==========================================
const slides = [...document.querySelectorAll('[data-slide]')];
const dots = document.querySelector('[data-slider-dots]');
let currentSlide = 0;

const setSlide = (index) => {
  currentSlide = index;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  dots?.querySelectorAll('button').forEach((dot, i) => dot.classList.toggle('active', i === index));
};

if (dots) dots.innerHTML = '';
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

// ==========================================
// 6. Form Submission Logic
// ==========================================
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
  
  const successMsg = currentLang === 'fr' ? 'Merci. Votre soumission a été reçue.' : (currentLang === 'kiny' ? 'Murakoze. Imvaho yanyu yakiriwe.' : 'Thank you. Your submission has been received.');
  setFormStatus(form, successMsg, 'success');
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

// Kickoff Engines
loadPublicData();
observeReveals();
