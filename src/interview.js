// Lumi Advertising PA interview guide (from Monika's preparation document).
// meaning = what the interviewer really wants to know (ID), keys = points to hit when answering.
export const INTERVIEW = {
  role: 'Personal Assistant (Freelance) · Lumi Advertising',
  contact: 'Alvina Global Partners',
  date: '2026-11-24',
  time: '10:15',
  endTime: '11:00',
  platform: 'Zoom · 30–45 minutes',
  focus: 'Client communication, lead follow-ups, CRM management, administrative support, and familiarity with Lumi Advertising.',
  howTo: 'Use these answers as speaking guides, not scripts to memorize word for word. Keep your answers natural, give real examples where possible, and be honest about tools or responsibilities you have not used before.',
  finalReminder: "You do not need to memorize every answer. Understand the key points and speak naturally. Your strongest selling point is your experience supporting business operations and coordinating projects. Connect those experiences to the role's needs, and be honest about areas where you're still learning.",
  sections: [
    {
      id: 's1', title: '1. Opening and background', titleId: '1. Pembukaan & latar belakang',
      items: [
        {
          id: 'q1', q: 'Tell me about yourself.',
          meaning: 'Pertanyaan pembuka. Mereka ingin ringkasan singkat (±1 menit): siapa kamu, pengalaman yang relevan dengan PA, dan kenapa kamu tertarik. Bukan cerita hidup.',
          keys: ['Background: admin support, executive assistance, client communication, social media', 'Worked closely with business owners & teams: operations, scheduling, coordination', 'Adaptable, detail-oriented, keeps things running smoothly', 'Want to grow in business operations & client management'],
          a: "Hi, thank you for having me today. My name is Monika, and I have a background in administrative support, executive assistance, client communication, and social media management. In my previous roles, I've worked closely with business owners and teams, helping with daily operations, scheduling, coordination, website management, and creative projects. I've also been involved in managing projects from the planning stage through execution, which has helped me develop strong organizational and communication skills. I would describe myself as adaptable, detail-oriented, and someone who enjoys keeping things organized and making sure everything runs smoothly. I'm interested in this opportunity because I would like to further develop my experience in business operations and client management while contributing to the team's daily activities.",
        },
        {
          id: 'q2', q: 'Can you tell me about your previous work experience?',
          meaning: 'Mereka ingin bukti nyata bahwa kamu pernah melakukan pekerjaan yang mirip PA. Sebut peran, tanggung jawab utama, dan pelajaran yang kamu dapat.',
          keys: ['Executive Assistant supporting the COO: coordination, scheduling, communication, project management', 'Creative production: moved content projects from planning to delivery', 'Community operations & content: social media, website, partnerships, events', 'Learned to juggle responsibilities and stay organized'],
          a: "In my previous experience, I've worked in different roles that involved administrative and operational responsibilities. I worked as an Executive Assistant, where I supported the COO with daily coordination, scheduling, communication, and project management. I was also involved in creative production, including coordinating content projects and making sure things moved forward from planning to delivery. In another role, I handled community operations and content management, where I worked on social media, website updates, partnerships, and event coordination. These experiences taught me how to manage different responsibilities, communicate with different people, and stay organized while handling multiple tasks.",
        },
        {
          id: 'q3', q: 'Why are you interested in this Personal Assistant position?',
          meaning: 'Mereka mengecek motivasi: apakah kamu benar-benar suka pekerjaan support/organisasi, dan apakah kamu tertarik dengan dunia agensi iklan (bukan asal melamar).',
          keys: ['Enjoy supporting operations & helping people manage workload', 'Like organizing, coordinating, client communication, catching details', 'Growth: client management, business development, advertising agency environment'],
          a: "I'm interested in this position because I enjoy supporting business operations and helping people manage their workload more efficiently. I like organizing things, coordinating tasks, communicating with clients, and making sure important details don't get missed. I also see this as an opportunity to grow professionally, especially in client management, business development, and working within an advertising agency environment.",
        },
      ],
    },
    {
      id: 's2', title: '2. Client communication', titleId: '2. Komunikasi dengan klien',
      items: [
        {
          id: 'q4', q: 'How do you handle client communication?',
          meaning: 'Mereka ingin tahu gaya komunikasimu: jelas, profesional, cepat, dan apakah kamu mencatat & menindaklanjuti (bukan sekadar membalas chat).',
          keys: ['Understand the need, make the client feel heard', 'Clear, professional, timely', 'Track conversations & pending requests', 'Clarify instead of assuming', 'Follow-through, not just replying'],
          a: "I believe good client communication starts with understanding what the client needs and making sure they feel heard. I try to communicate clearly, professionally, and in a timely manner. I also make sure to keep track of conversations, important details, and any pending requests so nothing gets overlooked. If something is unclear, I prefer to clarify it rather than make assumptions. For me, good communication is not just about responding to messages, but also about making sure things are followed through.",
        },
        {
          id: 'q5', q: "What would you do if a client didn't respond to your message?",
          meaning: 'Tes follow-up: apakah kamu sabar tapi tetap proaktif, mencatat status di CRM, dan tahu kapan harus eskalasi ke atasan.',
          keys: ['Check last contact date & agreed timeline', 'Polite follow-up, not pushy', 'Update status in the CRM so the team knows', 'If urgent: inform the team member / manager'],
          a: "First, I would check when the last communication was sent and whether there was a specific follow-up timeline. If there was no response, I would send a polite follow-up message without being too pushy. I would also update the communication status in the CRM or tracking system so the team knows that we're still waiting for a response. If it's an urgent matter, I would inform the relevant team member or manager.",
        },
      ],
    },
    {
      id: 's3', title: '3. Sales, marketing and lead follow-ups', titleId: '3. Sales, marketing & follow-up lead',
      items: [
        {
          id: 'q6', q: 'What do you understand about lead generation?',
          meaning: 'Tes pengetahuan dasar sales. "Lead generation" = mencari calon klien yang mungkin butuh jasa agensi. Jelaskan proses dari menemukan sampai jadi klien.',
          keys: ['Identify & attract potential customers', 'Example: agency finds businesses that need marketing help', 'Collect info → reach out → understand needs → follow up', 'Goal: turn prospects into clients'],
          a: "Lead generation is the process of identifying and attracting potential customers who might be interested in a company's products or services. For example, an advertising agency might identify businesses that need help with their marketing or advertising. The next step is to collect relevant information, reach out to those prospects, understand their needs, and maintain communication through follow-ups. The goal is to turn potential prospects into actual clients.",
        },
        {
          id: 'q7', q: 'What is cold calling?',
          meaning: 'Definisi + sikap. Cold calling = menelepon calon klien yang belum pernah menghubungi kita. Tunjukkan kamu tahu cara melakukannya dengan sopan.',
          keys: ["Contact someone who hasn't shown interest yet", 'Introduce the company & how it can help', 'Find out if they want a conversation', 'Be prepared, clear, respect their time, not pushy'],
          a: "Cold calling is when you contact a potential customer who hasn't previously expressed interest in your service. The purpose is to introduce the company, explain how its services might help their business, and understand whether they're interested in having a conversation. I think the important things are to be prepared, communicate clearly, respect the prospect's time, and avoid being too pushy.",
        },
        {
          id: 'q8', q: 'How would you approach a potential client for an advertising agency?',
          meaning: 'Mereka ingin melihat langkah kerjamu: riset dulu, personalisasi pesan, fokus memulai percakapan, bukan langsung jualan.',
          keys: ['Research: industry, audience, current marketing', 'Identify how the agency can help', 'Short, personalized intro (not generic)', 'Start a conversation, understand needs'],
          a: "First, I would research the business to understand its industry, target audience, and current marketing activities. Then, I would identify how the agency's services could potentially help that business. When reaching out, I would keep the introduction short and personalized rather than sending a generic message. I would focus on starting a conversation, understanding their needs, and seeing whether there's an opportunity to work together.",
        },
        {
          id: 'q9', q: 'What would you do if a potential client rejected the offer?',
          meaning: 'Tes sikap profesional saat ditolak: tetap sopan, belajar dari alasannya, catat di CRM, jaga hubungan untuk peluang nanti.',
          keys: ['Respect the decision, stay professional', 'Politely ask the reason (if appropriate)', 'Update status in the CRM', 'Follow up later at a better time; keep the relationship'],
          a: "I would respect their decision and remain professional. I might ask politely if they could share the reason, if appropriate, because that could help us understand their needs better. I would update their status in the CRM and, depending on the situation, consider following up at a more suitable time. I believe it's important to maintain a good relationship even if someone isn't interested at the moment.",
        },
      ],
    },
    {
      id: 's4', title: '4. CRM management', titleId: '4. Manajemen CRM',
      items: [
        {
          id: 'q10', q: 'Do you have experience using CRM systems?',
          meaning: 'Jawab jujur. CRM = sistem untuk menyimpan data klien, lead, riwayat komunikasi, dan jadwal follow-up (contoh: HubSpot, Salesforce, Pipedrive). Tunjukkan kamu paham fungsinya dan cepat belajar.',
          keys: ['Experience organizing records, tracking tasks & communication', 'Honest: not extensive with a dedicated CRM', 'Understand purpose: client info, leads, communication, follow-ups', 'Comfortable learning new software'],
          a: "I have experience organizing information, managing administrative records, and tracking tasks and communication. Although I haven't worked extensively with a dedicated CRM platform, I understand its purpose and how important it is for managing client information, tracking leads, recording communication, and scheduling follow-ups. I'm comfortable learning new software and adapting to the team's existing workflow.",
        },
        {
          id: 'q11', q: 'What information should be recorded in a CRM?',
          meaning: 'Tes praktis: sebutkan data apa saja yang dicatat. Yang paling penting: tanggal kontak terakhir dan tanggal follow-up berikutnya.',
          keys: ['Name, company, contact details', 'Lead source & current status', 'Communication history & notes on needs', 'Last contact date + next follow-up date'],
          a: "I would record the client's name, company, contact details, lead source, current status, communication history, and any important notes about their needs. I would also make sure to record the last contact date and the next follow-up date so the team can easily track what needs attention.",
        },
      ],
    },
    {
      id: 's5', title: '5. Administrative support and time management', titleId: '5. Dukungan admin & manajemen waktu',
      items: [
        {
          id: 'q12', q: 'How do you manage multiple tasks at the same time?',
          meaning: 'Mereka ingin tahu sistem kerjamu. Kamu bisa sebut contoh nyata: kamu pakai workspace/task list untuk semua project (seperti MONIKA WORKSPACE!).',
          keys: ['List all tasks, spot urgent / important', 'Organize by deadlines & priorities', 'Use task lists / project tools to track progress', 'Communicate with the team; finish small important tasks'],
          a: "I usually start by listing all the tasks that need to be completed and identifying which ones are most urgent or important. I organize them based on deadlines and priorities, and I use task lists or project management tools to keep track of progress. If I have multiple deadlines, I make sure to communicate clearly with the team so expectations are aligned. I also try to avoid leaving small but important tasks unfinished.",
        },
        {
          id: 'q13', q: 'What would you do if your manager gave you several urgent tasks at once?',
          meaning: 'Tes prioritas & komunikasi dengan atasan: jangan menebak, tanya mana yang paling penting, lalu beri update.',
          keys: ['Clarify deadlines & priorities', 'Ask the manager which comes first', 'Organize the workload, give progress updates', 'Communicate early rather than assume'],
          a: "First, I would clarify the deadlines and priorities of each task. If everything seems urgent, I would communicate with my manager to understand which task should be handled first. Then, I would organize the workload and keep them updated on the progress. I believe it's better to communicate early rather than make assumptions and risk missing an important deadline.",
        },
      ],
    },
    {
      id: 's6', title: '6. Situational questions', titleId: '6. Pertanyaan situasional',
      items: [
        {
          id: 'q14', q: 'What would you do if you noticed an important client follow-up had been missed?',
          meaning: 'Tes tanggung jawab: perbaiki cepat, cek apakah ada yang lain terlewat, lalu perbaiki prosesnya supaya tidak terulang.',
          keys: ['Review the communication history', 'Send a professional, relevant follow-up ASAP', 'Update tracking; check for other missed follow-ups', 'Improve the process so it doesn\'t happen again'],
          a: "I would first review the communication history to understand what happened. Then, I would send the follow-up as soon as possible, making sure the message is professional and relevant to the previous conversation. I would also update the tracking system and check whether there are other pending follow-ups that might have been missed. I would use that experience to improve the tracking process so it doesn't happen again.",
        },
        {
          id: 'q15', q: 'What would you do if a client complained about a delay?',
          meaning: 'Tes menangani komplain: dengarkan, jangan defensif, cek ke tim, beri update yang akurat, dan follow-up sampai selesai.',
          keys: ['Listen & acknowledge, not defensive', 'Check with the team, understand the reason', 'Give an accurate update', 'Follow up until resolved; be transparent'],
          a: "I would listen carefully and acknowledge their concern without becoming defensive. I would check the situation with the relevant team member, understand the reason for the delay, and provide the client with an accurate update. I would also make sure to follow up until the issue is resolved. I think it's important to be transparent and professional, especially when handling client concerns.",
        },
      ],
    },
    {
      id: 's7', title: '7. Strengths and fit', titleId: '7. Kelebihan & kecocokan',
      items: [
        {
          id: 'q16', q: 'What are your strengths?',
          meaning: 'Sebut 3–4 kelebihan yang cocok untuk PA, idealnya dengan contoh singkat dari pengalamanmu.',
          keys: ['Adaptability', 'Organization', 'Communication', 'Proactive; willing to learn new tools'],
          a: "I would say my main strengths are adaptability, organization, communication, and being proactive. I'm comfortable handling different types of responsibilities, and I enjoy finding ways to make workflows more organized. I'm also willing to learn new tools and processes when needed.",
        },
        {
          id: 'q17', q: 'What is your weakness?',
          meaning: 'Mereka ingin melihat kejujuran dan kesadaran diri. Sebut kelemahan yang nyata tapi tidak fatal, lalu jelaskan cara kamu memperbaikinya.',
          keys: ['Sometimes spend too much time on organizing & detail', 'Learning to balance detail with efficiency', 'Set priorities, finish what matters first'],
          a: "Sometimes I can spend too much time making sure everything is properly organized and detailed. However, I'm learning to balance attention to detail with efficiency by setting priorities and focusing on what needs to be completed first.",
        },
        {
          id: 'q18', q: 'Why should we choose you?',
          meaning: 'Penutup untuk "menjual" dirimu: rangkum nilai yang kamu bawa dan hubungkan dengan kebutuhan PA (bisa diandalkan, rapi, proaktif).',
          keys: ['Admin experience + communication + creative problem-solving', 'Supported operations, coordinated projects, worked with many people', 'Adaptable, responsible, willing to learn', 'Reliable, organized, proactive: the team can depend on me'],
          a: "I believe I can bring a combination of administrative experience, communication skills, and creative problem-solving. I've worked in different environments, supported business operations, coordinated projects, and communicated with different people. I'm adaptable, responsible, and willing to learn. I understand that a Personal Assistant needs to be reliable, organized, and proactive, and I would do my best to make sure the team can depend on me.",
        },
      ],
    },
  ],
  glossary: [
    ['Lead', 'A potential customer.', 'Calon pelanggan.'],
    ['Prospect', 'A potential customer identified as a possible fit.', 'Calon pelanggan yang sudah dinilai cocok.'],
    ['Lead generation', 'Finding potential customers.', 'Proses mencari calon pelanggan.'],
    ['Prospecting', 'Researching and identifying potential clients.', 'Meriset & mengidentifikasi calon klien.'],
    ['Cold calling', "Calling someone who hasn't contacted you first.", 'Menelepon orang yang belum pernah menghubungi kita.'],
    ['Cold emailing', 'Sending an unsolicited business introduction email.', 'Mengirim email perkenalan bisnis tanpa diminta.'],
    ['Follow-up', 'Contacting someone again after an earlier interaction.', 'Menghubungi lagi setelah interaksi sebelumnya.'],
    ['Conversion', 'Turning a prospect into a customer.', 'Mengubah prospek menjadi pelanggan.'],
    ['CRM', 'A system for managing customer relationships and information.', 'Sistem untuk mengelola data & hubungan dengan pelanggan.'],
    ['Sales pipeline', 'The stages a potential customer moves through.', 'Tahapan yang dilalui calon pelanggan sampai membeli.'],
    ['CTA', 'Call to action: the next step you invite someone to take.', 'Ajakan untuk melakukan langkah berikutnya.'],
    ['KPI', 'Key performance indicator: a measure of progress or performance.', 'Ukuran untuk menilai kinerja / progres.'],
    ['ROI', 'Return on investment: the value gained compared with the cost.', 'Hasil yang didapat dibanding biaya yang dikeluarkan.'],
  ],
  askThem: [
    'What would my main responsibilities look like on a typical working day?',
    'What CRM or project management tools does the team currently use?',
    'Would I communicate directly with clients, or would I mainly support the internal team?',
    'What are the main priorities you would expect me to handle during the first month?',
    'How do you measure success in this position?',
    'What is the expected working schedule for this freelance position?',
  ],
  checklist: [
    'Practice your self-introduction out loud.',
    'Prepare two real examples from your previous work.',
    'Practice explaining how you handle client follow-ups.',
    'Review lead generation, cold calling, CRM, and sales pipeline.',
    'Prepare three questions to ask the interviewer.',
    'Check your Zoom, internet connection, camera, and microphone.',
    'Join the meeting a few minutes early.',
  ],
};

