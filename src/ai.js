// Content generation: topic ideas + full per-slide carousel scripts and captions.
// Uses Claude when an Anthropic API key is set; otherwise falls back to built-in templates.
// Text only: Monika designs every carousel manually in Canva.
import Anthropic from '@anthropic-ai/sdk';
import { LIBRARY, libraryFor } from './library.js';

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
  const user = `Suggest ${count} fresh Instagram carousel topic ideas (each one = a clear audience problem with 3 solutions, 5 slides) that fit the strategy and rotate across the content pillars.
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

Use exactly 5 slides: slide 1 = a scroll-stopping hook that names the audience's problem; slides 2–4 = three concrete, creative solutions (one per slide); slide 5 = CTA that states clearly what problem we solve for them. Short punchy copy (max ~25 words per slide). For each slide give a headline, body text and a short Canva design note (layout, emphasis, visual idea).
Then write the full caption (hook line, value, CTA), a list of 5–8 hashtags (with #), and the main CTA.${
    feedback && previous ? `\n\nThis is a revision. The previous version was:\n${JSON.stringify(previous)}\n\nOwner feedback to apply: ${feedback}` : ''
  }`;
  return callClaude(apiKey, systemPrompt(strategy, lang), user, CAROUSEL_SCHEMA);
}

// ---------------- Template fallback (no API key) ----------------

const PLAN5 = ['Read the 5-slide script and adjust any words to your voice (10 min)', 'Design the 5 slides manually in Canva (45–60 min)', 'Review the caption & hashtags the day before', 'Post at your usual time and reply to every comment in the first hour', 'Share slide 1 to Stories with a poll or question sticker'];

export function templateTopics({ brand, count, avoid, hard = [], rejected = [] }) {
  const low = (x) => x.toLowerCase();
  const lib = Object.values(LIBRARY[brand] || LIBRARY.elevara);
  const seen = new Set(avoid.map(low));
  const shuffle = (a) => a.slice().sort(() => Math.random() - 0.5);
  // Only topics never rejected and not already in the inbox or plan.
  const list = shuffle(lib.filter((x) => !seen.has(low(x.title)))).slice(0, count);
  return list.map((x) => ({
    title: x.title, hook: x.hook, pillar: x.pillar,
    why: `Problem it solves: ${x.problem}`,
    format: 'Carousel, 5 slides',
    preview: x.carousel.slides.map((sl) => sl.headline),
    plan: PLAN5,
  }));
}

export function templateCarousel({ topic, brand }) {
  const hit = libraryFor(brand, topic.title);
  if (hit) return { ...structuredClone(hit.carousel), template: true, library: true };
  const slides = [
    { headline: topic.hook, body: `${topic.title}: here’s what’s really going wrong, and how to fix it.`, design_note: 'Cover: hook in big bold type, highlight the problem word in brand color, lots of white space.' },
    { headline: 'Solution 1', body: 'The first fix: one clear action your audience can take today.', design_note: 'Big number “1” on the left, bold headline, 2 short lines.' },
    { headline: 'Solution 2', body: 'The second fix: keep it under 25 words.', design_note: 'Same layout, number “2”.' },
    { headline: 'Solution 3', body: 'The third fix: add a quick example.', design_note: 'Same layout, number “3”.' },
    { headline: 'We solve this for you.', body: 'Say exactly what problem you solve, then: DM us or book a free call (link in bio).', design_note: 'CTA: what we solve in bold, logo + handle, button-style CTA.' },
  ];
  return {
    slides,
    caption: `${topic.hook}\n\n${topic.title}: three simple fixes in this post. Swipe through, save it for later, and send it to someone who needs it.\n\nWant us to handle it for you? DM us 💬`,
    hashtags: ['#smallbusinesstips', '#contentstrategy', '#businessgrowth', '#instagramtips'],
    cta: 'DM us or book a free call (link in bio)',
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
