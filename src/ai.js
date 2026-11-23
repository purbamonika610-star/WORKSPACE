// Content generation: topic ideas + full per-slide carousel scripts and captions.
// Uses Claude when an Anthropic API key is set; otherwise falls back to built-in templates.
// Text only: Monika designs every carousel manually in Canva.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5-5';

const TOPIC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['topics'],
  properties: {
    topics: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'hook', 'pillar', 'why', 'format', 'plan'],
        properties: {
          title: { type: 'string' },
          hook: { type: 'string' },
          pillar: { type: 'string' },
          why: { type: 'string' },
          format: { type: 'string' },
          plan: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

const CAROUSEL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['slides', 'caption', 'hashtags', 'cta'],
  properties: {
    slides: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['headline', 'body', 'design_note'],
        properties: {
          headline: { type: 'string' },
          body: { type: 'string' },
          design_note: { type: 'string' },
        },
      },
    },
    caption: { type: 'string' },
    hashtags: { type: 'array', items: { type: 'string' } },
    cta: { type: 'string' },
  },
};

const LANG_NAME = { en: 'English', id: 'Bahasa Indonesia', both: 'English first, then a Bahasa Indonesia version of the caption' };

async function callClaude(apiKey, system, user, schema) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const base = {
    model: MODEL,
    max_tokens: 8000,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
  };
  let res;
  try {
    res = await client.beta.messages.create({ ...base, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
  } catch (e) {
    if (e?.status === 400 && /fallback/i.test(e.message || '')) res = await client.messages.create(base);
    else throw e;
  }
  if (res.stop_reason === 'refusal') throw new Error('The AI declined this request. Try another topic.');
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return JSON.parse(text);
}

function systemPrompt(strategy, lang) {
  return `You are the social media content strategist for this brand. Follow the strategy exactly.

<strategy>
${strategy}
</strategy>

The owner designs every carousel by hand in Canva, so you only write text: slide copy plus a short layout/visual note per slide that helps her design it manually. Never suggest automated design tools or AI image generators.
Write all content in ${LANG_NAME[lang] || 'English'}.`;
}

export async function aiTopics({ apiKey, strategy, lang, count, avoid, feedback }) {
  const user = `Suggest ${count} fresh Instagram carousel topic ideas that fit the strategy and rotate across the content pillars.
Each idea: a clear title, the slide-1 hook line, the pillar it belongs to, one sentence on why it will work for this audience, the best format (e.g. "Carousel 8 slides", "Reel 20s + carousel"), and a short execution plan: 3–5 concrete steps for how to make and run it this week (research, script, design in Canva, film/edit, post & engage).
${feedback ? `Owner feedback to apply: ${feedback}\n` : ''}Do not repeat or closely resemble any of these topics:
${avoid.slice(-60).map((x) => `- ${x}`).join('\n') || '- (none yet)'}`;
  const out = await callClaude(apiKey, systemPrompt(strategy, lang), user, TOPIC_SCHEMA);
  return out.topics.slice(0, count);
}

export async function aiCarousel({ apiKey, strategy, lang, topic, feedback, previous }) {
  const user = `Write the complete Instagram carousel for this topic.
Title: ${topic.title}
Hook: ${topic.hook}
Pillar: ${topic.pillar}

Follow the strategy's carousel structure (7–9 slides, one idea per slide, short punchy copy that fits a slide). For each slide give a headline, body text and a short Canva design note (layout, emphasis, visual idea).
Then write the full caption (hook line, value, CTA), a list of 5–8 hashtags (with #), and the main CTA.${
    feedback && previous ? `\n\nThis is a revision. The previous version was:\n${JSON.stringify(previous)}\n\nOwner feedback to apply: ${feedback}` : ''
  }`;
  return callClaude(apiKey, systemPrompt(strategy, lang), user, CAROUSEL_SCHEMA);
}

// ---------------- Template fallback (no API key) ----------------
const BANK = {
  elevara: [
    ['5 admin tasks every founder should outsource first', 'You\'re losing 10 hours a week to tasks someone else could do.', 'Business Support'],
    ['How to follow up with leads without sounding pushy', 'Most deals are lost after the first message, not before it.', 'Business Support'],
    ['A simple CRM setup for small businesses', 'If your leads live in your DMs, you\'re losing money.', 'Business Support'],
    ['The lead generation routine that takes 30 minutes a day', '30 minutes a day = a full pipeline in 30 days.', 'Business Support'],
    ['Cold email template that actually gets replies', 'Your cold email is getting deleted in 3 seconds. Here\'s why.', 'Business Support'],
    ['Signs your business needs a virtual assistant', 'Still answering every email yourself? Read this.', 'Business Support'],
    ['What makes a carousel get saved (not just liked)', 'Likes feel good. Saves grow your account.', 'Creative Services'],
    ['How to plan a month of content in one afternoon', 'Never wonder "what should I post today?" again.', 'Creative Services'],
    ['Reels editing mistakes that kill your views', 'Your Reel loses people in the first 2 seconds.', 'Creative Services'],
    ['Brand consistency checklist for Instagram', 'Would people recognise your post without your logo?', 'Creative Services'],
    ['What a website homepage needs above the fold', 'Visitors decide in 5 seconds whether to stay.', 'Creative Services'],
    ['Content pillars explained for busy business owners', 'Posting randomly is why your content feels hard.', 'Creative Services'],
    ['How to structure a strong university presentation', 'A great presentation is built before you open the slides.', 'Academic Services'],
    ['Study system for students who work part-time', 'Less time, better grades: it\'s about the system.', 'Academic Services'],
    ['How to format a thesis without losing your mind', 'Formatting shouldn\'t take longer than writing.', 'Academic Services'],
    ['Research tips: finding credible sources fast', 'Stop scrolling page 5 of Google for sources.', 'Academic Services'],
    ['Meet Elevara: who we are and how we help', 'One team for your business, creative and academic needs.', 'How Elevara works'],
    ['How working with Elevara works, step by step', 'From first message to finished project in 4 simple steps.', 'How Elevara works'],
    ['Behind the scenes: how we design a carousel', 'Every slide you see started as a messy sketch.', 'How Elevara works'],
    ['FAQ: what clients ask before working with us', 'The 6 questions everyone asks before hiring us.', 'How Elevara works'],
    ['Before & after: a client\'s Instagram glow-up', 'Same business. Same products. Different results.', 'How Elevara works'],
  ],
  sister: [
    ['Meet our best-seller', 'The one everyone orders twice.', 'Products & menu'],
    ['Behind the scenes: how we make it fresh every morning', 'Our day starts at 5 AM. Here\'s why.', 'Behind the scenes'],
    ['3 reasons locals keep coming back', 'Not just tourists love us 😉', 'Customer moments'],
    ['How to find us in Bali', 'Save this for your next Bali trip.', 'Bali lifestyle'],
    ['This week\'s promo', 'Bring a friend, get a little treat.', 'Promos'],
    ['New on the menu', 'You asked. We made it.', 'Products & menu'],
    ['Our story: why we started', 'It began in a tiny kitchen.', 'Behind the scenes'],
  ],
  personal: [
    ['What I learned preparing for a remote job interview', 'I almost cancelled this interview. Glad I didn\'t.', 'Career growth'],
    ['My simple weekly planning system', 'I stopped keeping everything in my head. Here\'s how.', 'Productivity'],
    ['Building an agency from Bali: month 1', 'Starting a business is messier than Instagram shows.', 'Building a business'],
    ['Remote work skills that actually got me noticed', 'It wasn\'t my CV that stood out.', 'Career growth'],
    ['A day in my life working remotely in Bali', 'Not every day is beach and laptop.', 'Lifestyle'],
    ['How I stay consistent with content', 'Consistency isn\'t motivation. It\'s a system.', 'Productivity'],
  ],
};

export function templateTopics({ brand, count, avoid }) {
  const used = new Set(avoid.map((x) => x.toLowerCase()));
  const pool = (BANK[brand] || BANK.elevara).filter(([t]) => !used.has(t.toLowerCase()));
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map(([title, hook, pillar]) => ({
    title, hook, pillar,
    why: `Fits the "${pillar}" pillar and gives practical value people want to save.`,
    format: 'Carousel, 8 slides',
    plan: ['Write the script from the generated slides (15 min)', 'Design the 8 slides manually in Canva (60–90 min)', 'Review captions & hashtags the day before', 'Post at your usual time, reply to every comment in the first hour', 'Share to Stories with a poll or question sticker'],
  }));
}

export function templateCarousel({ topic }) {
  const slides = [
    { headline: topic.hook, body: topic.title, design_note: 'Cover: big bold hook, lots of white space, brand color accent.' },
    { headline: 'Why this matters', body: `If you ignore this, it costs you time, clients or growth. Let's fix it.`, design_note: 'Short problem statement, one icon.' },
    { headline: 'Step 1', body: 'Write the first practical tip here — one clear action.', design_note: 'Number "1" large on the left, text on the right.' },
    { headline: 'Step 2', body: 'Second practical tip — keep it under 25 words.', design_note: 'Same layout as slide 3 for consistency.' },
    { headline: 'Step 3', body: 'Third practical tip — add a quick example.', design_note: 'Same layout; highlight the example in a soft box.' },
    { headline: 'Quick example', body: 'Show a mini before/after or a real situation.', design_note: 'Two-column before/after.' },
    { headline: 'Recap', body: '1. … 2. … 3. … Save this so you don\'t forget.', design_note: 'Checklist style.' },
    { headline: 'Need help with this?', body: 'DM us "ELEVARA" or book a free call — link in bio.', design_note: 'CTA slide: logo, handle, button-style CTA.' },
  ];
  return {
    slides,
    caption: `${topic.hook}\n\n${topic.title} — here's a simple way to get it right without overthinking it. Swipe through, save it for later, and send it to someone who needs it.\n\nWant us to handle it for you? DM "ELEVARA" 💬`,
    hashtags: ['#elevara', '#smallbusinesstips', '#contentstrategy', '#virtualassistant', '#businessgrowth', '#instagramtips'],
    cta: 'DM "ELEVARA" or book a free call (link in bio)',
    template: true,
  };
}

// ---------------- Daily trend research (live web search) ----------------
export async function aiTrends({ apiKey, strategy, lang, brandName, today }) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const system = systemPrompt(strategy, lang);
  const user = `Today is ${today}. Use web search to research what is trending RIGHT NOW (this week) on Instagram and TikTok that is relevant to ${brandName} and its audience: content formats, Reels/carousel styles, audio/hooks, topics and news in the niche, and platform changes.

Then reply with ONLY a JSON object (no other text) in this shape:
{
  "weekly_focus": "one sentence: the single most important content focus this week",
  "trends": [ { "name": "", "what": "what it is, 1 sentence", "why_now": "why it matters this week", "how_to_use": "how ${brandName} can use it", "format": "Reel | Carousel | Story | ...", "heat": 1-5, "source": "URL" } ],
  "ideas": [ { "title": "", "hook": "", "pillar": "", "why": "", "format": "", "plan": ["step 1", "step 2", "step 3"] } ]
}
Give 5 trends and 4 ideas built on those trends. Ideas must fit the strategy and be designable manually in Canva.`;
  const messages = [{ role: 'user', content: user }];
  let res;
  for (let i = 0; i < 4; i++) {
    res = await client.messages.create({
      model: MODEL,
      max_tokens: 12000,
      system,
      messages,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 6 }],
      output_config: { effort: 'low' },
    });
    if (res.stop_reason !== 'pause_turn') break;
    messages.push({ role: 'assistant', content: res.content });
  }
  if (res.stop_reason === 'refusal') throw new Error('The AI declined this request.');
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Could not read the trend report. Try again.');
  return JSON.parse(m[0]);
}

