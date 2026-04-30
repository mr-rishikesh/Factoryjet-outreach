


export async function formate(body, user, thanks) {
    const greetingName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "there";

    const bdy =
`Hi ${greetingName},

${body}

FactoryJet partners with growing businesses to ship high-performance websites, e-commerce stores, AI chatbots, and SEO-ready experiences — trusted by 500+ businesses, backed by 25+ years of expertise, and delivered in as little as 7 days.
If this sounds relevant, just reply to this email and we'll take it from there.

— FactoryJet Team
📞 +91 9699977699
🌐 https://factoryjet.com

${thanks} `



     return bdy
}
