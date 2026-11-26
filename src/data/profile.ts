// ─────────────────────────────────────────────────────────────
//  TODO el contenido del portfolio vive acá, en español e inglés.
//  Para agregar un proyecto, una experiencia o una skill, editá
//  este archivo: las páginas /  y /en/ se arman solas, y el chat
//  usa este mismo contenido para responder.
//
//  Regla de privacidad: no nombrar clientes, solo describirlos.
// ─────────────────────────────────────────────────────────────

export type Lang = 'es' | 'en';
export type L = { es: string; en: string };

export const profile = {
  name: 'Santiago Giaveno',
  role: { es: 'Desarrollador de IA y Automatización', en: 'AI & Automation Developer' } as L,
  location: { es: 'Las Parejas / Rosario, Santa Fe, Argentina', en: 'Las Parejas / Rosario, Santa Fe, Argentina' } as L,
  tagline: {
    es: 'Diseño y pongo en producción soluciones de IA para empresas: agentes conversacionales con RAG, modelos predictivos validados y pipelines de datos automatizados.',
    en: 'I design and ship AI solutions for businesses: conversational agents with RAG, validated predictive models and automated data pipelines.',
  } as L,
  // Palabras que rotan en el hero ("Construyo ___")
  rotating: {
    es: ['agentes con RAG', 'modelos predictivos', 'automatizaciones', 'pipelines de datos'],
    en: ['RAG agents', 'predictive models', 'automations', 'data pipelines'],
  },
  about: {
    es: [
      'Soy Técnico Universitario en Inteligencia Artificial (UNR). Me gusta trabajar de punta a punta: relevar qué necesita el negocio, diseñar la solución y dejarla andando en producción, no solo entrenar un modelo.',
      'Vengo de una pasantía en una fábrica, donde armé su data warehouse, un modelo de demanda y un asistente interno, y de hacer proyectos para clientes reales (agentes de WhatsApp, e-commerce con IA, automatizaciones).',
      'Ahora busco sumarme a una empresa para seguir creciendo dentro de un equipo, donde pueda aportar lo que ya llevé a producción y aprender de gente con más experiencia.',
    ],
    en: [
      'I hold a University Technician degree in Artificial Intelligence (UNR, Argentina). I like owning the whole path: understanding what the business needs, designing the solution and leaving it running in production, not just training a model.',
      'I recently finished an internship at a manufacturer, where I built their data warehouse, a demand model and an internal assistant, and I have built projects for real clients (WhatsApp agents, AI-powered e-commerce, automations).',
      "Now I'm looking to join a company and keep growing within a team, where I can bring what I've already shipped to production and learn from more experienced people.",
    ],
  },
  available: true, // muestra el badge "Abierto a empleo y proyectos"
  contact: {
    email: 'santiagogiaveno23@gmail.com',
    github: 'https://github.com/santigiaveno26',
    linkedin: 'https://www.linkedin.com/in/santiago-giaveno-b29a19195',
    // Poné `null` si no querés mostrar el WhatsApp públicamente.
    whatsapp: 'https://wa.me/543471332479' as string | null,
  },
  // CV sin nombres de clientes. Fuentes: Escritorio\CV\cv_portfolio\cv_es.html / cv_en.html
  cvs: {
    es: '/cv/CV_Santiago_Giaveno_ES.pdf',
    en: '/cv/CV_Santiago_Giaveno_EN.pdf',
  } as Record<'es' | 'en', string>,
  languages: { es: 'Español (nativo) · Inglés (B1 avanzado)', en: 'Spanish (native) · English (upper B1)' } as L,
};