export const EVERGREEN_TRENDS = [
  { name: 'Carousel "myth vs fact"', what: 'Swipe posts that correct a common belief.', why_now: 'Saves and shares are the strongest reach signal right now.', how_to_use: 'Pick one myth your clients believe and correct it in 6–8 slides.', format: 'Carousel', heat: 4 },
  { name: 'Behind-the-scenes Reels', what: 'Raw, low-edit clips of the real work process.', why_now: 'Authentic, unpolished content keeps outperforming polished ads.', how_to_use: 'Film 10 seconds of designing a carousel or a client call setup.', format: 'Reel', heat: 4 },
  { name: 'Text-on-screen talking Reels', what: 'Face to camera with big captions, one tip.', why_now: 'Most people watch without sound.', how_to_use: 'One tip per Reel, hook in the first 2 seconds.', format: 'Reel', heat: 3 },
  { name: 'Save-worthy checklists', what: 'Single-slide or carousel checklists.', why_now: 'Easy to save = longer life in the algorithm.', how_to_use: 'Turn any service into a 7-point checklist.', format: 'Carousel', heat: 3 },
  { name: 'Story polls & question stickers', what: 'Interactive Stories that start DMs.', why_now: 'DMs are where clients convert.', how_to_use: 'Ask a yes/no question about their biggest struggle, reply to every vote.', format: 'Story', heat: 3 },
];

