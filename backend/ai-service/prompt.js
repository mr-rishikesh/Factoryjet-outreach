/**
 * FactoryJet Cold Email Sequences — 2026
 * Dual sequence system for AI Agent Development (US) and AI SEO (UK)
 * Each sequence has 5 emails over 19 days with specific psychology and angles
 */

// Subject line A/B test variants
const SUBJECT_LINES = {
  A: {
    email1: [
      "{{company}}'s support costs", // Primary
      "support volume at {{company}}",
      "70% ticket deflection",
      "{{first_name}} — quick question",
      "the CS headcount trap"
    ],
    email2: [
      "90-day result — {{industry}} brand", // Primary
      "{{company}} + AI support: 71% automated",
      "same Shopify setup, no helpdesk change",
      "what we built for your space"
    ],
    email3: [
      "how the smarter {{industry}} brands are handling this", // Primary
      "it's a structural change, not a tool swap",
      "{{company}} — before your next launch",
      "{{industry}}: AI-first or hire more people"
    ],
    email4: [
      "worth asking directly", // Primary
      "two quick questions",
      "{{company}} — support or not?",
      "one direct question"
    ],
    email5: [
      "closing the loop", // Primary
      "last note from me",
      "{{company}} — if timing changes",
      "respect your inbox"
    ]
  },
  B: {
    email1: [
      "{{company}}'s search traffic", // Primary
      "AI summaries and {{company}}",
      "something shifted on Google UK",
      "your top keywords in 2026",
      "{{first_name}} — one question"
    ],
    email2: [
      "6-month result — UK {{industry}} brand", // Primary
      "traffic held flat while competitors dropped",
      "{{company}} in AI search results",
      "what cited in AI summaries means now"
    ],
    email3: [
      "where {{company}} stands in AI search", // Primary
      "pulled a quick check this morning",
      "{{industry}} — traditional search vs AI search",
      "your buyers are asking AI, not Google"
    ],
    email4: [
      "worth asking directly", // Primary
      "one question",
      "{{company}} — on your radar for 2026?",
      "is this a priority?"
    ],
    email5: [
      "last note", // Primary
      "no more emails after this one",
      "{{company}} — if things change",
      "I don't want to fill your inbox"
    ]
  }
};

// Forbidden words and phrases (spam triggers from non-Western infrastructure)
const FORBIDDEN_WORDS = [
  "free", "guarantee", "no risk", "risk-free",
  "limited time", "act now", "urgent", "important",
  "click here", "visit our website", "check this out",
  "seo", "search engine ranking", "google ranking",
  "discount", "offer", "deal", "savings", "affordable",
  "passive income", "revenue streams", "earn money",
  "i hope this finds you well",
  "just checking in", "just following up",
  "per my last email", "as mentioned",
  "we are a leading agency", "we are the best",
  "revolutionary", "game-changing", "cutting-edge", "innovative",
  "excited to connect", "thrilled to reach out", "delighted"
];

/**
 * SEQUENCE A: AI Agent Development → US Shopify DTC Brands
 * ICP: Founder or Head of CX at Shopify/Shopify Plus brands ($1M–$30M GMV)
 * Sending from: bhavesh@factoryjetecom.com
 */