// Qué busca: empleo en relación de dependencia + proyectos freelance.
// Ajustá roles, modalidad y disponibilidad a lo que realmente buscás.
export const openTo = {
  job: {
    title: { es: 'Busco sumarme a un equipo', en: 'Looking to join a team' } as L,
    text: {
      es: 'Estoy buscando mi próximo puesto en una empresa, en relación de dependencia. Quiero seguir creciendo en IA aplicada junto a un equipo, aportando lo que ya hice en producción.',
      en: "I'm looking for my next role at a company as a full-time employee. I want to keep growing in applied AI within a team, bringing what I've already shipped to production.",
    } as L,
    roles: {
      es: ['Desarrollador de IA / ML Engineer Jr.', 'Data Scientist o Analista de Datos Jr.', 'Desarrollador Python (backend y automatización)'],
      en: ['AI Developer / Junior ML Engineer', 'Junior Data Scientist or Data Analyst', 'Python Developer (backend & automation)'],
    },
    details: {
      es: ['Remoto, híbrido o presencial en Rosario y zona', 'Disponibilidad inmediata', 'Full-time o part-time'],
      en: ['Remote, hybrid or on-site in Rosario, Argentina', 'Available immediately', 'Full-time or part-time'],
    },
  },
  freelance: {
    title: { es: 'Proyectos freelance', en: 'Freelance projects' } as L,
    text: {
      es: 'Si tenés un proceso repetitivo o mucha información sin aprovechar, lo vemos juntos y te digo con honestidad si la IA lo resuelve.',
      en: "If you have a repetitive process or data you're not using, let's look at it together and I'll tell you honestly whether AI solves it.",
    } as L,
    items: {
      es: ['Agentes de atención por WhatsApp', 'Asistentes que consultan tus datos', 'Automatización de tareas y reportes'],
      en: ['WhatsApp customer-service agents', 'Assistants that query your data', 'Task and report automation'],
    },
  },
};

export const stats:{ value: number; prefix?: string; suffix?: string; label: L }[] = [
  { value: 4, label: { es: 'proyectos en producción para clientes', en: 'client projects in production' } },
  { value: 92, prefix: '~', suffix: ' %', label: { es: 'cobertura out-of-sample del modelo de demanda', en: 'out-of-sample coverage of the demand model' } },
  { value: 204, suffix: ' h', label: { es: 'de pasantía en industria', en: 'industry internship hours' } },
  { value: 24, suffix: '/7', label: { es: 'agente atendiendo clientes por WhatsApp', en: 'agent serving customers on WhatsApp' } },
];

export type Kind = 'client' | 'internship' | 'academic' | 'personal';
export const kindLabel: Record<Kind, L> = {
  client: { es: 'Cliente', en: 'Client' },
  internship: { es: 'Pasantía', en: 'Internship' },
  academic: { es: 'Académico', en: 'Academic' },
  personal: { es: 'Personal', en: 'Personal' },
};