const IV_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    score: { type: 'integer', description: '1-10' },
    verdict: { type: 'string', enum: ['ready', 'almost', 'practice'] },
    covered: { type: 'array', items: { type: 'string' } },
    missing: { type: 'array', items: { type: 'string' } },
    tips: { type: 'array', items: { type: 'string' } },
    better: { type: 'string', description: 'Her answer rewritten slightly better, keeping her own words and length' },
  },
  required: ['score', 'verdict', 'covered', 'missing', 'tips', 'better'],
};

export async function aiInterviewFeedback({ apiKey, question, meaning, keys, sample, transcript }) {
  const system = `You are a friendly, honest interview coach. Monika is an Indonesian candidate practising spoken English for a Personal Assistant interview (Zoom) tomorrow. Her answer comes from speech-to-text, so ignore missing punctuation and small transcription errors. Judge content, structure, clarity and confidence, not perfect grammar. Write "tips" (max 4, short, practical) in simple Bahasa Indonesia. "covered" and "missing" list the key points (short, in English). "better" is her answer improved in natural spoken English, about the same length, keeping her own facts. Never invent experience she did not mention.`;
  const user = `Question: ${question}\nWhat the interviewer wants: ${meaning}\nKey points:\n${keys.map((k) => `- ${k}`).join('\n')}\n\nReference answer (for context only, she should not memorise it word for word):\n${sample}\n\nHer spoken answer (transcript):\n${transcript}`;
  return callClaude(apiKey, system, user, IV_SCHEMA);
}
