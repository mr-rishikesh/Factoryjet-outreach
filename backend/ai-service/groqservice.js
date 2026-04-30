import Groq from "groq-sdk";
import dotenv from "dotenv";
import { generateEmailPrompt, sequences, helpers } from "./prompt.js";
import { extractJsonFromModel } from "./extractJsonFromModel.js";
dotenv.config();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generates a personalized FactoryJet B2B cold-outreach email for a prospect.
 * Supports both Sequence A (US Shopify DTC) and Sequence B (UK SMBs)
 * Sequence rules: 5 emails over 19 days with specific psychology per email
 * Always returns { subject, body } even if the model output is malformed.
 */
export async function generateColdEmail(contactData, sequenceType = 'A', emailNumber = 1, variantIndex = 0) {
  try {
    // Validate contact data has required tokens
    const validation = helpers.validateTokens('{{first_name}} {{company}} {{industry}}', contactData);
    if (!validation.valid) {
      console.warn("⚠️ Missing tokens:", validation.missing);
    }

    const prompt = generateEmailPrompt(contactData, sequenceType, emailNumber, variantIndex);



    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an expert B2B cold-email copywriter writing on behalf of FactoryJet, a SaaS company offering web development, e-commerce, chatbots, AI-enhanced development, and SEO. Always output strict JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });
    // console.log("🧠 Full Groq API response:", JSON.stringify(response, null, 2));


    // Extract the text from model output
    const text =   
      response?.choices?.[0]?.message?.content?.trim() ||
       response?.choices?.[0]?.message?.reasoning?.trim();
    if (!text) throw new Error("Model returned empty content");

    let parsed = extractJsonFromModel(text);

    // // Try to safely extract JSON
    // try {
    //   // Sometimes model adds notes — so extract only the JSON part
    //   const jsonMatch = text.match(/\{[\s\S]*\}/);
    //   parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    // } catch (err) {
    //   console.warn("⚠️ Model returned non-JSON text, using fallback parser:", text);
    //   // Fallback parser if AI sends plain text like "Subject: ..., Body: ..."
    //   const subjectMatch = text.match(/Subject:\s*(.*)/i);
    //   const bodyMatch = text.match(/Body:\s*([\s\S]*)/i);
    //   parsed = {
    //     subject: subjectMatch ? subjectMatch[1].trim() : null,
    //     body: bodyMatch ? bodyMatch[1].trim() : null,
    //   };
    // }

    // Cleanup and defaults
    const cleanText = (str) =>
      str
        ? str.replaceAll("\\n", "\n").replaceAll("\n\n", "\n").replaceAll("\\t", "\t").trim()
        : "";

    const company = contactData.companyName || "your team";
    const firstName = contactData.firstName || "there";

    // Sequence-specific fallback templates
    const fallbackTemplates = {
      A: {
        subject: `${company}'s support costs`,
        body: `${firstName},\n\nMost brands doing $2M–$10M on Shopify spend $15K–$25K monthly on customer support without realizing it.\n\nWe helped a brand in your space resolve 70% of those tickets automatically in 90 days, without replacing their helpdesk.\n\nWorth a 15-minute Loom?`
      },
      B: {
        subject: `${company}'s search traffic`,
        body: `${firstName},\n\nMost {{industry}} businesses in the UK are seeing organic search traffic shift in 2026 — not because rankings dropped, but because Google now shows AI summaries above position 1.\n\nSeer Interactive measured 61% drop in clicks where these appear.\n\nHappy to pull together a snapshot of where you stand. Worth it?`
      }
    };

    const subject = parsed.subject?.trim() || fallbackTemplates[sequenceType]?.subject || `A quick idea for ${company}`;
    const body = parsed.body || fallbackTemplates[sequenceType]?.body || `${firstName},\n\nCame across ${company} and your approach stood out. We help teams like yours with high-performance websites, e-commerce, AI chatbots, and SEO. Open to a quick chat?`;

    return { subject, body };
  } catch (err) {
    console.error("❌ Error generating cold email:", err);

    const company = contactData.companyName || "your team";
    const firstName = contactData.firstName || "there";

    // Fallback by sequence type
    const fallbackTemplates = {
      A: {
        subject: `${company}'s support costs`,
        body: `${firstName},\n\nMost brands doing $2M–$10M on Shopify spend $15K–$25K monthly on customer support without realizing it.\n\nWe helped a brand in your space resolve 70% of those tickets automatically in 90 days, without replacing their helpdesk.\n\nWorth a 15-minute Loom?`
      },
      B: {
        subject: `${company}'s search traffic`,
        body: `${firstName},\n\nMost businesses in the UK are seeing organic search traffic shift in 2026 — Google now shows AI summaries above position 1.\n\nSeer Interactive measured 61% drop in clicks where these appear.\n\nHappy to pull together a snapshot of where you stand. Worth it?`
      }
    };

    return fallbackTemplates[sequenceType] || {
      subject: `A quick idea for ${company}`,
      body: `${firstName},\n\nCame across ${company} and your approach stood out. We help teams like yours with high-performance websites, e-commerce, AI chatbots, and SEO. Open to a quick chat?`
    };
  }
}
