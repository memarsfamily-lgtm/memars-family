const programs = [
  {
    icon: "🛡️",
    title: "Child Protection",
    points: [
      "Protecting and promoting children's rights.",
      "Preventing and combating violence against children.",
      "Promoting positive parenting practices within families.",
      "Providing tailored assistance to children facing poverty, abuse, abandonment, or other special hardships."
    ]
  },
  {
    icon: "💚",
    title: "Psychosocial Support",
    points: [
      "Providing mental health and counseling services to children and families.",
      "Supporting children and families recovering from trauma.",
      "Advocating for and supporting children and individuals living with disabilities.",
      "Conducting awareness campaigns on mental health and psychological well-being."
    ]
  },
  {
    icon: "🤝",
    title: "Family Resilience & Gender",
    points: [
      "Fostering healthy relationships and mutual support within the household.",
      "Supporting vulnerable families to build social and economic resilience.",
      "Promoting gender equality and shared responsibility in parenting and decision-making.",
      "Empowering families through socioeconomic development initiatives."
    ]
  }
];

const beneficiaries = [
  "Children from vulnerable families and their households.",
  "Families facing socio-economic distress.",
  "Children who are victims of abuse, neglect, or marginalization.",
  "Children and individuals living with disabilities, alongside their families.",
  "Families dealing with trauma or specific psychological hardships."
];

const updates = [
  {
    label: "Field Activities",
    title: "Parent training sessions",
    text: "Publish updates on positive parenting sessions, practical family support activities, and community learning circles."
  },
  {
    label: "Awareness",
    title: "Child rights campaigns",
    text: "Share verified highlights from child rights awareness campaigns, school outreach, and public protection messaging."
  },
  {
    label: "Impact",
    title: "Family testimonies",
    text: "Add approved testimonies and photo stories from Rubavu families and children served by ME MARS FAMILY."
  }
];

const gallery = [
  { label: "Rubavu photo gallery", title: "Community workshop", text: "Replace with an event photo and approved caption." },
  { label: "Training highlight", title: "Positive parenting", text: "Replace with an event photo and approved caption." },
  { label: "Safe spaces", title: "Counseling support", text: "Replace with an event photo and approved caption." },
  { label: "Child protection", title: "Rights awareness", text: "Replace with an event photo and approved caption." },
  { label: "Family resilience", title: "Household support", text: "Replace with an event photo and approved caption." },
  { label: "Inclusion", title: "Disability support", text: "Replace with an event photo and approved caption." }
];

const partners = [
  "Rubavu District Local Government",
  "Sectors and Cells of Rubavu District, including Rubavu Sector and Gikombe Cell",
  "Local Schools and Academic Institutions",
  "Community Health Centers",
  "Like-minded civil society organizations and development partners"
];

const renderList = (selector, items, template) => {
  const node = document.querySelector(selector);
  if (node) node.innerHTML = items.map(template).join("");
};

renderList("[data-programs]", programs, (program) => `
  <article class="program-card reveal">
    <div class="card-icon" aria-hidden="true">${program.icon}</div>
    <h3>${program.title}</h3>
    <ul>${program.points.map((point) => `<li>${point}</li>`).join("")}</ul>
  </article>
`);

renderList("[data-beneficiaries]", beneficiaries, (item, index) => `
  <article class="beneficiary-card reveal">
    <span aria-hidden="true">${index + 1}</span>
    <p>${item}</p>
  </article>
`);

renderList("[data-updates]", updates, (item) => `
  <article class="update-card reveal">
    <div class="update-media" data-label="${item.label}"></div>
    <div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </div>
  </article>
`);

renderList("[data-gallery]", gallery, (item) => `
  <article class="gallery-card reveal">
    <div class="gallery-media" data-label="${item.label}"></div>
    <div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </div>
  </article>
`);

renderList("[data-partners]", partners, (partner) => `<div class="partner-item">${partner}</div>`);

const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-nav-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");

toggle?.addEventListener("click", () => {
  const isOpen = navPanel.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navPanel?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const slides = [...document.querySelectorAll("[data-slide]")];
const dots = document.querySelector("[data-slider-dots]");
let currentSlide = 0;

const setSlide = (index) => {
  currentSlide = index;
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === index));
  dots?.querySelectorAll("button").forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
};

slides.forEach((_, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", `Show slide ${index + 1}`);
  button.addEventListener("click", () => setSlide(index));
  dots?.appendChild(button);
});
setSlide(0);
setInterval(() => setSlide((currentSlide + 1) % slides.length), 5000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Thank you for contacting ME MARS FAMILY. Please connect this form to a backend service before launch.");
});
