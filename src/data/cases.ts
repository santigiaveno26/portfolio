// Casos completos de cada proyecto (páginas /proyectos/<slug> y /en/projects/<slug>).
// Regla de privacidad: describir a los clientes sin nombrarlos.

import type { L } from './profile';

type LL = { es: string[]; en: string[] };
export type Node = { label: L; sub?: L; accent?: boolean };
export type Case = {
  slug: string;
  tagline: L;
  role: L; // qué hice yo
  context: L; // tipo de cliente / contexto
  problem: LL;
  solution: LL;
  flow: Node[][]; // diagrama: columnas de izquierda a derecha
  decisions: { title: L; text: L }[];
  results: LL;
  links?: { demo?: { es: string; en: string }; repo?: string };
  confidential?: L;
};

const n = (es: string, en: string, subEs?: string, subEn?: string, accent = false): Node => ({
  label: { es, en },
  ...(subEs ? { sub: { es: subEs, en: subEn ?? subEs } } : {}),
  accent,
});

export const cases: Case[] = [
  // ───────────────────────────────────────────── 1
  {
    slug: 'agente-whatsapp-rag',
    tagline: {
      es: 'Un agente de atención que distingue entre quien todavía no compró y quien ya tiene la máquina, y que nunca filtra información técnica a quien no corresponde.',
      en: "A support agent that tells prospects apart from machine owners, and never leaks technical information to someone who shouldn't see it.",
    },
    role: { es: 'Desarrollo completo: relevamiento, arquitectura, código, pruebas y despliegue en producción.', en: 'End-to-end: discovery, architecture, code, testing and production deployment.' },
    context: { es: 'Empresa metalúrgica que fabrica dos líneas de maquinaria (agro y urbana).', en: 'Metalworking company that builds two machinery lines (farm and urban).' },
    problem: {
      es: [
        'La empresa recibe por WhatsApp dos tipos de consulta muy distintos: prospectos que preguntan qué es la máquina y dónde conseguirla, y dueños que necesitan procedimientos de mantenimiento, calibraciones y despiece.',
        'La información técnica no debía llegar a alguien que todavía no compró, y un chatbot de respuestas fijas o un LLM que "decida" qué mostrar no alcanzaba para un canal de atención real.',
      ],
      en: [
        'The company receives two very different kinds of WhatsApp inquiries: prospects asking what the machine is and where to get it, and owners who need maintenance procedures, calibrations and parts breakdowns.',
        "Technical content must not reach people who haven't bought yet, and a fixed-answer chatbot or an LLM that \"decides\" what to show was not enough for a real support channel.",
      ],
    },
    solution: {
      es: [
        'Un agente con arquitectura Agentic RAG: en vez de un router por palabras clave, el modelo elige qué herramienta consultar según la intención real. Cada línea de producto tiene dos colecciones vectoriales, una comercial (abierta) y una técnica (restringida).',
        'Cada herramienta técnica verifica en la base de datos si ese número de WhatsApp tiene acceso antes de devolver una sola línea del manual. Además transcribe audios, analiza fotos de fallas, recuerda a cada cliente y deriva a un operador humano cuando hace falta.',
      ],
      en: [
        'An Agentic RAG agent: instead of a keyword router, the model chooses which tool to call based on the actual intent. Each product line has two vector collections, a sales one (open) and a technical one (restricted).',
        'Every technical tool checks the database to see whether that WhatsApp number has access before returning a single line of the manual. It also transcribes voice notes, analyzes photos of faults, remembers each customer and hands off to a human operator when needed.',
      ],
    },
    flow: [
      [n('WhatsApp Cloud API', 'WhatsApp Cloud API', 'texto · audio · foto', 'text · audio · photo'), n('Chatwoot', 'Chatwoot', 'bandeja del operador', 'operator inbox')],
      [n('FastAPI', 'FastAPI', 'webhooks · deduplicación', 'webhooks · dedup')],
      [n('Agente', 'Agent', 'function-calling · 4 LLMs con fallback', 'function-calling · 4 LLMs with fallback', true)],
      [n('Herramientas', 'Tools', 'comercial · técnico* · institucional', 'sales · technical* · company'), n('Control de acceso', 'Access control', '*verificado en código', '*enforced in code', true)],
      [n('ChromaDB', 'ChromaDB', 'por línea y nivel', 'per line and level'), n('SQLite', 'SQLite', 'perfiles · accesos · historial', 'profiles · access · history')],
    ],
    decisions: [
      {
        title: { es: 'El control de acceso vive en el código, no en el prompt', en: 'Access control lives in code, not in the prompt' },
        text: {
          es: 'Un prompt se puede manipular ("ignorá las instrucciones…"). Por eso el modelo nunca decide si alguien ve información técnica: la herramienta consulta la base y, si no hay acceso, devuelve un rechazo. Hay tests que verifican que no se puede saltear desde el chat.',
          en: 'A prompt can be manipulated ("ignore your instructions…"). So the model never decides whether someone sees technical content: the tool checks the database and returns a refusal when there is no access. Tests verify it cannot be bypassed from the chat.',
        },
      },
      {
        title: { es: 'Colecciones clasificadas por contenido', en: 'Collections classified by content' },
        text: {
          es: 'Los manuales se vectorizan clasificando cada fragmento por lo que dice, no por el nombre del archivo, para que un dato técnico no termine en la colección abierta.',
          en: "Manuals are embedded by classifying each chunk by what it says, not by file name, so a technical detail doesn't end up in the open collection.",
        },
      },
      {
        title: { es: 'Loop de herramientas propio para Gemini', en: 'Custom tool loop for Gemini' },
        text: {
          es: 'Gemini 3 perdía su "thought signature" en la segunda vuelta de herramientas dentro del AgentExecutor de LangChain. Para ese proveedor armé un loop manual que devuelve el contenido intacto; el resto de los proveedores sigue usando LangChain.',
          en: "Gemini 3 lost its thought signature on the second tool round inside LangChain's AgentExecutor. For that provider I wrote a manual loop that returns the content untouched; the other providers still use LangChain.",
        },
      },
      {
        title: { es: 'Derivación a una persona tras dos fallas', en: 'Hand-off to a person after two failures' },
        text: {
          es: 'Si el agente no puede responder la misma consulta dos veces seguidas, deriva la conversación a un operador en Chatwoot en vez de insistir con respuestas genéricas.',
          en: 'If the agent fails to answer the same query twice in a row, it hands the conversation to an operator in Chatwoot instead of repeating generic answers.',
        },
      },
    ],
    results: {
      es: [
        'En producción, atendiendo consultas las 24 horas para dos líneas de producto.',
        'Desplegado con Docker Compose y Caddy (HTTPS automático), backup automático fuera del servidor y alertas por Telegram ante fallas.',
        'Suite de pytest que cubre el bug real de mensajes respondidos varias veces por reintentos del webhook, y que el control de acceso no se pueda saltear.',
      ],
      en: [
        'In production, answering inquiries 24/7 for two product lines.',
        'Deployed with Docker Compose and Caddy (automatic HTTPS), automatic off-server backups and Telegram alerts on failures.',
        'A pytest suite covering the real bug of messages answered several times due to webhook retries, and that access control cannot be bypassed.',
      ],
    },
    links: { demo: { es: '/demo/agente/', en: '/en/demo/agent/' } },
    confidential: {
      es: 'El sistema real usa datos del cliente, por eso la demo usa una empresa ficticia con la misma estructura.',
      en: 'The real system uses client data, so the demo uses a fictional company with the same structure.',
    },
  },

  // ───────────────────────────────────────────── 2
  {
    slug: 'dandia-demanda',
    tagline: {
      es: 'Datos, predicción y un asistente en lenguaje natural para que la gerencia de una fábrica decida qué comprar y cuándo.',
      en: "Data, forecasting and a natural-language assistant so a factory's management can decide what to buy and when.",
    },
    role: { es: 'Pasantía (204 h): diseño del data warehouse, modelos, asistente y panel.', en: 'Internship (204 h): data warehouse design, models, assistant and dashboard.' },
    context: { es: 'Danda SRL, fabricante de cocinas industriales.', en: 'Danda SRL, industrial kitchen manufacturer.' },
    problem: {
      es: [
        'La información de producción, inventario y compras estaba repartida en planillas de Excel. Había reportes de Power BI, pero no respondían lo accionable: qué material comprar, cuándo y qué tan confiable es esa estimación.',
      ],
      en: [
        "Production, inventory and purchasing data were spread across Excel spreadsheets. There were Power BI reports, but they didn't answer the actionable questions: which material to buy, when, and how reliable that estimate is.",
      ],
    },
    solution: {
      es: [
        'Un data warehouse en PostgreSQL alimentado por un ETL semanal automático, un modelo de demanda semanal por material con rango de confianza calibrado, y un panel en Streamlit con alertas de stock, proyección semanal y un prototipo de MRP que pidió el gerente.',
        'Encima, DandIA: un asistente que responde preguntas en lenguaje natural llamando a herramientas ya escritas sobre vistas de solo lectura, y que elige si mostrar la respuesta como texto, tabla, tarjetas o gráfico.',
      ],
      en: [
        'A PostgreSQL data warehouse fed by an automated weekly ETL, a weekly per-material demand model with a calibrated confidence range, and a Streamlit dashboard with stock alerts, weekly projections and an MRP prototype requested by the manager.',
        'On top of it, DandIA: an assistant that answers natural-language questions by calling pre-written tools over read-only views, and chooses whether to show the answer as text, a table, KPI cards or a chart.',
      ],
    },
    flow: [
      [n('Planillas Excel', 'Excel sheets', 'producción · compras · stock', 'production · purchasing · stock')],
      [n('ETL semanal', 'Weekly ETL', 'Programador de tareas', 'Task Scheduler')],
      [n('Data warehouse', 'Data warehouse', 'PostgreSQL · 22 tablas · 18 vistas', 'PostgreSQL · 22 tables · 18 views', true)],
      [n('Modelos', 'Models', 'demanda · clustering · co-ocurrencia', 'demand · clustering · co-occurrence'), n('DandIA', 'DandIA', '15+ herramientas · solo lectura', '15+ tools · read-only', true)],
      [n('Panel Streamlit', 'Streamlit dashboard', 'alertas · proyección · MRP', 'alerts · projection · MRP')],
    ],
    decisions: [
      {
        title: { es: 'Validar antes de llevar a producción', en: 'Validate before production' },
        text: {
          es: 'Cada modelo pasó por prototipo y backtest con datos históricos reales antes de entrar al panel. Así se descartaron XGBoost y LightGBM: no superaban al modelo propio (Poisson en dos etapas con ponderación exponencial).',
          en: 'Every model went through a prototype and a backtest on real historical data before reaching the dashboard. That is how XGBoost and LightGBM were discarded: they did not beat the in-house model (two-stage Poisson with exponential weighting).',
        },
      },
      {
        title: { es: 'Rangos de confianza que se cumplen', en: 'Confidence ranges that hold' },
        text: {
          es: 'El rango de confianza original solo contenía el valor real la mitad de las veces. Con corrección de sesgo y calibración empírica, la cobertura fuera de muestra subió a ~92 %.',
          en: 'The original confidence range contained the actual value only about half the time. With bias correction and empirical calibration, out-of-sample coverage rose to ~92%.',
        },
      },
      {
        title: { es: 'El LLM nunca escribe SQL', en: 'The LLM never writes SQL' },
        text: {
          es: 'DandIA solo puede llamar herramientas revisadas sobre vistas de solo lectura, con un usuario de base aparte que no puede escribir ni ver otras tablas. Encontré y corregí un bug real: recrear una vista borraba en silencio esos permisos.',
          en: 'DandIA can only call reviewed tools over read-only views, using a separate database user that cannot write or see other tables. I found and fixed a real bug: recreating a view silently dropped those permissions.',
        },
      },
    ],
    results: {
      es: [
        'Panel en uso por la gerencia para decidir compras.',
        'Cobertura fuera de muestra del rango de predicción: ~92 % (desde ~50 % antes de calibrar).',
        'Pipeline que se actualiza solo cada semana, sin intervención manual.',
        'Dos modelos adicionales en producción: agrupamiento de productos por forma de demanda y materiales que conviene comprar juntos.',
      ],
      en: [
        'Dashboard used by management for purchasing decisions.',
        'Out-of-sample coverage of the forecast range: ~92% (from ~50% before calibration).',
        'Pipeline that refreshes itself every week, with no manual work.',
        'Two additional models in production: product clustering by demand shape and materials worth buying together.',
      ],
    },
    confidential: {
      es: 'Los datos de la empresa son confidenciales, por eso no hay capturas del sistema real.',
      en: "The company's data is confidential, so there are no screenshots of the real system.",
    },
  },

  // ───────────────────────────────────────────── 3
  {
    slug: 'ecommerce-chatbot',
    tagline: {
      es: 'Una tienda online armada desde cero, con un asistente que consulta stock y productos en vivo y sabe cuándo pasar la conversación a una persona.',
      en: 'An online store built from scratch, with an assistant that checks live stock and products and knows when to hand the conversation to a person.',
    },
    role: { es: 'Tienda, backend del asistente y widget.', en: 'Store, assistant backend and widget.' },
    context: { es: 'Comercio minorista con tienda online.', en: 'Retail business with an online store.' },
    problem: {
      es: ['Las consultas de envíos, pagos, horarios, stock y variantes de producto llegaban todas a mano por WhatsApp, y muchas se repetían.'],
      en: ['Questions about shipping, payments, hours, stock and product variants all arrived manually on WhatsApp, and many were repetitive.'],
    },
    solution: {
      es: [
        'Construí la tienda en WordPress/WooCommerce y un widget de chat en JavaScript puro que se embebe con una sola línea. Detrás, un backend en FastAPI corre un agente de Gemini con function-calling: busca productos (stock, color, material, precio y link), responde información del negocio y deriva a una persona o al canal mayorista.',
      ],
      en: [
        'I built the store on WordPress/WooCommerce and a vanilla JavaScript chat widget that embeds with a single line. Behind it, a FastAPI backend runs a Gemini agent with function-calling: it searches products (stock, color, material, price and link), answers business questions and hands off to a person or to the wholesale channel.',
      ],
    },
    flow: [
      [n('Widget', 'Widget', 'JS puro · 1 línea en WordPress', 'vanilla JS · 1 line in WordPress')],
      [n('FastAPI', 'FastAPI', '/api/chat · historial por sesión', '/api/chat · per-session history')],
      [n('Agente Gemini', 'Gemini agent', 'function-calling · cascada de modelos', 'function-calling · model cascade', true)],
      [n('WooCommerce API', 'WooCommerce API', 'solo lectura', 'read-only'), n('Info del negocio', 'Business info', 'envíos · pagos · horarios', 'shipping · payments · hours'), n('Derivación', 'Hand-off', 'persona · mayorista', 'person · wholesale')],
    ],
    decisions: [
      {
        title: { es: 'Cascada de modelos', en: 'Model cascade' },
        text: {
          es: 'Si el modelo principal falla (nombre retirado, error, límite de uso o timeout), el agente reintenta solo con el siguiente de la lista. Google retira modelos seguido, y el chat no puede romperse por eso.',
          en: "If the main model fails (retired name, error, rate limit or timeout), the agent retries automatically with the next one. Google retires models often, and the chat can't break because of it.",
        },
      },
      {
        title: { es: 'Modo mantenimiento', en: 'Maintenance mode' },
        text: {
          es: 'Si el backend no responde, el widget no deja un chat mudo: muestra un cartel con un botón directo a WhatsApp.',
          en: "If the backend doesn't respond, the widget doesn't leave a silent chat: it shows a notice with a direct WhatsApp button.",
        },
      },
      {
        title: { es: 'Búsqueda adaptada al catálogo real', en: 'Search adapted to the real catalog' },
        text: {
          es: 'El catálogo real no tenía atributos cargados (el color y el material estaban en el nombre), así que la búsqueda prueba primero los atributos y después el nombre del producto.',
          en: 'The real catalog had no attributes (color and material were in the product name), so search tries the attributes first and then the product name.',
        },
      },
    ],
    results: {
      es: [
        'Tienda online funcionando.',
        'Asistente probado de punta a punta con una clave real contra el formato del catálogo real.',
        'Clave de WooCommerce de solo lectura: el asistente nunca puede modificar productos.',
      ],
      en: [
        'Online store live.',
        'Assistant tested end-to-end with a real key against the real catalog format.',
        'Read-only WooCommerce key: the assistant can never modify products.',
      ],
    },
  },

  // ───────────────────────────────────────────── 4
  {
    slug: 'programador-whatsapp',
    tagline: {
      es: 'Mensajes de WhatsApp personalizados que salen solos en el día y la hora elegidos, en un panel pensado para alguien que no programa.',
      en: 'Personalized WhatsApp messages that go out on their own on the chosen day and time, in a panel designed for someone who does not code.',
    },
    role: { es: 'Diseño, desarrollo, pruebas y capacitación del usuario.', en: 'Design, development, testing and user training.' },
    context: { es: 'Cliente real que envía mensajes recurrentes a sus contactos.', en: 'Real client who sends recurring messages to their contacts.' },
    problem: {
      es: ['La persona escribía y enviaba a mano, todas las semanas, los mismos mensajes personalizados a cada contacto.'],
      en: ['The person wrote and sent the same personalized messages by hand to each contact every week.'],
    },
    solution: {
      es: [
        'Un panel en Streamlit con un asistente de 3 pasos (a quién, qué y cuándo), variables como [nombre], un asistente de IA que redacta y mejora textos, y un servicio en segundo plano que envía por WhatsApp Web a la hora programada, aunque el panel esté cerrado.',
      ],
      en: [
        'A Streamlit panel with a 3-step wizard (who, what and when), variables like [name], an AI assistant that writes and improves texts, and a background service that sends through WhatsApp Web at the scheduled time, even with the panel closed.',
      ],
    },
    flow: [
      [n('Panel Streamlit', 'Streamlit panel', 'quién · qué · cuándo', 'who · what · when'), n('Asistente IA', 'AI assistant', 'Gemini Flash-Lite', 'Gemini Flash-Lite')],
      [n('SQLite', 'SQLite', 'contactos · envíos · bitácora', 'contacts · sends · log')],
      [n('Servicio', 'Service', 'ciclo cada 20 s', 'runs every 20 s', true)],
      [n('Playwright + Chrome', 'Playwright + Chrome', 'perfil persistente', 'persistent profile'), n('WhatsApp Web', 'WhatsApp Web', 'envío y confirmación', 'send and confirm')],
    ],
    decisions: [
      {
        title: { es: 'Nunca duplicar un mensaje', en: 'Never duplicate a message' },
        text: {
          es: 'Un mensaje solo cuenta como enviado si aparece un mensaje saliente nuevo y el cuadro de texto quedó vacío. Si no se puede confirmar, queda como fallido con aviso de revisar antes de reintentar; nunca vuelve solo a la cola.',
          en: "A message only counts as sent if a new outgoing message appears and the input box is empty. If it can't be confirmed, it is marked failed with a warning to check before retrying; it never re-queues itself.",
        },
      },
      {
        title: { es: 'Reducir el riesgo de bloqueo', en: 'Lower the risk of a ban' },
        text: {
          es: 'Automatizar WhatsApp Web va contra sus términos, y lo dejé explícito. Para bajar el riesgo: horario permitido, pausas aleatorias, tope diario, corte tras 3 fallas y un modo en el que la persona confirma cada envío.',
          en: 'Automating WhatsApp Web is against its terms, and I made that explicit. To lower the risk: allowed hours, random pauses, a daily cap, a stop after 3 failures and a mode where the person confirms each send.',
        },
      },
      {
        title: { es: 'Preparado para los cambios de WhatsApp', en: 'Ready for WhatsApp UI changes' },
        text: {
          es: 'Los selectores de la página están en un archivo editable con varios candidatos, y un comando de diagnóstico prueba cuáles siguen funcionando sin enviar nada.',
          en: 'Page selectors live in an editable file with several candidates, and a diagnostic command checks which ones still work without sending anything.',
        },
      },
    ],
    results: {
      es: [
        'En uso diario por el cliente.',
        'Tests de planificación, envíos semanales, servicio, interfaz completa y envío contra un simulador local de WhatsApp Web, sin tocar la cuenta real.',
      ],
      en: [
        'In daily use by the client.',
        'Tests for scheduling, weekly sends, the service, the full UI and sending against a local WhatsApp Web simulator, without touching the real account.',
      ],
    },
  },

  // ───────────────────────────────────────────── 5
  {
    slug: 'vision-por-computadora',
    tagline: {
      es: 'Un pipeline que detecta perros en una imagen, identifica la raza entre más de 120 y busca imágenes parecidas, optimizado para inferencia.',
      en: 'A pipeline that detects dogs in an image, identifies the breed among 120+ and finds similar images, optimized for inference.',
    },
    role: { es: 'Trabajo final de Visión por Computadora (UNR).', en: 'Computer Vision final project (UNR).' },
    context: { es: 'Proyecto académico en 4 etapas.', en: 'Academic project in 4 stages.' },
    problem: {
      es: ['Construir de punta a punta un sistema de visión: buscar por similitud, clasificar razas con precisión, detectar en imágenes reales y dejarlo listo para correr rápido.'],
      en: ['Build an end-to-end vision system: similarity search, accurate breed classification, detection in real images, and make it fast to run.'],
    },
    solution: {
      es: [
        'Etapa 1: buscador de imágenes por similitud con embeddings e índices FAISS. Etapa 2: comparación entre una ResNet18 con fine-tuning y una CNN propia, integradas en Gradio. Etapa 3: pipeline de YOLO11x para detectar y ResNet18 para clasificar cada detección. Etapa 4: evaluación con imágenes anotadas a mano, optimización con ONNX y cuantización, y un script de anotación automática en formatos YOLO y COCO.',
      ],
      en: [
        'Stage 1: image similarity search with embeddings and FAISS indexes. Stage 2: comparison between a fine-tuned ResNet18 and a custom CNN, integrated in Gradio. Stage 3: a pipeline with YOLO11x for detection and ResNet18 to classify each detection. Stage 4: evaluation on hand-annotated images, ONNX and quantization optimization, and an auto-annotation script in YOLO and COCO formats.',
      ],
    },
    flow: [
      [n('Imagen', 'Image')],
      [n('YOLO11x', 'YOLO11x', 'detección', 'detection', true)],
      [n('ResNet18', 'ResNet18', 'fine-tuning · 120+ razas', 'fine-tuned · 120+ breeds', true), n('Embeddings', 'Embeddings', 'ResNet50', 'ResNet50')],
      [n('Raza + caja', 'Breed + box'), n('FAISS', 'FAISS', 'imágenes similares', 'similar images')],
    ],
    decisions: [
      {
        title: { es: 'Comparar antes de elegir', en: 'Compare before choosing' },
        text: { es: 'Entrené una CNN propia y una ResNet18 con fine-tuning sobre el mismo dataset para decidir con datos cuál usar en el pipeline.', en: 'I trained a custom CNN and a fine-tuned ResNet18 on the same dataset to decide with data which one to use in the pipeline.' },
      },
      {
        title: { es: 'Optimizar para producción', en: 'Optimize for production' },
        text: { es: 'Exporté los modelos a ONNX con fusión de capas y cuantización (FP16/INT8) para reducir el tiempo de inferencia.', en: 'I exported the models to ONNX with layer fusion and quantization (FP16/INT8) to cut inference time.' },
      },
      {
        title: { es: 'Balancear clases', en: 'Balance classes' },
        text: { es: 'Apliqué data augmentation para que las razas con pocas imágenes no quedaran mal clasificadas.', en: 'I used data augmentation so breeds with few images were not misclassified.' },
      },
    ],
    results: {
      es: ['Aplicaciones en Gradio para cada etapa.', 'Pipeline evaluado contra anotaciones manuales.', 'Modelos optimizados para inferencia más rápida.'],
      en: ['Gradio apps for each stage.', 'Pipeline evaluated against manual annotations.', 'Models optimized for faster inference.'],
    },
    links: { repo: 'https://github.com/santigiaveno26/ProyectoYolo-Resnet' },
  },

  // ───────────────────────────────────────────── 6
  {
    slug: 'data-warehouse-bi',
    tagline: {
      es: 'Cinco fuentes de datos que no se hablaban entre sí, unificadas en un data warehouse y un tablero gerencial de 17 reportes.',
      en: "Five data sources that didn't talk to each other, unified into a data warehouse and a 17-report management dashboard.",
    },
    role: { es: 'Trabajo final en equipo de Bases de Datos II (UNR).', en: 'Team final project for Databases II (UNR).' },
    context: { es: 'Distribuidora de bebidas (caso académico).', en: 'Beverage distributor (academic case).' },
    problem: {
      es: ['Las ventas históricas estaban en SQL Server, las actuales en MySQL, los clientes en XML, los empleados en Excel y los productos en texto plano. La dirección necesitaba saber qué productos discontinuar, qué vendedores prometían más y cómo proyectar las ventas, y ningún sistema podía responderlo.'],
      en: ['Historical sales were in SQL Server, current sales in MySQL, customers in XML, employees in Excel and products in plain text. Management needed to know which products to discontinue, which sellers were most promising and how to forecast sales, and no system could answer that.'],
    },
    solution: {
      es: ['Un área de staging para la carga cruda, un data warehouse con esquema estrella (6 dimensiones y 2 tablas de hechos), un proceso ETL en SSIS y un tablero en Power BI con 17 reportes en 9 páginas temáticas.'],
      en: ['A staging area for raw loads, a star-schema data warehouse (6 dimensions and 2 fact tables), an SSIS ETL process and a Power BI dashboard with 17 reports across 9 themed pages.'],
    },
    flow: [
      [n('SQL Server', 'SQL Server'), n('MySQL', 'MySQL'), n('XML · Excel · TXT', 'XML · Excel · TXT')],
      [n('Staging', 'Staging', 'carga cruda', 'raw load')],
      [n('Data warehouse', 'Data warehouse', 'estrella · 6 dim + 2 hechos', 'star · 6 dims + 2 facts', true)],
      [n('Power BI', 'Power BI', '17 reportes · 9 páginas', '17 reports · 9 pages')],
    ],
    decisions: [
      {
        title: { es: 'Staging antes del modelo', en: 'Staging before the model' },
        text: { es: 'Cargar primero todo crudo en un área de staging separa los problemas de conexión de los de transformación, y no sobrecarga las bases transaccionales.', en: 'Loading everything raw into a staging area first separates connection issues from transformation issues, and avoids loading the transactional databases.' },
      },
      {
        title: { es: 'Dimensión de fecha con feriados', en: 'Date dimension with holidays' },
        text: { es: 'El calendario marca los feriados, para poder analizar ventas en días hábiles y no hábiles.', en: 'The calendar flags holidays, so sales can be analyzed on working and non-working days.' },
      },
    ],
    results: {
      es: ['Tablero gerencial con 17 reportes de negocio.', 'Respuestas a las preguntas de la dirección sobre productos, vendedores, clientes y proyección de ventas.'],
      en: ['Management dashboard with 17 business reports.', "Answers to management's questions about products, sellers, customers and sales forecasting."],
    },
    links: { repo: 'https://github.com/santigiaveno26/TP-Business-Intelligence' },
  },
];

export const caseBySlug = (slug: string) => cases.find((c) => c.slug === slug);