export type Project = {
  slug: string; // página del caso: /proyectos/<slug> (contenido en data/cases.ts)
  demo?: 'agent' | 'dandia'; // tiene demo en vivo
  title: L;
  client: L;
  kind: Kind;
  status?: L;
  summary: L;
  highlights: { es: string[]; en: string[] };
  stack: string[];
  link?: { label: L; href: string };
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: 'agente-whatsapp-rag',
    demo: 'agent',
    title: { es: 'Agente de WhatsApp con Agentic RAG', en: 'WhatsApp agent with Agentic RAG' },
    client: { es: 'Empresa metalúrgica · fabricante de maquinaria', en: 'Metalworking company · machinery manufacturer' },
    kind: 'client',
    status: { es: 'En producción', en: 'In production' },
    featured: true,
    summary: {
      es: 'Agente de atención 24/7 para dos líneas de producto. Responde consultas comerciales a cualquiera y contenido técnico solo a quien ya compró la máquina.',
      en: '24/7 support agent for two product lines. It answers sales questions for anyone and technical content only for verified machine owners.',
    },
    highlights: {
      es: [
        'Acceso al contenido técnico controlado por código, no por prompt',
        'Transcribe audios y analiza fotos de fallas para orientar el diagnóstico',
        'Memoria por cliente y derivación a un operador humano tras dos fallas',
        'LLM intercambiable (Gemini, Groq, Anthropic, OpenAI) con fallback automático',
      ],
      en: [
        'Access to technical content enforced in code, not in the prompt',
        'Transcribes voice notes and analyzes photos of faults to guide diagnosis',
        'Per-customer memory and hand-off to a human operator after two failures',
        'Swappable LLM (Gemini, Groq, Anthropic, OpenAI) with automatic fallback',
      ],
    },
    stack: ['Python', 'FastAPI', 'LangChain', 'ChromaDB', 'Docker', 'Caddy', 'WhatsApp Cloud API'],
  },
  {
    slug: 'dandia-demanda',
    demo: 'dandia',
    title: { es: 'DandIA + modelo de demanda de materiales', en: 'DandIA + material demand model' },
    client: { es: 'Danda SRL · cocinas industriales', en: 'Danda SRL · industrial kitchen manufacturer' },
    kind: 'internship',
    status: { es: 'En uso por la gerencia', en: 'Used by management' },
    featured: true,
    summary: {
      es: 'Data warehouse, modelo predictivo y un asistente que responde en lenguaje natural sobre producción, inventario y compras.',
      en: 'Data warehouse, predictive model and an assistant that answers natural-language questions about production, inventory and purchasing.',
    },
    highlights: {
      es: [
        'Data warehouse en PostgreSQL (22 tablas, 18 vistas) con ETL semanal automatizado',
        'Modelo de demanda semanal con backtesting 70/30: ~92 % de cobertura out-of-sample',
        'Asistente con function-calling sobre 15+ herramientas de solo lectura y 3 proveedores de LLM',
        'Panel en Streamlit con alertas de stock y prototipo de MRP',
      ],
      en: [
        'PostgreSQL data warehouse (22 tables, 18 views) with an automated weekly ETL',
        'Weekly demand model backtested 70/30: ~92 % out-of-sample coverage',
        'Function-calling assistant over 15+ read-only tools and 3 LLM providers',
        'Streamlit dashboard with stock alerts and an MRP prototype',
      ],
    },
    stack: ['Python', 'PostgreSQL', 'Streamlit', 'scikit-learn', 'Gemini', 'Plotly'],
  },
  {
    slug: 'ecommerce-chatbot',
    title: { es: 'Tienda e-commerce con chatbot integrado', en: 'E-commerce store with built-in chatbot' },
    client: { es: 'Comercio minorista · tienda online', en: 'Retail business · online store' },
    kind: 'client',
    status: { es: 'Online', en: 'Live' },
    featured: true,
    summary: {
      es: 'Construí la tienda desde cero y le integré un asistente propio que consulta stock y productos en vivo.',
      en: 'I built the store from scratch and added a custom assistant that checks stock and products in real time.',
    },
    highlights: {
      es: [
        'Tienda en WordPress/WooCommerce armada de cero',
        'Asistente con Gemini y function-calling sobre la API de la tienda',
        'Widget en JavaScript puro, cascada de modelos y derivación a WhatsApp',
      ],
      en: [
        'WordPress/WooCommerce store built from scratch',
        'Gemini assistant with function-calling over the store API',
        'Vanilla JavaScript widget, model cascade and hand-off to WhatsApp',
      ],
    },
    stack: ['WooCommerce', 'FastAPI', 'Gemini', 'JavaScript'],
  },
  {
    slug: 'programador-whatsapp',
    title: { es: 'Programador de mensajes de WhatsApp', en: 'WhatsApp message scheduler' },
    client: { es: 'Cliente real · uso diario', en: 'Real client · daily use' },
    kind: 'client',
    status: { es: 'En uso', en: 'In use' },
    summary: {
      es: 'Servicio en segundo plano que envía mensajes personalizados en días y horarios definidos, pensado para un usuario no técnico.',
      en: 'Background service that sends personalized messages on set days and times, designed for a non-technical user.',
    },
    highlights: {
      es: ['Envíos semanales recurrentes con verificación de cada entrega', 'Registro de fallas con reintento desde el panel', 'Asistente de redacción con IA'],
      en: ['Recurring weekly sends with per-message delivery checks', 'Failure log with one-click retry', 'AI writing assistant'],
    },
    stack: ['Python', 'Playwright', 'Streamlit'],
  },
  {
    slug: 'vision-por-computadora',
    title: { es: 'Pipeline de visión por computadora en tiempo real', en: 'Real-time computer vision pipeline' },
    client: { es: 'Proyecto personal', en: 'Personal project' },
    kind: 'personal',
    summary: {
      es: 'Detección con YOLO11 y clasificación de grano fino de más de 120 razas, con búsqueda visual por similitud.',
      en: 'YOLO11 detection plus fine-grained classification of 120+ breeds, with visual similarity search.',
    },
    highlights: {
      es: ['ResNet18 con fine-tuning y data augmentation', 'Búsqueda por similitud con embeddings ResNet50 + FAISS', 'Optimizado con ONNX (fusión de capas, FP16/INT8)'],
      en: ['Fine-tuned ResNet18 with data augmentation', 'Similarity search with ResNet50 embeddings + FAISS', 'Optimized with ONNX (layer fusion, FP16/INT8)'],
    },
    stack: ['PyTorch', 'YOLO11', 'ONNX', 'FAISS', 'OpenCV'],
    link: { label: { es: 'Código en GitHub', en: 'Code on GitHub' }, href: 'https://github.com/santigiaveno26/ProyectoYolo-Resnet' },
  },
  {
    slug: 'data-warehouse-bi',
    title: { es: 'Data Warehouse y BI para una distribuidora', en: 'Data warehouse & BI for a distributor' },
    client: { es: 'Bases de Datos II · UNR', en: 'Databases II course · UNR' },
    kind: 'academic',
    summary: {
      es: 'Modelo dimensional, ETL en SSIS y 17 reportes en Power BI para una distribuidora de bebidas.',
      en: 'Dimensional model, SSIS ETL and 17 Power BI reports for a beverage distributor.',
    },
    highlights: { es: ['Modelo estrella', 'ETL en SSIS', '17 reportes en Power BI'], en: ['Star schema', 'SSIS ETL', '17 Power BI reports'] },
    stack: ['SQL Server', 'SSIS', 'Power BI'],
  },
];