const SEQUENCE_A = {
  name: "AI Agent Development → US Shopify DTC Brands",
  icp: "Founder or Head of CX at Shopify/Shopify Plus brands ($1M–$30M GMV)",
  sending_from: "bhavesh@factoryjetecom.com",

  email1: {
    day: 1,
    angle: "The Category Insight — quantified pain in dollars",
    wordLimit: 80,
    preview: "a number most {{industry}} founders don't track",
    subjectVariants: SUBJECT_LINES.A.email1,
    template: `Most brands doing $2M–$10M on Shopify spend $15K–$25K monthly on customer support - mostly order tracking, returns, and size or product queries - without realising it's that high until they add it up.

We helped a brand in your space resolve 70% of those tickets automatically in 90 days, without replacing their helpdesk or retraining their team.

Worth a 15-minute Loom showing how it works?`,
    cta: "Loom walkthrough",
    psychological_notes: "Opens with category truth (not prospect-specific claim). Quantifies pain in dollars. Low-friction CTA."
  },

  email2: {
    day: 4,
    angle: "The Proof Drop — specific case study with metrics",
    wordLimit: 120,
    preview: "same Shopify setup, no helpdesk change",
    subjectVariants: SUBJECT_LINES.A.email2,
    template: `Sharing a result from a project we wrapped earlier this year.

A {{industry}} brand on Shopify Plus was handling around 2,800 support tickets monthly — mostly order tracking, returns, and product queries. Their CS team was stretched heading into a product launch.

We built an AI support layer on top of their existing helpdesk. 90 days in: 71% of tickets resolved without a human touching them. The CS team shifted focus to high-value conversations and repeat customers.

No new software for their team to learn. No ripping out what they already had.

Happy to walk you through the build — 20 minutes on a call or a Loom, whichever is easier.`,
    cta: "Call or Loom",
    psychological_notes: "Specific numbers (2,800, 71%, 90 days) build credibility. 'No rip-and-replace' pre-empts #1 objection. Two CTA options reduce friction."
  },

  email3: {
    day: 8,
    angle: "The Broader Shift — market trend (breaks pattern, no case study)",
    wordLimit: 120,
    preview: "it's a structural change, not a tool swap",
    subjectVariants: SUBJECT_LINES.A.email3,
    template: `Something we're seeing consistently across {{industry}} brands on Shopify right now:

The ones pulling ahead on retention aren't adding more CS headcount — they're treating AI as the first-response layer and keeping their human team for escalations, VIP customers, and win-back conversations.

The economics make sense. A senior CS rep fully loaded costs $65–$85K/year in the US and still can't work nights, weekends, or handle 300 tickets at once during a sale. An AI layer handles all of that and costs a fraction.

The brands that set this up before their next major launch or sale period are the ones that don't scramble during peak volume.

4–6 weeks to build and deploy properly. Open to a quick call to see if it fits where {{company}} is right now?`,
    cta: "Quick call",
    psychological_notes: "Completely different angle from Emails 1-2. Addresses alternative (another hire) directly. '4–6 weeks' creates implicit timing urgency. Single soft CTA."
  },

  email4: {
    day: 13,
    angle: "The Direct Ask — yes/no question (pattern break again)",
    wordLimit: 120,
    preview: "two questions",
    subjectVariants: SUBJECT_LINES.A.email4,
    template: `Sent a few notes about AI support for {{company}} — wanted to ask directly rather than keep guessing.

Two quick questions:

Is support volume something {{company}} is actively looking to solve in the next quarter? And is a Bengaluru-based team something that would work for you, or does location matter for this kind of build?

Either answer helps me know whether it's worth continuing the conversation or leaving you alone.`,
    cta: "Direct reply",
    psychological_notes: "Breaks pattern of previous three emails. Directness is disarming. Location question pre-empts offshore objection. Any reply = conversation opened."
  },

  email5: {
    day: 19,
    angle: "The Respectful Exit — breakup email (short = higher reply rate)",
    wordLimit: 60,
    preview: "last note from me",
    subjectVariants: SUBJECT_LINES.A.email5,
    template: `Sent a few notes over the past few weeks — nothing back, so I'll assume the timing isn't right for {{company}}.

Not going to keep filling your inbox.

If support volume becomes a priority later this year, just reply to this and I'll pick it back up from here.

Appreciate you reading.`,
    cta: "None (door left open)",
    psychological_notes: "Under 60 words. 'I'll assume timing isn't right' removes guilt. No tokens that could go wrong. Breakup emails generate replies from interested-but-busy prospects."
  }
};

/**
 * SEQUENCE B: AI SEO / GEO → UK Founder-Led SMBs
 * ICP: Marketing Director or Founder at UK SMB (£1M–£50M revenue)
 * Compliance: Corporate entities only, unsubscribe from Email 1, GDPR legitimate interest
 * Sending from: bhavesh@factoryjetecom.com
 */
