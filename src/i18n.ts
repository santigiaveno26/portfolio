import type { Lang } from './data/profile';

export const ui = {
  es: {
    nav: { projects: 'Proyectos', experience: 'Experiencia', skills: 'Skills', contact: 'Contacto' },
    available: 'Abierto a ofertas de empleo y proyectos',
    hello: 'Hola, soy',
    iBuild: 'Construyo',
    seeProjects: 'Ver proyectos',
    openToBtn: 'Qué estoy buscando',
    openTo: {
      label: '// qué busco',
      title: 'Abierto a sumarme a una empresa',
      sub: 'Busco empleo y, en paralelo, sigo tomando proyectos puntuales. Si alguna de las dos te sirve, hablemos.',
      jobBadge: 'Prioridad',
      roles: 'Roles que me interesan',
      jobCta: 'Contactarme por una oferta',
      jobSubject: 'Oportunidad laboral',
      freelanceCta: 'Consultar por un proyecto',
    },
    projects: {
      label: '// proyectos',
      title: 'Cosas que hice y están andando',
      sub: 'La mayoría son para clientes reales y están en uso. Por confidencialidad, describo a los clientes sin nombrarlos.',
    },
    about: { label: '// sobre mí', title: 'De la necesidad del negocio a producción', current: 'actual' },
    skills: { label: '// skills', title: 'Con qué trabajo', languages: 'Idiomas:' },
    contact: {
      label: '// contacto',
      title: '¿Buscás sumar a alguien al equipo o automatizar un proceso?',
      sub: 'Para ofertas laborales, escribime por mail o LinkedIn. Para proyectos, también por WhatsApp. Respondo rápido.',
      whatsapp: 'WhatsApp',
      waText: 'Hola Santiago, vi tu portfolio y quería consultarte.',
      emailSubject: 'Contacto desde tu portfolio',
    },
    footer: { made: 'Hecho con Astro y Claude Code', replay: 'ver la intro de nuevo' },
    switchLang: 'EN',
    switchLangLabel: 'Switch to English',
  },
  en: {
    nav: { projects: 'Projects', experience: 'Experience', skills: 'Skills', contact: 'Contact' },
    available: 'Open to job offers and projects',
    hello: "Hi, I'm",
    iBuild: 'I build',
    seeProjects: 'See projects',
    openToBtn: "What I'm looking for",
    openTo: {
      label: '// open to',
      title: 'Open to joining a company',
      sub: "I'm looking for a job and, in parallel, I still take on specific projects. If either works for you, let's talk.",
      jobBadge: 'Priority',
      roles: "Roles I'm interested in",
      jobCta: 'Contact me about a role',
      jobSubject: 'Job opportunity',
      freelanceCta: 'Ask about a project',
    },
    projects: {
      label: '// projects',
      title: 'Things I built that are running',
      sub: 'Most are for real clients and in daily use. For confidentiality, I describe clients without naming them.',
    },
    about: { label: '// about', title: 'From business need to production', current: 'current' },
    skills: { label: '// skills', title: 'What I work with', languages: 'Languages:' },
    contact: {
      label: '// contact',
      title: 'Looking to add someone to your team, or to automate a process?',
      sub: 'For job offers, reach me by email or LinkedIn. For projects, WhatsApp works too. I reply quickly.',
      whatsapp: 'WhatsApp',
      waText: 'Hi Santiago, I saw your portfolio and wanted to get in touch.',
      emailSubject: 'Contact from your portfolio',
    },
    footer: { made: 'Built with Astro and Claude Code', replay: 'replay the intro' },
    switchLang: 'ES',
    switchLangLabel: 'Cambiar a español',
  },
} as const;

export const pathFor = (lang: Lang) => (lang === 'es' ? '/' : '/en/');
export const otherLang = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');