export const ALL_QUESTIONS = INTERVIEW.sections.flatMap((s) => s.items.map((it) => ({ ...it, section: s.title, sectionId: s.id })));

// Company research (from lumiadvertising.com and Alvina Global Partners' public Instagram, checked 23 Nov 2026).
export const COMPANY = {
  lumi: {
    name: 'Lumi Advertising',
    tagline: '“Less chasing leads. More property conversations.”',
    facts: [
      ['Apa itu', 'Agensi marketing & lead generation khusus untuk agen properti (real estate) di Singapura.'],
      ['Founder', 'Fyrus Atan (Founder, Sales & Marketing). Kemungkinan besar dia yang akan kamu ajak kerja langsung.'],
      ['Berdiri', 'Terdaftar di Singapura pada 28 Jan 2025, jadi masih bisnis muda yang sedang berkembang.'],
      ['Klien', 'Agen properti Singapura: peluncuran kondominium baru (new launch), post-launch, HDB MOP & asset progression.'],
      ['Janji utama', 'Bukan cuma kasih “leads”, tapi appointment yang sudah dikualifikasi (qualified appointments).'],
    ],
    services: [
      ['Meta ads management', 'Iklan Facebook & Instagram untuk tiap proyek/niche properti.'],
      ['Video editing & graphic design', 'Konten iklan dibuat terus supaya selalu segar.'],
      ['WhatsApp automation', 'Pesan otomatis cepat ke lead baru (speed-to-lead) dan follow-up otomatis.'],
      ['PA appointment setter', 'Orang sungguhan yang menelepon & chat lead, cek apakah cocok, lalu atur jadwal call dengan agen. ⭐ Ini sangat mungkin bagian dari pekerjaanmu.'],
      ['Weekly nurturing & reactivation', 'Tetap kontak dengan prospek, dan hubungi lagi lead yang sudah “diam”.'],
    ],
    process: [
      'Iklan Meta jalan, lalu calon pembeli mengisi form (lead masuk).',
      'WhatsApp otomatis langsung menyapa lead.',
      'PA menghubungi lead: tanya minat properti, budget, timeline, dan apakah untuk tinggal sendiri atau investasi.',
      'Kalau cocok, PA atur jadwal call, lalu kirim “handover” ke WhatsApp agen: jam call, minat properti, dan catatan percakapan.',
      'Lead yang belum siap tetap di-follow-up setiap minggu (nurturing) dan dicatat di CRM / dashboard.',
    ],
    values: [
      'Jujur: mereka tidak menjanjikan garansi appointment atau penjualan.',
      'Kontrak standar 90 hari untuk tes kampanye dan membangun pipeline.',
      'Transparan: klien bisa lihat live dashboard.',
      'Rapi: handover selalu lengkap dengan konteks.',
    ],
  },
  alvina: {
    name: 'Alvina Global Partners',
    facts: [
      ['Apa itu', 'Agensi “Business & Talent” yang menghubungkan bisnis internasional dengan talenta remote dari Indonesia.'],
      ['Founder', 'Alvina. Dulu namanya “Alvina Virtual Assistant”, lalu rebranding jadi Alvina Global Partners (Sep 2026).'],
      ['Peran di interview ini', 'Mereka recruiter / perantara. Lumi Advertising adalah klien yang mencari PA. Alvina yang mengatur interview.'],
      ['Visi', '“Same passion, bigger purpose”: connecting the right people with the right opportunities, beyond borders.'],
    ],
  },
  link: [
    'Lumi butuh PA, lalu Alvina mencarikan talenta Indonesia yang cocok, yaitu kamu.',
    'Kamu akan bekerja remote untuk Lumi (Singapura). Zona waktunya sama dengan Bali, jadi ini kelebihan untukmu!',
    'Bersikap profesional ke keduanya: Alvina menilai apakah kamu layak direkomendasikan, Lumi menilai apakah kamu cocok untuk tim.',
  ],
  talking: [
    'I looked at Lumi’s website. I really like that you focus on qualified appointments, not just leads, and that you keep the follow-up moving for agents while they’re with clients.',
    'I understand that speed-to-lead and consistent follow-up are very important. I’m organised and responsive, so I can help make sure no lead gets lost.',
    'I noticed you don’t promise guaranteed results. I appreciate that honesty, and I think clear communication builds long-term trust with agents.',
    'Since Bali is in the same time zone as Singapore, I can be available during your working hours and respond quickly.',
  ],
  askMore: [
    'Will the PA role include calling and qualifying leads as an appointment setter, or more admin and CRM support for the team?',
    'Which CRM or dashboard do you use to track leads and handovers?',
    'How many agents or campaigns would I support at the start?',
    'What does a successful first 90 days look like for this role?',
  ],
  terms: [
    ['Speed-to-lead', 'Seberapa cepat lead baru dihubungi. Makin cepat, makin besar peluangnya.'],
    ['Qualified appointment', 'Janji call dengan prospek yang sudah dicek benar-benar tertarik dan cocok.'],
    ['Handover', 'Info lengkap prospek yang dikirim ke agen sebelum call.'],
    ['Nurturing / reactivation', 'Menjaga hubungan dengan lead yang belum siap, dan menghubungi lagi lead yang diam.'],
    ['New launch', 'Proyek kondominium baru yang baru dijual.'],
    ['HDB MOP', 'Minimum Occupation Period: pemilik rumah HDB (rumah subsidi) sudah boleh menjual, biasanya setelah 5 tahun.'],
    ['Asset progression', 'Upgrade properti, misalnya dari HDB ke kondominium untuk investasi.'],
    ['EC', 'Executive Condominium: kondominium hybrid dengan subsidi pemerintah.'],
  ],
  sources: ['lumiadvertising.com', 'Instagram @alvinaglobalpartners', 'LinkedIn Fyrus Atan'],
};

