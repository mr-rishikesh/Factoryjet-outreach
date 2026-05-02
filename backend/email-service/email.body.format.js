


export function replaceTokens(text, user) {
  if (!text) return text;
  return text
    .replace(/{{first_name}}/gi, user?.firstName || "there")
    .replace(/{{firstName}}/gi, user?.firstName || "there")
    .replace(/{{company}}/gi, user?.companyName || "your team")
    .replace(/{{companyName}}/gi, user?.companyName || "your team")
    .replace(/{{industry}}/gi, user?.industry || "your industry")
    .replace(/{{lastName}}/gi, user?.lastName || "")
    .replace(/{{last_name}}/gi, user?.lastName || "");
}

export async function formate(body, user, thanks, unsubscribeUrl = null) {
    const greetingName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "there";

    // Replace tokens in body first
    let bodyWithTokens = replaceTokens(body, user);

    // ALWAYS start with greeting for consistency
    // Remove any leading greeting the AI may have added (like "Sowmya," or "Hi Sowmya,")
    bodyWithTokens = bodyWithTokens
      .replace(/^(hi|hello|hey)\s+\w+[.,]?\n*/i, '')  // Remove "Hi Name," style
      .replace(/^\w+[.,]\s*/i, '')  // Remove "Name," style
      .trim();

    // Always add greeting in consistent format: "Hi FirstName,"
    const greeting = `Hi ${greetingName},\n\n`;

    const bdy =
`${greeting}${bodyWithTokens}

FactoryJet partners with growing businesses to ship high-performance websites, e-commerce stores, AI chatbots, and SEO-ready experiences — trusted by 500+ businesses, backed by 25+ years of expertise, and delivered in as little as 7 days.
If this sounds relevant, just reply to this email and we'll take it from there.

— FactoryJet Team
📞 +91 9699977699
🌐 https://factoryjet.com
${unsubscribeUrl ? `\n📬 Manage preferences: ${unsubscribeUrl}` : ''}

${thanks}`

     return bdy
}