export const experience: { role: L; company: L; period: L; detail: L; current: boolean }[] = [
  {
    role: { es: 'Desarrollador de IA freelance', en: 'Freelance AI developer' },
    company: { es: 'Proyectos para clientes', en: 'Client projects' },
    period: { es: '2026 – hoy', en: '2026 – present' },
    detail: { es: 'Agentes de WhatsApp, e-commerce con IA y automatizaciones a medida', en: 'WhatsApp agents, AI e-commerce and custom automations' },
    current: true,
  },
  {
    role: { es: 'Desarrollador de IA aplicada (Pasantía)', en: 'Applied AI developer (Internship)' },
    company: { es: 'Danda SRL', en: 'Danda SRL' },
    period: { es: 'Jul – Sep 2026', en: 'Jul – Sep 2026' },
    detail: { es: 'Fabricante de cocinas industriales · 204 h · Rosario', en: 'Industrial kitchen manufacturer · 204 h · Rosario' },
    current: false,
  },
  {
    role: { es: 'Técnico Universitario en Inteligencia Artificial', en: 'University Technician in Artificial Intelligence' },
    company: { es: 'Universidad Nacional de Rosario', en: 'National University of Rosario' },
    period: { es: '2022 – 2026', en: '2022 – 2026' },
    detail: { es: 'ML, visión por computadora, NLP y bases de datos', en: 'ML, computer vision, NLP and databases' },
    current: false,
  },
];

