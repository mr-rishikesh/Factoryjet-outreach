


export async function formate(body, user, thanks, unsubscribeUrl = null) {
    const greetingName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "there";

    // Check if body already contains a greeting (starts with Hi, Hello, etc)
    const bodyTrimmed = body.trim();
    const hasGreeting = /^(hi|hello|hey)\s+/i.test(bodyTrimmed);

    // Only add greeting if body doesn't already have one
    const greeting = hasGreeting ? '' : `Hi ${greetingName},\n\n`;

    const bdy =
`${greeting}${bodyTrimmed}

FactoryJet partners with growing businesses to ship high-performance websites, e-commerce stores, AI chatbots, and SEO-ready experiences — trusted by 500+ businesses, backed by 25+ years of expertise, and delivered in as little as 7 days.
If this sounds relevant, just reply to this email and we'll take it from there.

— FactoryJet Team
📞 +91 9699977699
🌐 https://factoryjet.com
${unsubscribeUrl ? `\nTo stop receiving these emails: ${unsubscribeUrl}` : ''}

${thanks}`

     return bdy
}
