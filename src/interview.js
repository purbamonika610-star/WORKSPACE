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