// `keywords` solo los usa el chat sin IA para encontrar el grupo correcto.
export const skills: { group: L; items: string[]; keywords: string }[] = [
  { group: { es: 'IA generativa y agentes', en: 'Generative AI & agents' }, items: ['LLM', 'RAG', 'Function-calling', 'LangChain', 'ChromaDB', 'FAISS'], keywords: 'ia ai llm genai generativa agentes agents chatbot chatbots rag embeddings vectorial vector' },
  { group: { es: 'Machine Learning y visión', en: 'Machine learning & vision' }, items: ['scikit-learn', 'XGBoost', 'PyTorch', 'OpenCV', 'YOLO', 'ONNX'], keywords: 'machine learning ml modelos models vision computer imagenes images deep learning prediccion prediction' },
  { group: { es: 'Datos y BI', en: 'Data & BI' }, items: ['PostgreSQL', 'SQL Server', 'SSIS', 'Power BI', 'Streamlit'], keywords: 'datos data database databases base bases sql bi dashboard dashboards reportes reports etl warehouse' },
  { group: { es: 'Backend y despliegue', en: 'Backend & deployment' }, items: ['Python', 'FastAPI', 'Docker', 'Git', 'n8n', 'JavaScript'], keywords: 'backend api apis deploy despliegue docker servidor server lenguajes languages programacion programming automatizacion automation' },
];

/** Texto plano con todo el perfil, para el chat (contexto del modelo y búsqueda offline). */
export function knowledge(lang: Lang): { topic: string; text: string }[] {
  const out: { topic: string; text: string }[] = [];
  out.push({ topic: 'perfil profile about sobre quien who', text: `${profile.name} — ${profile.role[lang]}. ${profile.tagline[lang]} ${profile.about[lang].join(' ')}` });
  out.push({ topic: 'ubicacion location donde where vive', text: `${profile.location[lang]}.` });
  out.push({
    topic: 'contacto contact email mail whatsapp linkedin github disponible available hire contratar',
    text: `${lang === 'es' ? 'Contacto' : 'Contact'}: ${profile.contact.email} · LinkedIn ${profile.contact.linkedin} · GitHub ${profile.contact.github}. ${profile.available ? (lang === 'es' ? 'Abierto a ofertas de empleo y a proyectos freelance.' : 'Open to job offers and freelance projects.') : ''}`,
  });
  out.push({
    topic: 'empleo trabajo job jobs work hiring hire contratar busca buscando looking open puesto rol role position equipo team empresa company remoto remote presencial onsite hibrido hybrid disponibilidad availability',
    text: `${openTo.job.text[lang]} ${lang === 'es' ? 'Roles' : 'Roles'}: ${openTo.job.roles[lang].join('; ')}. ${openTo.job.details[lang].join('. ')}. ${lang === 'es' ? 'También toma proyectos freelance.' : 'He also takes freelance projects.'}`,
  });
  out.push({
    topic: 'freelance proyecto project cliente client automatizar automate servicio service presupuesto',
    text: `${openTo.freelance.text[lang]} ${openTo.freelance.items[lang].join('; ')}.`,
  });
  for (const e of experience) {
    out.push({ topic: 'experiencia experience trabajo work pasantia internship estudios education', text: `${e.role[lang]} — ${e.company[lang]} (${e.period[lang]}): ${e.detail[lang]}.` });
  }
  for (const p of projects) {
    out.push({
      topic: `proyecto project ${kindLabel[p.kind][lang]} ${p.stack.join(' ')}`,
      text: `${p.title[lang]} (${p.client[lang]}${p.status ? ', ' + p.status[lang] : ''}): ${p.summary[lang]} ${p.highlights[lang].join('; ')}. Stack: ${p.stack.join(', ')}.`,
    });
  }
  for (const s of skills) {
    out.push({
      topic: `skills habilidades stack tecnologias technologies ${s.group.es} ${s.group.en} ${s.keywords}`,
      text: `${s.group[lang]}: ${s.items.join(', ')}.`,
    });
  }
  out.push({ topic: 'idiomas languages ingles english espanol', text: profile.languages[lang] });
  return out;
}