const SEQUENCE_B = {
  name: "AI SEO / GEO → UK Founder-Led SMBs",
  icp: "Marketing Director or Founder at UK SMB (£1M–£50M revenue)",
  sending_from: "bhavesh@factoryjetecom.com",
  compliance: "Corporate entities only. Unsubscribe link from Email 1. UK GDPR legitimate interest basis.",

  email1: {
    day: 1,
    angle: "The Search Shift — market-level truth with credible stat",
    wordLimit: 80,
    preview: "something shifted on Google UK",
    subjectVariants: SUBJECT_LINES.B.email1,
    template: `Most {{industry}} businesses in the UK are seeing organic search traffic behave differently in 2026 — not because their rankings dropped, but because Google is now showing AI-generated summaries above position 1 on a growing share of searches.

Seer Interactive measured a 61% drop in clicks on searches where these summaries appear. Position 1 no longer means what it did 18 months ago.

The businesses recovering fastest are getting cited inside those summaries, not just ranked below them. It's a different discipline to traditional SEO.

Happy to put together a one-page snapshot of where {{company}} stands on this. Worth it?`,
    cta: "Snapshot offer",
    psychological_notes: "Opens with market-level truth. 61% stat is real and verifiable. 'Worth it?' is yes/no with lowest friction. Three tokens only."
  },

  email2: {
    day: 4,
    angle: "The UK Result — specific metrics and pricing anchor",
    wordLimit: 120,
    preview: "traffic held flat while competitors dropped",
    subjectVariants: SUBJECT_LINES.B.email2,
    template: `Sharing a result from a UK client in {{industry}} we started working with late last year.

They were losing clicks to AI summaries on 14 of their top 20 search terms. We restructured their content to get cited inside those summaries — targeting ChatGPT, Perplexity, and Google's AI Overviews specifically.

Six months in: cited in AI results for 9 of those 14 terms. Their organic traffic held flat while competitors in the same space dropped 30–45%.

We're based in Bengaluru — 4.5 hours overlap with UK working hours, most work is async. Priced at £750–£1,200/month depending on scope, versus the £2,500–£4,500/month UK agencies are charging for the same service.

Worth 20 minutes to show you what this looks like for {{company}}?`,
    cta: "20-minute call",
    psychological_notes: "Specific numbers (14, 9, 6 months, 30–45%) build trust. Price anchor in Email 2 (not Email 1) — earns right after proof. Time-zone call-out is UK trust signal."
  },

  email3: {
    day: 8,
    angle: "The Visibility Gap — concrete deliverable offer (no new claims)",
    wordLimit: 120,
    preview: "pulled a quick check this morning",
    subjectVariants: SUBJECT_LINES.B.email3,
    template: `Ran a quick check on how {{company}} appears across AI search platforms — ChatGPT, Perplexity, and Google's AI Overviews — for the kind of queries your buyers run.

For most {{industry}} businesses at your stage, the pattern is the same: strong traditional search presence, very little AI citation. The two don't automatically go together.

The one-page snapshot I mentioned in my first note shows exactly which queries your buyers are asking AI tools, which competitors are being cited, and what it would take to get {{company}} into those results.

No obligation — happy to send it over if useful. Want me to?`,
    cta: "Snapshot delivery",
    psychological_notes: "References first email naturally (no 'following up on my last email'). Snapshot is concrete deliverable. 'Want me to?' = two-word minimum friction CTA."
  },

  email4: {
    day: 13,
    angle: "The Direct Question — pattern break via brevity",
    wordLimit: 60,
    preview: "one question",
    subjectVariants: SUBJECT_LINES.B.email4,
    template: `Three notes about AI search visibility for {{company}} — going to ask directly rather than keep guessing.

Is this something on your radar for 2026, or is it not a priority right now?

Either answer is genuinely useful — helps me know whether to stay in touch or leave you alone.`,
    cta: "Direct reply",
    psychological_notes: "46 words (shortest in sequence by design). Pattern break after three substantial emails. Yes/no question. 'Leave you alone' signals respect."
  },

  email5: {
    day: 19,
    angle: "The Exit — respectful breakup (zero pressure)",
    wordLimit: 60,
    preview: "no more emails after this one",
    subjectVariants: SUBJECT_LINES.B.email5,
    template: `Last note — I don't want to be another name filling your inbox.

If AI search visibility becomes something {{company}} wants to look at later this year, just reply here and I'll pick it back up.`,
    cta: "None (door fully open)",
    psychological_notes: "38 words. Clean, respectful, no desperation. 'I don't want to be another name' = awareness of cold email noise. Often generates replies from interested-but-busy prospects."
  }
};

/**
 * Helper Functions for Email Generation
 */

// Validate tokens are filled correctly
const validateTokens = (text, contact) => {
  const tokens = text.match(/\{\{(.*?)\}\}/g) || [];
  const missing = [];

  tokens.forEach(token => {
    if (token === "{{first_name}}" && !contact.firstName) missing.push("first_name");
    if (token === "{{company}}" && !contact.companyName) missing.push("company");
    if (token === "{{industry}}" && !contact.industry) missing.push("industry");
  });

  return { valid: missing.length === 0, missing };
};

// Check for forbidden words (spam triggers)
const checkForbiddenWords = (text) => {
  const lowerText = text.toLowerCase();
  const found = FORBIDDEN_WORDS.filter(word => lowerText.includes(word));
  return { clean: found.length === 0, forbidden: found };
};