// Content Manager & Executive Assistant interview (25 Nov 2026, 09:30 Bali time). Company not known yet.
export const CMEA = {
  key: 'cmea',
  role: 'Content Manager & Executive Assistant · Bali (hybrid)',
  contact: 'Company / owner: not shared yet',
  date: '2026-11-25',
  time: '09:30',
  endTime: '10:15',
  dateLabel: 'Wed, 25 Nov 2026 · 09:30 Bali time',
  platform: 'Format not confirmed (online or in person). Check the invite.',
  focus: 'Growing a personal brand in fitness, mental health and finance: content strategy, planning, research, video editing, copywriting, publishing and performance tracking, plus day-to-day executive and admin support. They want someone proactive, organized and independent who keeps things moving without being chased.',
  howTo: 'These are speaking guides, not scripts. Learn the key points, then say them in your own words with a real example. Your story for this role: you have already done both halves of the job. You supported a COO as an Executive Assistant, and you plan, write, design and publish content every week (you run the Elevara Instagram end to end).',
  finalReminder: 'They care most about ownership. In every answer, show that you notice what is needed, act on it, and report back without being asked. Use numbers and real examples where you can.',
  sections: [
    {
      id: 'c_s1', title: '1. Opening and motivation', titleId: '1. Pembukaan & motivasi',
      items: [
        {
          id: 'c1', q: 'Tell me about yourself.',
          meaning: 'Pembuka ±1 menit. Mereka ingin dengar bahwa kamu punya DUA keahlian yang mereka cari: konten/social media DAN executive assistant, plus sifat mandiri.',
          keys: ['Two sides: content & social media + executive/admin support', 'EA to a COO: scheduling, coordination, communication, projects', 'Content: strategy, planning, Canva design, captions, publishing, Reels editing', 'Proactive, organized, works independently', 'Excited by personal brands with a real message'],
          a: "Thank you for having me. I'm Monika, and my experience sits right between content and operations. I worked as an Executive Assistant supporting a COO, where I handled scheduling, coordination, communication and project follow-ups. At the same time I've worked in creative production and social media: planning content, writing captions, designing carousels, editing short videos, publishing, and checking what performs. Right now I plan and run an Instagram account end to end, from the content calendar to the analytics. I'm very organized, I like owning my work, and I'm comfortable working independently. That's why this role caught my attention: it combines both things I enjoy, building a brand and keeping a busy person's work running smoothly.",
        },
        {
          id: 'c2', q: 'Why are you interested in this role?',
          meaning: 'Cek motivasi: apakah kamu paham ini gabungan 2 peran dan benar-benar tertarik dengan topik fitness, mental health, finance (bukan asal melamar).',
          keys: ['Combination of content + EA fits my background exactly', 'Topics that genuinely help people: health, mind, money', 'Like working closely with one person and seeing direct impact', 'Want to grow a brand from strategy to results'],
          a: "Two reasons. First, the role combines content management and executive support, and that's exactly the mix I've been doing, so I know I can contribute from day one. Second, I like the topics. Fitness, mental health and finance are areas where good content really helps people, and I'm interested in them personally too. I also enjoy working closely with one person, understanding how they think, and seeing the direct impact of my work, whether that's a post that performs well or a week that runs smoothly because everything was prepared.",
        },
        {
          id: 'c3', q: 'What do you understand about building a personal brand?',
          meaning: 'Tes pemahaman: personal brand = orangnya adalah brand-nya. Kuncinya keaslian, konsistensi, kepercayaan, dan nilai untuk audiens.',
          keys: ['The person is the brand: their story, values, expertise', 'Authentic voice > polished ads', 'Consistency: pillars, look, posting rhythm', 'Value first: educate, inspire, connect', 'Trust leads to community, then opportunities'],
          a: "A personal brand is built around the person, their story, their values and their expertise. People follow people they trust, so the content has to sound like them and show real life, not just polished promotion. The basics are clear content pillars, a recognizable voice and look, and a consistent posting rhythm. Most of the content should give value: teach something, share an honest experience, or start a conversation. Over time that builds trust and a community, and that's what opens doors for things like coaching, products or partnerships.",
        },
        {
          id: 'c4', q: 'Why should we hire you?',
          meaning: 'Penutup "jual diri". Rangkum: kamu sudah melakukan kedua sisi pekerjaan, mandiri, dan bisa langsung mulai.',
          keys: ['Already done both halves: EA + content end to end', 'Ownership: plan, execute, report without being chased', 'Organized systems (calendars, trackers, content plans)', 'Can start quickly, learn the person’s style fast'],
          a: "Because I've already done both halves of this job. I've supported an executive with schedules, communication and projects, and I've run content from the idea to the analytics. I don't need someone to manage me step by step. I like setting up simple systems, like a content calendar, a task tracker and weekly check-ins, so the person always knows what's happening. I learn people's style quickly, and I can start soon. I think you'd get someone who makes your week lighter and your brand more consistent at the same time.",
        },
      ],
    },
    {
      id: 'c_s2', title: '2. Content strategy and planning', titleId: '2. Strategi & perencanaan konten',
      items: [
        {
          id: 'c5', q: 'How would you build a content strategy for a personal brand in fitness, mental health and finance?',
          meaning: 'Pertanyaan inti. Tunjukkan langkah yang jelas: pahami orangnya & audiens → pilar konten → format → ritme → ukur.',
          keys: ['Start with the person: goals, story, expertise, audience', 'Audit current account + look at similar creators', 'Pillars, e.g. Move (fitness) / Mind (mental health) / Money (finance) / Life & story', 'Mix formats: Reels for reach, carousels for saves, Stories for connection', 'Calendar + weekly rhythm, then review numbers monthly'],
          a: "I'd start with the person: what they want the brand to achieve, their story, what they're qualified to talk about, and who they want to reach. Then I'd audit the current account and look at similar creators to see what works and where the gap is. From there I'd set three or four content pillars, for example Move for fitness, Mind for mental health, Money for finance, and a personal pillar for their story and daily life. Each pillar gets formats that fit: Reels for reach, carousels for saves and education, Stories for connection. I'd put it into a monthly calendar with a steady posting rhythm, and review the numbers every month to double down on what works.",
        },
        {
          id: 'c6', q: 'How do you plan and organize a content calendar?',
          meaning: 'Mereka ingin lihat sistem kerjamu: alat, ritme, batching, dan bagaimana kamu memastikan tidak ada yang telat.',
          keys: ['Monthly plan, weekly detail', 'Fixed posting days (e.g. 3× a week) + pillar rotation', 'Each post: topic, hook, format, script/caption, design/edit date, post date', 'Batch filming/design to stay ahead', 'Tools: Notion/Google Sheets, Canva, scheduler (Meta Business Suite)'],
          a: "I plan monthly and detail it weekly. First I set fixed posting days, for example three times a week, and rotate the pillars so the feed stays balanced. Every post in the calendar has a topic, a hook, the format, the script or caption, and three dates: when it's designed or edited, when it's reviewed, and when it goes live. I like batching, so filming or designing several pieces in one session, which keeps us a week or two ahead. I use tools like Notion or Google Sheets for the plan, Canva for design, and a scheduler like Meta Business Suite. That's actually how I run the Elevara account right now: three posts a week, each with its own design and review day.",
        },
        {
          id: 'c7', q: 'How do you research content ideas and trends?',
          meaning: 'Cek kebiasaan riset: dari mana idenya, dan bagaimana memilih tren yang cocok dengan brand (tidak asal ikut tren).',
          keys: ['Audience: comments, DMs, questions, polls', 'Competitors & similar creators: what gets saved/shared', 'Trends: Reels audio, TikTok, Google Trends, news in the niche', 'Own insights: repeat what performed', 'Filter: does it fit the brand and the person’s expertise?'],
          a: "I look in a few places. The best ideas usually come from the audience itself: questions in comments, DMs, and poll answers. I also follow similar creators and note which posts get the most saves and shares, not just likes. For trends I check trending Reels audio, TikTok, Google Trends and news in the niche. And I look at our own insights to see which topics did well and can be repeated in a new way. Then I filter everything with one question: does this fit the brand and is the person credible talking about it? I'd rather skip a trend than post something off-brand.",
        },
        {
          id: 'c8', q: 'How would you make sure the content sounds like the person, not like you?',
          meaning: 'Personal brand = suara orangnya. Tunjukkan cara kamu menangkap gaya bicara & nilai mereka, dan alur review.',
          keys: ['Listen: interviews, voice notes, past posts, how they talk', 'Simple brand voice guide: words they use / avoid, tone', 'Their stories & opinions as raw material', 'Draft → they review → adjust; fewer edits over time'],
          a: "I'd spend time learning how they speak: their past posts, videos, voice notes, even how they write messages. I'd turn that into a short voice guide with the words and phrases they use, things they would never say, and the tone, whether that's calm, direct or funny. I'd also collect their real stories and opinions, because that's what makes a personal brand feel personal. At the start I'd send drafts for review and note every change they make, so after a few weeks the drafts need fewer and fewer edits.",
        },
      ],
    },
    {
      id: 'c_s3', title: '3. Production: video, copywriting, publishing', titleId: '3. Produksi: video, copywriting, publishing',
      items: [
        {
          id: 'c9', q: 'What is your experience with video editing? Which tools do you use?',
          meaning: 'Jujur soal level & alatmu, lalu tunjukkan kamu paham apa yang bikin Reels bagus (hook, tempo, subtitle).',
          keys: ['Short-form Reels editing (say honestly which tools: CapCut, Canva, InShot, Premiere…)', 'Hook in first 1–3 seconds, cut dead space, fast pacing', 'Subtitles/captions on screen (many watch without sound)', 'Trending audio, cover image, brand style', 'Willing to level up with their preferred tool'],
          a: "I edit short-form videos for Instagram, mainly Reels. I'm most comfortable with tools like CapCut and Canva, and I'm happy to learn any tool you already use. When I edit, I focus on what makes people keep watching: a strong hook in the first one to three seconds, cutting pauses and dead space, keeping the pace tight, adding on-screen captions because many people watch without sound, and choosing audio that fits the mood. I also keep a consistent style, like the same fonts, colors and cover format, so the videos are recognizable in the feed.",
        },
        {
          id: 'c10', q: 'How do you write a good hook and caption?',
          meaning: 'Tes copywriting. Jelaskan struktur: hook → nilai → CTA, dan beri contoh singkat untuk niche mereka.',
          keys: ['Hook names a problem or surprising truth in one line', 'Body: one clear idea, short lines, easy to read', 'CTA: save, share, comment, DM', 'Example: “You don’t need more motivation. You need a smaller first step.”'],
          a: "A good hook stops the scroll in one line, usually by naming a problem the audience feels or saying something surprising. For example, for mental health: 'You don't need more motivation. You need a smaller first step.' Or for finance: 'Your salary isn't the problem. The first three days after payday are.' Then the caption delivers one clear idea in short, easy lines, ideally with something practical people can try. And it ends with one call to action, like save this for later, share it with a friend, or comment a word to get a guide. Simple, human, and useful.",
        },
        {
          id: 'c11', q: 'Walk me through your publishing process.',
          meaning: 'Mereka ingin lihat kamu rapi & teliti sebelum posting: cek, jadwal, dan engagement setelah posting.',
          keys: ['Final check: spelling, facts, tags, audio, cover, captions', 'Schedule at the best time for the audience', 'Prepare Story to boost the post', 'First hour: reply to comments, engage', 'Log results in the tracker'],
          a: "Before anything goes live I do a final check: spelling, facts, tags, links, the cover image, on-screen captions and audio. Then I schedule it for the time the audience is most active, based on insights. On the day, I share it to Stories with a poll or question sticker to push it a bit more, and in the first hour I reply to comments and engage, because that early activity helps reach. Afterwards I log the post in a tracker so we can compare results over time.",
        },
        {
          id: 'c12', q: 'Mental health and finance are sensitive topics. How would you handle them responsibly?',
          meaning: 'Tes kedewasaan: jangan memberi saran medis/keuangan yang menyesatkan, cek fakta, beri disclaimer, dan tahu batas.',
          keys: ['Accuracy: check facts & sources, no exaggerated promises', 'Share experience, not prescriptions (not medical/financial advice)', 'Disclaimers & point to professionals/helplines when needed', 'Kind tone, no shaming', 'Careful with comments/DMs: escalate serious ones to the owner'],
          a: "I'd be careful with both. For finance, I'd keep it educational, check facts, avoid promising returns, and add a note that it's not financial advice. For mental health, I'd share experiences and simple habits rather than anything that sounds like treatment, keep the tone kind and never shaming, and point people to professional help when it's appropriate. I'd also be careful with comments and DMs. If someone shares something serious, I wouldn't try to handle it myself. I'd flag it to you and make sure we respond appropriately.",
        },
      ],
    },
    {
      id: 'c_s4', title: '4. Performance and growth', titleId: '4. Performa & pertumbuhan',
      items: [
        {
          id: 'c13', q: 'Which metrics do you track, and what do they tell you?',
          meaning: 'Tes analitik dasar. Sebut metrik + artinya, dan bahwa kamu pakai data untuk keputusan.',
          keys: ['Reach & impressions: how many saw it', 'Engagement rate: likes, comments, saves, shares ÷ reach', 'Saves & shares = valuable content', 'Reels: watch time / retention, 3-second hold', 'Follows from post, profile visits, link clicks, DMs = business impact'],
          a: "I look at reach to see how many people saw a post, and engagement rate, so likes, comments, saves and shares compared with reach. Saves and shares matter most to me, because they show the content was genuinely useful. For Reels I check watch time and how many people stayed past the first few seconds, which tells me whether the hook worked. And I track the numbers closest to business goals: profile visits, new followers from a post, link clicks and DMs. I review them weekly and do a deeper summary each month.",
        },
        {
          id: 'c14', q: 'What would you do if engagement suddenly dropped?',
          meaning: 'Cek cara berpikir: tidak panik, cari penyebab dengan data, uji perubahan kecil.',
          keys: ['Check data first: which posts, which metric, since when', 'Possible causes: hooks, formats, timing, topics, algorithm shift', 'Compare with best performers', 'Test 1–2 changes for 2 weeks', 'Report findings to the owner'],
          a: "First I wouldn't panic. I'd look at the data: which posts dropped, which metric, and since when. Then I'd compare them with our best performers to find the difference. Was it the hook, the format, the posting time, or the topic? Sometimes it's an algorithm shift, like Reels getting more reach than carousels. I'd pick one or two changes to test for about two weeks, for example stronger hooks or more Reels, and measure again. And I'd keep you updated with a short summary of what I found and what I'm testing.",
        },
        {
          id: 'c15', q: 'Tell me about a piece of content that performed well. Why did it work?',
          meaning: 'Minta contoh nyata (STAR). Contoh jawaban di bawah memakai post Elevara: isi bagian [ ] dengan angka asli dari Instagram Insights, atau ganti dengan contoh lain yang hasilnya kamu tahu. Jangan mengarang angka.',
          keys: ['Situation: which account, goal', 'What you made: format, hook, topic', 'Result (numbers if possible: reach, saves, DMs)', 'Why it worked + what you repeated'],
          a: "One example is an educational carousel I made for a business account, about the admin tasks founders should hand off first. The goal was to show the value of support services. I opened with a hook about founders living in their inbox, then gave three practical areas to delegate, and ended with a clear call to message us. It got [number] saves and [number] shares, more than our usual posts, because it was practical and easy to come back to. What I learned is that specific, useful carousels with a clear problem in the hook get saved and shared, so I used that structure for the next posts too.",
        },
      ],
    },
    {
      id: 'c_s5', title: '5. Executive assistant', titleId: '5. Executive assistant',
      items: [
        {
          id: 'c16', q: 'How do you manage an executive’s calendar, inbox and priorities?',
          meaning: 'Tes sistem EA: cara kamu memprioritaskan, melindungi waktu atasan, dan memberi update.',
          keys: ['Calendar: buffers, focus blocks, prep notes for meetings', 'Inbox: triage → reply / delegate / flag for decision', 'Daily or weekly brief: what’s coming, what needs a decision', 'Priorities: urgent vs important, ask when unsure', 'Experience as EA to a COO'],
          a: "When I supported a COO, I treated the calendar as something to protect, not just fill. I added buffers between meetings, blocked focus time, and prepared short notes before important meetings. For the inbox, I'd sort messages into three groups: things I can answer myself, things to pass to someone else, and things that need their decision, which I'd summarize clearly. I like a short daily or weekly brief: what's coming up, what's waiting on them, and what I've already handled. If priorities conflict, I'll suggest an order, but I'll always check when I'm not sure.",
        },
        {
          id: 'c17', q: 'How do you anticipate someone’s needs before they ask?',
          meaning: 'Ini kata kunci di lowongan ("anticipate needs"). Beri contoh konkret proaktif.',
          keys: ['Learn routines, preferences, recurring tasks', 'Look ahead 1–2 weeks: deadlines, travel, bills, renewals', 'Prepare before it’s needed (docs, bookings, reminders)', 'Example from EA role'],
          a: "By learning their routines and looking ahead. After a few weeks you know their preferences, their recurring tasks and what usually causes stress. Then I check the next one or two weeks for deadlines, trips, payments or renewals, and prepare things before they're needed: booking, documents, reminders, or a draft reply. For example, in my EA role, before recurring meetings I'd already have the agenda and the open action points from last time ready, so the COO never had to ask for them. My goal is that they rarely have to remember small things themselves.",
        },
        {
          id: 'c18', q: 'You will see private information: finances, health, schedules. How do you handle confidentiality?',
          meaning: 'Kepercayaan. Jawab tegas: rahasia tetap rahasia, akses rapi, tidak cerita ke siapa pun.',
          keys: ['Confidential by default, never shared or discussed', 'Secure passwords/password manager, 2FA, shared access done properly', 'Personal vs work devices & files kept organized', 'Comfortable signing an NDA'],
          a: "I treat everything as confidential by default. Whatever I see about finances, health or personal plans stays between us. I don't discuss it with anyone or post anything without approval. Practically, I'd use secure tools, like a password manager and two-factor authentication, keep files organized with the right access, and avoid using personal devices in unsafe ways. I've handled sensitive information as an Executive Assistant before, and I'm comfortable signing an NDA if needed.",
        },
        {
          id: 'c19', q: 'A content deadline and an urgent personal/admin request land at the same time. What do you do?',
          meaning: 'Tes prioritas & komunikasi. Tidak ada jawaban "sempurna": tunjukkan cara menilai dampak & bicara jujur.',
          keys: ['Assess impact & real deadline of each', 'Handle the truly time-critical one first', 'Communicate: “I’ll do X now, Y will be ready by 3pm”', 'Content buffer (batching) means posts rarely depend on the last minute', 'Adjust the plan, don’t silently drop anything'],
          a: "I'd quickly check the real impact and deadline of each. If the admin request is truly time-critical, like a payment or a booking that will be lost, I'd do that first. Then I'd tell you clearly, for example, 'I'm sorting the booking now, the post will be ready by three.' This is also why I keep content one or two weeks ahead through batching, so a post rarely depends on the last hour. The important thing is that nothing gets silently dropped. If something has to move, I say so and adjust the plan.",
        },
      ],
    },
    {
      id: 'c_s6', title: '6. Independence and ownership', titleId: '6. Mandiri & tanggung jawab',
      items: [
        {
          id: 'c20', q: 'Tell me about a time you took initiative without being asked.',
          meaning: 'Lowongan menekankan initiative & ownership. Contoh di bawah hanya ilustrasi struktur STAR: ganti dengan kejadian nyata dari pekerjaanmu (misalnya waktu jadi EA untuk COO).',
          keys: ['Situation: noticed a problem nobody owned', 'Action: proposed/built a fix (system, template, tracker)', 'Result: saved time / fewer mistakes / better results', 'Shows you act, then report'],
          a: "In one of my previous roles, I noticed that content and project requests were coming in through different chats, and things were getting missed or done twice. Nobody had asked me to fix it, but I set up a simple shared tracker with each request, owner, deadline and status, and a short weekly check-in. I showed it to the team, they started using it, and within a few weeks there were far fewer missed deadlines and less back-and-forth. I like doing that: if I see a gap, I fix it, and then I explain what I changed.",
        },
        {
          id: 'c21', q: 'How do you stay accountable when you work without supervision?',
          meaning: 'Hybrid & mandiri: mereka ingin yakin kamu tetap produktif dan transparan tanpa diawasi.',
          keys: ['Clear weekly plan & priorities', 'Shared tracker so progress is visible', 'Short end-of-day or weekly update', 'Raise blockers early, don’t wait', 'Own mistakes and fix them'],
          a: "I make my work visible. I start each week with a clear plan and priorities, and I keep everything in a shared tracker so you can see the status anytime without asking. I like sending a short update, either at the end of the day or once a week: what's done, what's next, and anything I need from you. If something is blocked, I raise it early instead of waiting. And if I make a mistake, I say it straight away and come with a fix. That way you can trust the work is moving even when you're busy.",
        },
        {
          id: 'c22', q: 'What would you do in your first 30 days?',
          meaning: 'Rencana konkret menunjukkan kamu siap mulai cepat ("join asap").',
          keys: ['Week 1: learn the person, goals, tools, access; audit account & admin', 'Week 2: brand voice guide, pillars, calendar, EA routines', 'Week 3–4: publish consistently, set up tracker & reports', 'Day 30: review results, agree next goals'],
          a: "In the first week I'd focus on learning: your goals for the brand, your routines and preferences, the tools and accounts, and a quick audit of the current content and admin setup. In the second week I'd create a simple brand voice guide, confirm the content pillars, build the first month's calendar, and set up the EA routines, like inbox and calendar habits. In weeks three and four I'd publish consistently, set up a performance tracker, and handle the daily admin. At day thirty I'd share a short review of what worked and agree on the next goals with you.",
        },
      ],
    },
    {
      id: 'c_s7', title: '7. Practical questions', titleId: '7. Pertanyaan praktis',
      items: [
        {
          id: 'c23', q: 'The salary is Rp7,500,000 per month. Is that OK for you? When can you start?',
          meaning: 'Mereka cek kecocokan gaji & ketersediaan. Jawab positif tapi tetap profesional; boleh tanya soal review gaji & ruang lingkup.',
          keys: ['Positive: comfortable with the range', 'Ask (politely) about performance review / growth', 'Clarify scope & working hours if not explained', 'Give a realistic start date'],
          a: "Yes, the salary works for me, and I appreciate that BPJS is included. I'd be glad to know whether there's a performance review after the probation period, since the role covers both content and executive support. In terms of starting, I can start soon. I'd just like to confirm the working schedule and how the hybrid setup works, and then I can give you an exact date.",
        },
        {
          id: 'c24', q: 'Do you have any other commitments? (e.g. your own business)',
          meaning: 'Kalau mereka tahu kamu punya Elevara, mereka akan cek komitmen. Jawab jujur, tenang, dan tegaskan prioritasmu pada pekerjaan ini.',
          keys: ['Be honest: you manage content for a small agency/side project', 'It keeps your skills sharp (you can show it as portfolio)', 'It won’t clash: this role is your main priority, during working hours', 'Open to discuss any concern'],
          a: "Yes, I've been building content for a small business project, which is actually where a lot of my recent content work comes from, and I'm happy to show it as part of my portfolio. If I join you, this role would be my main focus during working hours, and I would make sure nothing clashes with my responsibilities here. If you have any concerns about it, I'm completely open to talking about it.",
        },
      ],
    },
  ],
  glossary: [
    ['Personal brand', 'A brand built around a person: their story, values and expertise.', 'Brand yang dibangun dari seseorang: cerita, nilai, dan keahliannya.'],
    ['Content pillar', 'A main theme the account posts about regularly.', 'Tema utama yang rutin dibahas akun.'],
    ['Content calendar', 'A plan of what gets posted, when, and in which format.', 'Rencana apa yang diposting, kapan, dan formatnya.'],
    ['Hook', 'The first line or 1–3 seconds that stops the scroll.', 'Kalimat/detik pertama yang membuat orang berhenti scroll.'],
    ['CTA', 'Call to action: the next step you ask people to take.', 'Ajakan langkah berikutnya (save, share, DM).'],
    ['Reach', 'How many unique accounts saw the content.', 'Jumlah akun berbeda yang melihat konten.'],
    ['Impressions', 'How many times the content was shown in total.', 'Total berapa kali konten ditampilkan.'],
    ['Engagement rate', 'Interactions (likes, comments, saves, shares) divided by reach.', 'Interaksi dibagi reach, ukuran seberapa "nyambung" konten.'],
    ['Retention / watch time', 'How long people keep watching a video.', 'Berapa lama orang menonton video.'],
    ['Repurposing', 'Turning one piece of content into several formats.', 'Mengolah 1 konten jadi beberapa format.'],
    ['Batching', 'Creating several pieces of content in one session.', 'Membuat banyak konten sekaligus dalam satu sesi.'],
    ['Brand voice', 'The consistent tone and way of speaking of a brand.', 'Gaya bahasa & nada bicara yang konsisten.'],
    ['UGC', 'User-generated content: content made by the audience or customers.', 'Konten yang dibuat oleh audiens/pelanggan.'],
    ['KPI', 'Key performance indicator: a number that shows progress.', 'Angka untuk mengukur kemajuan/kinerja.'],
    ['Inbox triage', 'Sorting messages into reply, delegate or needs a decision.', 'Memilah email: dibalas, dialihkan, atau butuh keputusan.'],
    ['Gatekeeping', 'Protecting the executive’s time from unnecessary requests.', 'Menjaga waktu atasan dari permintaan yang tidak perlu.'],
    ['SOP', 'Standard operating procedure: a step-by-step way of doing a task.', 'Langkah baku untuk mengerjakan suatu tugas.'],
  ],
  askThem: [
    'Whose personal brand will I be working on, and what is the main goal for the next 6–12 months?',
    'How is the time split between content work and executive/admin support on a typical week?',
    'How does the hybrid setup work: which days on site, and where?',
    'What tools are you using now for content, scheduling and tasks?',
    'Will I be filming as well, or mainly editing footage that is provided?',
    'How will you measure success in this role after the first three months?',
    'Is there a probation period, and is there a salary review after it?',
  ],
  checklist: [
    'Ask the recruiter (politely) for the company or brand name and the interview format, if not shared yet.',
    'Practice your self-introduction out loud (1 minute).',
    'Prepare 2 real examples: one content result, one time you took initiative.',
    'Open your portfolio: Elevara Instagram posts, carousels, Reels you edited.',
    'Write 2 sample hooks for fitness, mental health or finance.',
    'Pick 3 questions to ask them.',
    'Check internet, camera, mic (or route & outfit if in person). Be ready by 09:15.',
  ],
  review: {
    verdict: 'Good match for you, worth going for, with a few things to clarify.',
    fit: [
      'Both halves of the job match your background: EA to a COO + creative production + social media management.',
      'You already run a real content system (Elevara): pillars, 3×/week calendar, Canva design, captions, publishing, scheduling. That is your portfolio.',
      'Topics (fitness, mental health, finance) are friendly for personal-brand content and easy to grow with educational carousels and Reels.',
    ],
    watch: [
      'It is really two jobs in one. Ask how the week is split, so the EA side does not eat all the content time.',
      'Salary Rp7.5M: well above the Badung minimum wage and fair for Bali, but on the lower side for a combined content manager + EA. Fine to accept; ask about a review after probation.',
      'THR "after 1 year": by Indonesian rules (Permenaker 6/2016) THR is owed pro-rata after 1 month of work. Not something to argue in the first interview, but good to know before signing.',
      '“Executive tasks” can include personal errands. Ask what that usually includes.',
      'Hybrid + Bali-based: confirm location, office days and working hours (content often needs weekend posting/replies).',
      'If they ask about Elevara: be honest, show it as portfolio, and say this job would be your main priority.',
    ],
  },
};

export const INTERVIEWS = { lumi: INTERVIEW, cmea: CMEA };
export const questionsOf = (iv) => (INTERVIEWS[iv] || INTERVIEW).sections.flatMap((s) => s.items.map((it) => ({ ...it, section: s.title, sectionId: s.id })));
