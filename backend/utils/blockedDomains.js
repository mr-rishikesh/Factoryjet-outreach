// Domains that should never receive outreach emails.
// Add domains here to block sending — matching is case-insensitive.
const BLOCKED_DOMAINS = [
  // Personal email providers (consumer)
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'tutanota.com',
  'fastmail.com',
  'zoho.com',
  // UK personal
  'btinternet.com',
  'sky.com',
  'talktalk.net',
  'virginmedia.com',
  // Disposable/temporary
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'yopmail.com',
  'trashmail.com',
  '10minutemail.com',
  'maildrop.cc',
  // No-cold-email zones
  'gov.uk',
  'gov.in'
];

/**
 * Checks if an email belongs to a blocked domain.
 * Supports multi-level TLDs (e.g. "gov.in" matches "user@tax.gov.in").
 * @param {string} email
 * @returns {boolean}
 */
export function isBlockedDomain(email) {
  if (!email || typeof email !== "string") return true;

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;

  return BLOCKED_DOMAINS.some((blocked) => {
    const b = blocked.toLowerCase();
    return domain === b || domain.endsWith(`.${b}`);
  });
}
