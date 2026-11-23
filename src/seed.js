import { INTERVIEW } from './interview.js';

export const COMPANY_SUBS = () => sub(['Read: what Lumi Advertising does & its 5 services', 'Understand the lead → appointment process (PA role!)', 'Read: who Alvina Global Partners is', 'Memorise 2 talking points about Lumi', 'Learn 8 property terms (speed-to-lead, HDB MOP...)']);
// Starting data for MONIKA WORKSPACE. Titles are [English, Indonesian] pairs.
let n = 0;
const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${(n++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export { uid };

const t = (pair, extra = {}) => ({
  id: uid('t'),
  title: { en: pair[0], id: pair[1] },
  status: 'todo',
  priority: 'medium',
  deadline: '',
  time: '',
  reminder: '',
  notes: '',
  subtasks: [],
  updatedAt: Date.now(),
  ...extra,
});
const s = (pair, tasks) => ({ id: uid('s'), name: { en: pair[0], id: pair[1] }, tasks });
const sub = (titles) => titles.map((x) => ({ id: uid('st'), title: x, done: false }));

// deadline helper relative to today
const inDays = (d) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString().slice(0, 10);
};


// Interview tasks built from Monika's Lumi Advertising preparation document.
export function buildInterviewTasks() {
  const D = INTERVIEW.date;
  const tasks = [
    t(['Interview overview: date, time, Zoom & focus areas', 'Ringkasan interview: tanggal, jam, Zoom & fokus'], { priority: 'high', deadline: D, guide: { type: 'overview' } }),
  ];
  for (const sec of INTERVIEW.sections) {
    tasks.push(t([`Practice ${sec.title} (${sec.items.map((i) => i.id.toUpperCase()).join(', ')})`, `Latihan ${sec.titleId} (${sec.items.map((i) => i.id.toUpperCase()).join(', ')})`], {
      priority: 'high', deadline: D, guide: { type: 'qa', section: sec.id },
      subtasks: sec.items.map((i) => ({ id: uid('st'), qid: i.id, title: `${i.id.toUpperCase()}: ${i.q}`, done: false })),
    }));
  }
  tasks.push(
    t(['Quick knowledge revision: 13 key terms', 'Revisi cepat: 13 istilah penting'], { priority: 'high', deadline: D, guide: { type: 'glossary' } }),
    t(['Choose 3 questions to ask the interviewer', 'Pilih 3 pertanyaan untuk interviewer'], {
      priority: 'high', deadline: D, guide: { type: 'ask' },
      subtasks: INTERVIEW.askThem.map((q) => ({ id: uid('st'), title: q, done: false })),
    }),
    t(['Final practice checklist (before Zoom)', 'Checklist terakhir (sebelum Zoom)'], {
      priority: 'high', deadline: D, time: '09:45', reminder: '10', guide: { type: 'checklist' },
      subtasks: INTERVIEW.checklist.map((q) => ({ id: uid('st'), title: q, done: false })),
    }),
  );
  return tasks;
}

export function buildSeedProjects() {
  return [
    {
      id: 'career',
      key: 'A',
      category: 'career',
      name: { en: 'Career & Interview', id: 'Karier & Interview' },
      description: {
        en: 'Land the Lumi Advertising PA role and build a strong remote career.',
        id: 'Lolos interview PA Lumi Advertising dan bangun karier remote yang kuat.',
      },
      notes: '',
      sections: [
        s(['Interview preparation · Lumi Advertising', 'Persiapan interview · Lumi Advertising'], [
          ...buildInterviewTasks(),
          t(['Research Alvina Global Partners and Lumi Advertising', 'Riset Alvina Global Partners dan Lumi Advertising'], {
            priority: 'high', deadline: INTERVIEW.date, guide: { type: 'company' },
            subtasks: COMPANY_SUBS(),
          }),
        ]),
        s(['Sales & marketing skills', 'Skill sales & marketing'], [
          t(['Study sales and marketing fundamentals', 'Belajar dasar sales dan marketing'], { deadline: inDays(7) }),
          t(['Learn lead generation & prospecting', 'Belajar lead generation & prospecting'], { deadline: inDays(9) }),
          t(['Learn sales funnels', 'Belajar sales funnel'], { deadline: inDays(10) }),
          t(['Learn cold calling and cold emailing', 'Belajar cold calling dan cold email'], { deadline: inDays(12) }),
          t(['Learn client communication and follow-ups', 'Belajar komunikasi klien dan follow-up'], { deadline: inDays(12) }),
          t(['Understand CRM management', 'Pahami manajemen CRM'], {
            deadline: inDays(14), subtasks: sub(['HubSpot basics', 'Pipeline stages', 'Logging activities & notes']),
          }),
        ]),
        s(['Job search', 'Cari kerja'], [
          t(['Research remote international jobs', 'Riset lowongan remote internasional'], { priority: 'medium', deadline: inDays(10) }),
          t(['Prepare applications and follow-ups', 'Siapkan lamaran dan follow-up'], {
            deadline: inDays(14), subtasks: sub(['Update CV', 'Update LinkedIn', 'Cover letter template', 'Follow-up email template']),
          }),
          t(['Improve professional skills', 'Tingkatkan skill profesional'], { priority: 'low' }),
        ]),
      ],
    },
    {
      id: 'elevara',
      key: 'B',
      category: 'elevara',
      name: { en: 'Elevara', id: 'Elevara' },
      description: {
        en: 'Agency for business support, creative services and academic services.',
        id: 'Agensi layanan bisnis, kreatif, dan akademik.',
      },
      notes: '',
      sections: [
        s(['Website', 'Website'], [
          t(['Finalize homepage and website structure', 'Finalisasi homepage dan struktur website'], { priority: 'high', deadline: inDays(5) }),
          t(['Create About page', 'Buat halaman About']),
          t(['Create Business Services page', 'Buat halaman Business Services']),
          t(['Create Creative Services page', 'Buat halaman Creative Services']),
          t(['Create Academic Services page', 'Buat halaman Academic Services']),
          t(['Add contact information', 'Tambah informasi kontak'], { priority: 'low' }),
          t(['Create portfolio section', 'Buat bagian portfolio']),
          t(['Test mobile responsiveness and publish', 'Tes tampilan mobile dan publish'], { deadline: inDays(14) }),
        ]),
        s(['Portfolio', 'Portfolio'], [
          t(['Carousel design samples', 'Contoh desain carousel']),
          t(['Instagram feed designs', 'Desain feed Instagram']),
          t(['Reels editing samples', 'Contoh editing Reels']),
          t(['Content calendars and social media strategies', 'Contoh kalender konten dan strategi sosmed']),
          t(['Video production samples', 'Contoh produksi video']),
          t(['Website and landing page samples', 'Contoh website dan landing page']),
          t(['Brand positioning and marketing strategy samples', 'Contoh brand positioning dan strategi marketing']),
        ]),
        s(['Business materials', 'Materi bisnis'], [
          t(['Company profile', 'Company profile'], { priority: 'high', deadline: inDays(7) }),
          t(['Business services presentation', 'Presentasi layanan bisnis']),
          t(['Student services presentation', 'Presentasi layanan pelajar']),
          t(['Portfolio presentation', 'Presentasi portfolio']),
          t(['Service packages and pricing', 'Paket layanan dan harga'], { priority: 'high', deadline: inDays(8) }),
          t(['Proposal template', 'Template proposal']),
          t(['Client onboarding template', 'Template onboarding klien']),
        ]),
        s(['Instagram (designed manually in Canva)', 'Instagram (desain manual di Canva)'], [
          t(['Introduction carousel', 'Carousel perkenalan'], { priority: 'high', deadline: inDays(4) }),
          t(['Services carousel', 'Carousel layanan']),
          t(['Business services carousel', 'Carousel layanan bisnis']),
          t(['Academic services carousel', 'Carousel layanan akademik']),
          t(['Creative services carousel', 'Carousel layanan kreatif']),
          t(['How Elevara works carousel', 'Carousel cara kerja Elevara']),
          t(['CTA carousel', 'Carousel CTA']),
          t(['Edit existing Reels footage with my sister', 'Edit footage Reels bersama kakak/adik'], { deadline: inDays(6) }),
          t(['Create captions and posting schedule', 'Buat caption dan jadwal posting']),
        ]),
        s(['Client acquisition', 'Akuisisi klien'], [
          t(['Define ideal clients', 'Tentukan klien ideal'], { priority: 'high' }),
          t(['Find international prospects', 'Cari prospek internasional']),
          t(['Create prospect database', 'Buat database prospek']),
          t(['Prepare cold emails and Instagram outreach', 'Siapkan cold email dan outreach Instagram']),
          t(['Create sales pitch and follow-up templates', 'Buat sales pitch dan template follow-up']),
          t(['Track potential clients', 'Pantau calon klien']),
        ]),
        s(['Operations', 'Operasional'], [
          t(['Define team responsibilities', 'Tentukan tanggung jawab tim']),
          t(['Create client workflows', 'Buat alur kerja klien']),
          t(['Organize files and project tracking', 'Rapikan file dan tracking project'], { priority: 'low' }),
          t(['Establish quality control', 'Buat standar quality control'], { priority: 'low' }),
        ]),
      ],
    },
    {
      id: 'sister',
      key: 'C',
      category: 'sister',
      name: { en: "Sister's Business", id: 'Bisnis Kakak/Adik' },
      description: { en: 'A small business in Bali.', id: 'Usaha kecil di Bali.' },
      notes: '',
      sections: [
        s(['Branding', 'Branding'], [
          t(['Finalize business name and positioning', 'Finalisasi nama bisnis dan positioning'], { priority: 'high', deadline: inDays(5) }),
          t(['Define target customers', 'Tentukan target customer'], { priority: 'high' }),
          t(['Create logo, colors and visual identity', 'Buat logo, warna, dan identitas visual']),
          t(['Design menu and promotional materials', 'Desain menu dan materi promosi']),
        ]),
        s(['Instagram', 'Instagram'], [
          t(['Create new Instagram account', 'Buat akun Instagram baru']),
          t(['Design profile and highlights', 'Desain profil dan highlight']),
          t(['Create first 9 posts', 'Buat 9 postingan pertama']),
          t(['Design product carousels', 'Desain carousel produk']),
          t(['Edit existing Reels', 'Edit Reels yang sudah ada']),
          t(['Create captions and content calendar', 'Buat caption dan kalender konten']),
        ]),
        s(['Marketing', 'Marketing'], [
          t(['Research competitors and local customers', 'Riset kompetitor dan customer lokal']),
          t(['Plan organic Instagram marketing', 'Rencanakan marketing Instagram organik']),
          t(['Develop TikTok strategy', 'Susun strategi TikTok']),
          t(['Research Instagram advertisements', 'Riset iklan Instagram'], { priority: 'low' }),
          t(['Set advertising budget', 'Tentukan budget iklan'], { priority: 'low' }),
          t(['Create promotional campaigns', 'Buat kampanye promosi']),
          t(['Track engagement and sales', 'Pantau engagement dan penjualan']),
        ]),
        s(['Business strategy', 'Strategi bisnis'], [
          t(['Finalize products and menu', 'Finalisasi produk dan menu'], { priority: 'high' }),
          t(['Calculate costs, selling prices and profit margins', 'Hitung modal, harga jual, dan margin profit'], { priority: 'high' }),
          t(['Estimate expenses', 'Estimasi pengeluaran']),
          t(['Set sales targets', 'Tentukan target penjualan']),
          t(['Create simple financial projections', 'Buat proyeksi keuangan sederhana']),
        ]),
      ],
    },
    {
      id: 'personal',
      key: 'D',
      category: 'personal',
      name: { en: 'Personal Brand', id: 'Personal Brand' },
      description: {
        en: 'Build my Instagram and YouTube presence through simple, consistent content.',
        id: 'Bangun Instagram dan YouTube lewat konten sederhana yang konsisten.',
      },
      notes: '',
      sections: [
        s(['Foundation', 'Fondasi'], [
          t(['Define my niche, audience and content pillars', 'Tentukan niche, audiens, dan pilar konten'], { priority: 'high' }),
          t(['Optimize Instagram bio and highlights', 'Optimasi bio dan highlight Instagram']),
          t(['Set up YouTube channel (banner, about, sections)', 'Siapkan channel YouTube (banner, about, section)']),
        ]),
        s(['Content', 'Konten'], [
          t(['Plan 10 simple content ideas', 'Rencanakan 10 ide konten sederhana']),
          t(['Film first 3 short videos / Reels', 'Rekam 3 video pendek / Reels pertama']),
          t(['Edit and post first YouTube video', 'Edit dan upload video YouTube pertama']),
          t(['Create a weekly posting routine', 'Buat rutinitas posting mingguan']),
        ]),
        s(['Growth', 'Pertumbuhan'], [
          t(['Engage with my niche community daily', 'Interaksi dengan komunitas niche setiap hari'], { priority: 'low' }),
          t(['Review monthly analytics', 'Review analytics bulanan'], { priority: 'low' }),
        ]),
      ],
    },
  ];
}


export function buildThesisProject() {
  return {
    id: 'thesis',
    key: 'E',
    category: 'study',
    name: { en: 'University & Thesis (UNPAB)', id: 'Kuliah & Skripsi (UNPAB)' },
    description: {
      en: 'From title approval to thesis defense, one chapter at a time.',
      id: 'Dari pengajuan judul sampai sidang, satu bab demi satu bab.',
    },
    notes: '',
    sections: [
      s(['Administration & supervision', 'Administrasi & bimbingan'], [
        t(['Consult thesis title with supervisor', 'Konsultasi judul dengan dosen pembimbing'], { priority: 'high' }),
        t(['Submit title & get supervisor decree (SK)', 'Ajukan judul & urus SK pembimbing'], { priority: 'high' }),
        t(['Set a regular supervision schedule', 'Atur jadwal bimbingan rutin']),
      ]),
      s(['Chapter 1: Introduction', 'Bab 1: Pendahuluan'], [
        t(['Background of the study', 'Latar belakang masalah']),
        t(['Problem identification & formulation', 'Identifikasi & rumusan masalah']),
        t(['Objectives & benefits of the research', 'Tujuan & manfaat penelitian']),
      ]),
      s(['Chapter 2: Literature review', 'Bab 2: Tinjauan pustaka'], [
        t(['Collect 20+ journals & references (Mendeley)', 'Kumpulkan 20+ jurnal & referensi (Mendeley)'], { subtasks: sub(['National journals (SINTA)', 'International journals', 'Textbooks']) }),
        t(['Theoretical framework', 'Landasan teori']),
        t(['Previous studies table', 'Tabel penelitian terdahulu']),
        t(['Conceptual framework & hypotheses', 'Kerangka konseptual & hipotesis']),
      ]),
      s(['Chapter 3: Methodology', 'Bab 3: Metodologi penelitian'], [
        t(['Research type, location & time', 'Jenis, lokasi & waktu penelitian']),
        t(['Population & sample', 'Populasi & sampel']),
        t(['Variables & questionnaire / instrument', 'Variabel & kuesioner / instrumen']),
        t(['Data analysis technique (SPSS)', 'Teknik analisis data (SPSS)']),
      ]),
      s(['Proposal seminar', 'Seminar proposal'], [
        t(['Prepare proposal slides', 'Siapkan slide seminar proposal']),
        t(['Revise after the proposal seminar', 'Revisi setelah seminar proposal']),
      ]),
      s(['Chapters 4–5: Results & conclusion', 'Bab 4–5: Hasil & kesimpulan'], [
        t(['Collect data / distribute questionnaire', 'Kumpulkan data / sebar kuesioner']),
        t(['Process data in SPSS (validity, reliability, tests)', 'Olah data di SPSS (validitas, reliabilitas, uji)']),
        t(['Write results & discussion', 'Tulis hasil & pembahasan']),
        t(['Conclusion & recommendations', 'Kesimpulan & saran']),
      ]),
      s(['Thesis defense', 'Sidang skripsi'], [
        t(['Abstract (ID & EN) and references', 'Abstrak (ID & EN) dan daftar pustaka']),
        t(['Plagiarism check (Turnitin)', 'Cek plagiarisme (Turnitin)']),
        t(['Defense slides & practice presentation', 'Slide sidang & latihan presentasi']),
        t(['Final revision & binding', 'Revisi akhir & jilid']),
      ]),
    ],
  };
}

// Calendar categories. Each color has one meaning.
export const CATEGORIES = [
  { id: 'career', color: '#5B8DEF', bg: '#EAF1FE', name: { en: 'Career', id: 'Karier' } },
  { id: 'elevara', color: '#8B6FE0', bg: '#F1ECFD', name: { en: 'Elevara', id: 'Elevara' } },
  { id: 'sister', color: '#E8935A', bg: '#FDF0E6', name: { en: "Sister's business", id: 'Bisnis kakak/adik' } },
  { id: 'personal', color: '#E46FA4', bg: '#FCEBF3', name: { en: 'Personal brand', id: 'Personal brand' } },
  { id: 'study', color: '#9C6B30', bg: '#F5ECE0', name: { en: 'University', id: 'Kuliah' } },
  { id: 'content', color: '#3FB28A', bg: '#E5F6EF', name: { en: 'Content & editing', id: 'Konten & editing' } },
  { id: 'meeting', color: '#2AA5B8', bg: '#E2F4F7', name: { en: 'Meeting / call', id: 'Meeting / telepon' } },
  { id: 'deadline', color: '#E05D5D', bg: '#FCEAEA', name: { en: 'Deadline', id: 'Deadline' } },
  { id: 'life', color: '#D4A93A', bg: '#FBF4E1', name: { en: 'Personal life', id: 'Pribadi' } },
  { id: 'google', color: '#8A94A6', bg: '#EFF1F5', name: { en: 'From Google', id: 'Dari Google' } },
];

export const DEFAULT_STRATEGIES = {
  elevara: `BRAND: Elevara — an agency offering Business Support, Creative Services and Academic Services.
AUDIENCE: Small business owners, startups and solo founders (international, English-speaking) who need reliable support; university students who need academic help (editing, formatting, presentations).
CONTENT PILLARS (rotate):
 1. Business Support (30%) — admin, lead generation, CRM, client communication, operations tips.
 2. Creative Services (30%) — carousels, Reels, content calendars, branding, websites.
 3. Academic Services (20%) — study systems, presentations, research & writing help.
 4. How Elevara works / behind the scenes / trust (20%) — process, team, results, FAQs.
TONE: Professional, warm, clear and confident. Short sentences. No jargon. Helpful first, salesy last.
CAROUSEL STRUCTURE (7–9 slides): 1) Scroll-stopping hook  2) The problem / why it matters  3–6) Practical value, one idea per slide  7) Mini proof or example  8) Summary  9) CTA.
CTA OPTIONS: "DM us ELEVARA", "Book a free call — link in bio", "Save this for later", "Share with a founder friend".
VISUAL STYLE (designed manually in Canva by Monika): clean, white space, soft brand colors, max ~25 words per slide.
POSTING: 3x per week (carousel focus), captions 80–150 words with a hook line, value, CTA and 5–8 hashtags.`,
  sister: `BRAND: My sister's small food/product business in Bali.
AUDIENCE: Locals and tourists in Bali, 18–35, who love aesthetic cafés and local products.
PILLARS: Products & menu, behind the scenes, customer moments, promos, Bali lifestyle.
TONE: Friendly, warm, playful, bilingual (Indonesian + English).
CAROUSEL: hook, product highlight, details/price, social proof, location & CTA.
CTA: "Order via DM / WhatsApp", "Visit us", "Tag a friend".`,
  personal: `BRAND: Monika's personal brand on Instagram & YouTube.
AUDIENCE: Young professionals and creatives who want to grow their career and side businesses.
PILLARS: Career growth & remote work, productivity systems, building a business (Elevara journey), lifestyle in Bali.
TONE: Honest, simple, encouraging, relatable.
CAROUSEL: personal hook, story, lessons (3–5), takeaway, CTA (follow / save / comment).`,
};