// Count words for limit validation
const countWords = (text) => {
  return text.trim().split(/\s+/).length;
};

// Validate email against sequence rules
const validateEmail = (emailContent, sequenceType, emailNumber) => {
  const sequence = sequenceType === 'A' ? SEQUENCE_A : SEQUENCE_B;
  const email = sequence[`email${emailNumber}`];

  const validation = {
    tokens: validateTokens(emailContent, {}),
    forbidden: checkForbiddenWords(emailContent),
    wordCount: {
      actual: countWords(emailContent),
      limit: email.wordLimit,
      valid: countWords(emailContent) <= email.wordLimit
    },
    hasCTA: emailContent.toLowerCase().includes('worth') || emailContent.toLowerCase().includes('?'),
    singleLink: (emailContent.match(/https?:\/\//g) || []).length <= 1
  };

  return validation;
};

// Fill tokens in email template
const fillTokens = (template, contact) => {
  let filled = template;
  filled = filled.replace(/\{\{first_name\}\}/g, contact.firstName || "");
  filled = filled.replace(/\{\{company\}\}/g, contact.companyName || "");
  filled = filled.replace(/\{\{industry\}\}/g, contact.industry || "");
  return filled;
};

// Select subject line variant (rotate through A/B tests)
const selectSubjectVariant = (sequenceType, emailNumber, variantIndex = 0) => {
  const variants = sequenceType === 'A'
    ? SUBJECT_LINES.A[`email${emailNumber}`]
    : SUBJECT_LINES.B[`email${emailNumber}`];
  return variants[variantIndex % variants.length];
};

/**
 * MAIN EXPORT: Complete prompt for Groq API
 * This generates the system message for the LLM
 */
export const generateEmailPrompt = (contact, sequenceType = 'A', emailNumber = 1, variantIndex = 0) => {
  const sequence = sequenceType === 'A' ? SEQUENCE_A : SEQUENCE_B;
  const email = sequence[`email${emailNumber}`];
  const subjectVariant = selectSubjectVariant(sequenceType, emailNumber, variantIndex);

  const prompt = `You are a professional cold-email copywriter writing sequences for FactoryJet (https://factoryjet.com).

SEQUENCE: ${sequence.name}
EMAIL NUMBER: ${emailNumber}/5
SENDING FROM: ${sequence.sending_from}
ICP: ${sequence.icp}

ANGLE FOR THIS EMAIL: ${email.angle}
PSYCHOLOGICAL APPROACH: ${email.psychological_notes}

TEMPLATE TO FOLLOW:
${email.template}

CONTACT INFORMATION:
${JSON.stringify(contact, null, 2)}

CRITICAL INSTRUCTIONS - DO NOT VIOLATE THESE:

🚫 DO NOT include greeting or name at the start (Hi {{first_name}}, or {{first_name}},)
   → The system will add "Hi FirstName," automatically
   → Start DIRECTLY with the email content
   → Only use {{first_name}}, {{company}}, {{industry}} tokens inside the body

CONTENT INSTRUCTIONS:
1. Fill the three safe tokens ONLY: {{first_name}}, {{company}}, {{industry}}
2. Do NOT add other tokens or personalization beyond these three
3. Start directly with content (NO greeting, NO "Hi", NO name)
4. Keep word count under ${email.wordLimit} words
5. Never use these forbidden words: ${FORBIDDEN_WORDS.slice(0, 10).join(', ')} (full list: see forbidden words)
6. No exclamation marks in subject line
7. No ALL CAPS in subject
8. Plain text only — no markdown, no HTML
9. Single CTA only: ${email.cta}
10. Return ONLY valid JSON:
{
  "subject": "${subjectVariant}",
  "body": "Start directly with content (no greeting). Use {{first_name}}, {{company}}, {{industry}} only."
}

FORBIDDEN WORDS (remove immediately if present):
${FORBIDDEN_WORDS.join(', ')}

Remember: This is Email ${emailNumber} of the sequence. The prospect will receive Email ${emailNumber + 1 || 'none'} in ${email.day + (emailNumber < 5 ? (emailNumber < 4 ? 3 : 5) : 0)} days.`;

  return prompt;
};

/**
 * Export templates for testing/validation
 */
export const sequences = { SEQUENCE_A, SEQUENCE_B };
export const helpers = { validateTokens, checkForbiddenWords, countWords, validateEmail, fillTokens, selectSubjectVariant };
export const forbiddenWords = FORBIDDEN_WORDS;
