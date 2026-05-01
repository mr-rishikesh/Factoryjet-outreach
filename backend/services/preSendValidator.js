import Contact from '../models/Contacts.js';
import { isBlockedDomain } from '../utils/blockedDomains.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function validateSend(contact, options = {}) {
  const reasons = [];

  // Check 1: Email format
  if (!EMAIL_REGEX.test(contact.email)) {
    reasons.push('Invalid email format');
  }

  // Check 2: Blocked domain
  if (isBlockedDomain(contact.email)) {
    reasons.push('Email domain is blocked from cold outreach');
  }

  // Check 3: Flags check
  if (contact.flags?.bounced) {
    reasons.push('Contact is marked as bounced');
  }
  if (contact.flags?.doNotContact) {
    reasons.push('Contact is marked do-not-contact');
  }
  if (contact.flags?.unsubscribe) {
    reasons.push('Contact is unsubscribed');
  }

  // Check 4: Token completeness
  if (!contact.firstName || contact.firstName.trim() === '') {
    reasons.push('Missing first name (required for {{first_name}} token)');
  }
  if (!contact.companyName || contact.companyName.trim() === '') {
    reasons.push('Missing company name (required for {{company}} token)');
  }
  if (!contact.industry || contact.industry.trim() === '') {
    reasons.push('Missing industry (required for {{industry}} token)');
  }

  // Check 5: Sequence status guard
  const seq = contact.emailSequence;
  if (seq && ['completed', 'replied', 'bounced', 'unsubscribed'].includes(seq.sequenceStatus)) {
    reasons.push(`Cannot send: sequence status is "${seq.sequenceStatus}"`);
  }

  // Check 6: Daily send limit
  if (options.dailyLimit) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const sentToday = await getDailySentCount();
    if (sentToday >= options.dailyLimit) {
      reasons.push(`Daily send limit (${options.dailyLimit}) reached`);
    }
  }

  return {
    valid: reasons.length === 0,
    reasons
  };
}

export async function getDailySentCount() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const result = await Contact.aggregate([
    {
      $match: {
        'emailSequence.emailHistory': {
          $exists: true,
          $not: { $size: 0 }
        }
      }
    },
    {
      $unwind: '$emailSequence.emailHistory'
    },
    {
      $match: {
        'emailSequence.emailHistory.sentAt': { $gte: todayStart },
        'emailSequence.emailHistory.deliveryStatus': 'sent'
      }
    },
    {
      $count: 'totalSent'
    }
  ]);

  return result.length > 0 ? result[0].totalSent : 0;
}
