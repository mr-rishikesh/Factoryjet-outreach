/**
 * Email Sequence Service — Phase 2
 * Handles all sequence logic, scheduling, and orchestration
 * Supports Sequence A (US Shopify DTC) and Sequence B (UK SMBs)
 * Reliable, tested, production-ready
 */

import Contact from "../models/Contacts.js";
import { generateColdEmail } from "./groqservice.js";
import { helpers } from "./prompt.js";
import { sendEmailsNodemailer } from '../email-service/index.js';
import { formate, replaceTokens } from '../email-service/email.body.format.js';
import { validateSend, getDailySentCount } from '../services/preSendValidator.js';
import { logEmailSent, logEmailFailed } from '../services/auditLogger.js';
import { isSuppressed } from '../services/suppressionManager.js';

// Sequence configuration
const SEQUENCE_CONFIG = {
  A: {
    name: "AI Agent Development → US Shopify DTC Brands",
    emailIntervals: [0, 3, 7, 12, 18], // Days for email 1-5 (0-indexed from day 1)
    maxEmails: 5
  },
  B: {
    name: "AI SEO / GEO → UK Founder-Led SMBs",
    emailIntervals: [0, 3, 7, 12, 18], // Days for email 1-5
    maxEmails: 5
  }
};

/**
 * Initialize a new email sequence for a contact
 * @param {string} contactId - MongoDB contact ID
 * @param {string} sequenceType - 'A' or 'B'
 * @returns {Object} Updated contact with sequence initialized
 */
export const initializeSequence = async (contactId, sequenceType) => {
  if (!['A', 'B'].includes(sequenceType)) {
    throw new Error(`Invalid sequence type: ${sequenceType}. Must be 'A' or 'B'`);
  }

  const contact = await Contact.findById(contactId);
  if (!contact) throw new Error(`Contact not found: ${contactId}`);

  // Check if contact is on suppression list
  const suppressed = await isSuppressed(contact.email);
  if (suppressed) throw new Error(`Contact is on suppression list`);

  // Check if contact already has an active sequence
  if (contact.emailSequence?.sequenceStatus === 'active') {
    const currentSequence = contact.emailSequence.sequenceType === 'A'
      ? 'Sequence A (AI Agent Development → US Shopify DTC Brands)'
      : 'Sequence B (AI SEO / GEO → UK Founder-Led SMBs)';
    const currentEmail = contact.emailSequence.nextEmailNumber;
    throw new Error(`❌ Cannot start new sequence. Contact is already in ${currentSequence} (next email: #${currentEmail}). Please pause or complete the current sequence first.`);
  }

  // Calculate scheduled dates (Day 1→4→8→13→19)
  const now = new Date();
  const scheduledDates = {
    email1: new Date(now.getTime() + 0 * 24 * 60 * 60 * 1000),     // Day 1
    email2: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),     // Day 4
    email3: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),     // Day 8
    email4: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),    // Day 13
    email5: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000)     // Day 19
  };

  // Initialize sequence
  contact.emailSequence = {
    sequenceType,
    currentEmailNumber: 0,
    sequenceStatus: 'active',
    sequenceStartedAt: now,
    emailHistory: [],
    scheduledDates,
    nextEmailNumber: 1,
    nextEmailScheduledFor: scheduledDates.email1,
    lastEmailSentAt: null,
    abTest: {
      variantIndex: Math.floor(Math.random() * 5), // Random variant 0-4
      variantSent: null,
      replyRate: 0
    }
  };

  await contact.save();
  return contact;
};

/**
 * Generate and send the next email in sequence
 * @param {string} contactId - MongoDB contact ID
 * @returns {Object} Email that was sent with details
 */
export const sendNextEmail = async (contactId) => {
  const contact = await Contact.findById(contactId);
  if (!contact) throw new Error(`Contact not found: ${contactId}`);

  const seq = contact.emailSequence;
  if (!seq || seq.sequenceStatus !== 'active') {
    throw new Error(`Contact doesn't have an active sequence`);
  }

  // Check if next email should be sent now
  const now = new Date();
  if (seq.nextEmailScheduledFor > now) {
    throw new Error(`Email ${seq.nextEmailNumber} not scheduled to send until ${seq.nextEmailScheduledFor}`);
  }

  // Check if already at max emails
  if (seq.nextEmailNumber > SEQUENCE_CONFIG[seq.sequenceType].maxEmails) {
    contact.emailSequence.sequenceStatus = 'completed';
    await contact.save();
    throw new Error(`Sequence ${seq.sequenceType} already completed (5/5 emails sent)`);
  }

  // Check if contact replied or bounced
  if (seq.sequenceStatus === 'replied') {
    throw new Error(`Contact already replied. Sequence paused.`);
  }
  if (seq.sequenceStatus === 'bounced') {
    throw new Error(`Contact email bounced. Sequence halted.`);
  }

  // Validate contact has required tokens
  const tokenValidation = helpers.validateTokens(
    '{{first_name}} {{company}} {{industry}}',
    contact
  );
  if (!tokenValidation.valid) {
    throw new Error(`Missing tokens for contact: ${tokenValidation.missing.join(', ')}`);
  }

  // Generate email using Groq
  const emailNumber = seq.nextEmailNumber;
  const variantIndex = seq.abTest.variantIndex;
  let email;

  try {
    email = await generateColdEmail(contact, seq.sequenceType, emailNumber, variantIndex);
  } catch (err) {
    console.error(`Failed to generate email ${emailNumber}:`, err);
    throw new Error(`Failed to generate email: ${err.message}`);
  }

  if (!email || !email.subject || !email.body) {
    throw new Error(`Generated email missing subject or body`);
  }

  // Validate generated email
  const emailValidation = helpers.validateEmail(
    email.body,
    seq.sequenceType,
    emailNumber
  );
  if (!emailValidation.valid) {
    console.warn(`Generated email failed validation:`, emailValidation);
  }

  // Pre-send validation
  const validation = await validateSend(contact);
  if (!validation.valid) {
    throw new Error(`Cannot send: ${validation.reasons.join('; ')}`);
  }

  // Record email in history (initially pending)
  const emailRecord = {
    emailNumber,
    day: SEQUENCE_CONFIG[seq.sequenceType].emailIntervals[emailNumber - 1] + 1,
    subject: email.subject,
    body: email.body,
    subjectVariant: variantIndex === 0 ? 'primary' : `variant_${variantIndex}`,
    variantIndex,
    sentAt: now,
    deliveryStatus: 'pending'
  };

  // Update contact
  contact.emailSequence.emailHistory.push(emailRecord);
  contact.emailSequence.currentEmailNumber = emailNumber;
  contact.emailSequence.lastEmailSentAt = now;

  // Schedule next email using atomic update
  const updateData = {
    'emailSequence.emailHistory': contact.emailSequence.emailHistory,
    'emailSequence.currentEmailNumber': emailNumber,
    'emailSequence.lastEmailSentAt': now
  };

  if (emailNumber < SEQUENCE_CONFIG[seq.sequenceType].maxEmails) {
    const nextEmailNumber = emailNumber + 1;
    const nextIntervalDays = SEQUENCE_CONFIG[seq.sequenceType].emailIntervals[nextEmailNumber - 1];
    updateData['emailSequence.nextEmailNumber'] = nextEmailNumber;
    updateData['emailSequence.nextEmailScheduledFor'] = new Date(
      seq.sequenceStartedAt.getTime() + nextIntervalDays * 24 * 60 * 60 * 1000
    );
  } else {
    // All emails sent
    updateData['emailSequence.nextEmailNumber'] = SEQUENCE_CONFIG[seq.sequenceType].maxEmails + 1;
    updateData['emailSequence.sequenceStatus'] = 'completed';
  }

  // Use atomic update to prevent race conditions
  const updatedContact = await Contact.findByIdAndUpdate(
    contactId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  // Update in-memory contact for sending
  contact = updatedContact;

  // Send the email
  const unsubUrl = (seq.sequenceType === 'B' || emailNumber >= 2)
    ? `${process.env.BASE_URL || 'http://localhost:5000'}/unsubscribe?token=${contact._id}`
    : null;

  const randomThanks = 'Thanks';
  const formattedBody = await formate(email.body, contact, randomThanks, unsubUrl);

  // Replace tokens in subject too
  const formattedSubject = replaceTokens(email.subject, contact);

  const messageId = `<${Date.now()}-${contact._id}@factoryjet.com>`;
  const listUnsubscribeHeader = unsubUrl ? `<${unsubUrl}>` : '';

  try {
    const sendResult = await sendEmailsNodemailer(
      { subject: formattedSubject, bdy: formattedBody, messageId, listUnsubscribeHeader },
      contact.email
    );

    if (sendResult.success) {
      // Update delivery status to 'sent' using atomic update
      // Update by email number to avoid array index issues
      await Contact.findByIdAndUpdate(
        contactId,
        {
          $set: {
            'emailSequence.emailHistory.$[elem].deliveryStatus': 'sent'
          },
          $inc: { 'emailStats.emailsSent': 1 }
        },
        {
          arrayFilters: [{ 'elem.emailNumber': emailNumber }],
          new: true,
          runValidators: true
        }
      );

      // Refresh contact for return value and logging
      const refreshedContact = await Contact.findById(contactId);

      // Log email sent event (fire-and-forget)
      logEmailSent(refreshedContact, emailNumber, seq.sequenceType, email.subject).catch(console.error);

      return {
        contactId,
        sequenceType: refreshedContact.emailSequence.sequenceType,
        emailNumber,
        subject: email.subject,
        body: email.body,
        variant: variantIndex,
        sentAt: now,
        nextEmailScheduledFor: refreshedContact.emailSequence.nextEmailScheduledFor,
        sequenceProgress: `${emailNumber}/${SEQUENCE_CONFIG[refreshedContact.emailSequence.sequenceType].maxEmails}`
      };
    } else {
      throw new Error(sendResult.error || 'Failed to send email');
    }
  } catch (err) {
    // Update delivery status to 'failed' using atomic update
    await Contact.findByIdAndUpdate(
      contactId,
      {
        $set: {
          'emailSequence.emailHistory.$[elem].deliveryStatus': 'failed'
        }
      },
      {
        arrayFilters: [{ 'elem.emailNumber': emailNumber }],
        new: true,
        runValidators: true
      }
    );

    // Refresh contact for logging
    const refreshedContact = await Contact.findById(contactId);

    // Log email failed event (fire-and-forget)
    logEmailFailed(refreshedContact, emailNumber, seq.sequenceType, err.message).catch(console.error);

    throw new Error(`Failed to send email: ${err.message}`);
  }
};

/**
 * Mark that a contact replied to an email
 * @param {string} contactId - MongoDB contact ID
 * @param {number} emailNumber - Which email they replied to
 * @param {string} replyMessage - Optional reply content
 */
export const markContactReplied = async (contactId, emailNumber, replyMessage = null) => {
  const contact = await Contact.findById(contactId);
  if (!contact) throw new Error(`Contact not found: ${contactId}`);

  const seq = contact.emailSequence;
  if (!seq) throw new Error(`Contact doesn't have a sequence`);

  // Update contact status
  contact.reply.replied = true;
  contact.reply.repliedAt = new Date();
  if (replyMessage) contact.reply.replyMessage = replyMessage;

  // Update outreach status
  contact.outreachStatus = 'REPLIED_POSITIVE';

  // Pause sequence
  contact.emailSequence.sequenceStatus = 'replied';

  // Calculate reply rate
  const totalEmailsSent = seq.emailHistory.length;
  if (totalEmailsSent > 0) {
    contact.emailSequence.abTest.replyRate = (1 / totalEmailsSent) * 100;
  }

  await contact.save();

  return {
    contactId,
    status: 'replied',
    repliedAt: contact.reply.repliedAt,
    replyRate: contact.emailSequence.abTest.replyRate,
    sequenceStatus: 'paused'
  };
};

/**
 * Pause a sequence (can be resumed)
 */
export const pauseSequence = async (contactId) => {
  const contact = await Contact.findById(contactId);
  if (!contact) throw new Error(`Contact not found: ${contactId}`);

  contact.emailSequence.sequenceStatus = 'paused';
  await contact.save();

  return {
    contactId,
    sequenceStatus: 'paused'
  };
};

/**
 * Resume a paused sequence
 */
export const resumeSequence = async (contactId) => {
  const contact = await Contact.findById(contactId);
  if (!contact) throw new Error(`Contact not found: ${contactId}`);

  const seq = contact.emailSequence;
  if (!seq) throw new Error(`Contact doesn't have a sequence`);

  contact.emailSequence.sequenceStatus = 'active';
  await contact.save();

  return {
    contactId,
    sequenceStatus: 'active',
    nextEmailNumber: seq.nextEmailNumber,
    nextEmailScheduledFor: seq.nextEmailScheduledFor
  };
};

/**
 * Get sequence status for a contact
 */
export const getSequenceStatus = async (contactId) => {
  const contact = await Contact.findById(contactId);
  if (!contact) throw new Error(`Contact not found: ${contactId}`);

  const seq = contact.emailSequence;
  if (!seq || seq.sequenceStatus === 'not_started') {
    return {
      contactId,
      status: 'no_sequence',
      message: 'No sequence started for this contact'
    };
  }

  return {
    contactId,
    sequenceType: seq.sequenceType,
    sequenceStatus: seq.sequenceStatus,
    currentEmailNumber: seq.currentEmailNumber,
    nextEmailNumber: seq.nextEmailNumber,
    nextEmailScheduledFor: seq.nextEmailScheduledFor,
    emailsSent: seq.emailHistory.length,
    sequenceProgress: `${seq.currentEmailNumber}/${SEQUENCE_CONFIG[seq.sequenceType].maxEmails}`,
    replyRate: seq.abTest.replyRate,
    emailHistory: seq.emailHistory.map(e => ({
      emailNumber: e.emailNumber,
      sentAt: e.sentAt,
      subject: e.subject,
      variant: e.subjectVariant,
      deliveryStatus: e.deliveryStatus
    })),
    nextEmailReadyToSend: new Date() >= seq.nextEmailScheduledFor && seq.sequenceStatus === 'active'
  };
};

/**
 * Get all contacts due for next email send
 * @param {string} sequenceType - Optional: filter by 'A' or 'B'
 * @returns {Array} Contacts ready to send
 */
export const getContactsDueForEmail = async (sequenceType = null) => {
  const now = new Date();
  const query = {
    'emailSequence.sequenceStatus': 'active',
    'emailSequence.nextEmailScheduledFor': { $lte: now }
  };

  if (sequenceType) {
    query['emailSequence.sequenceType'] = sequenceType;
  }

  const contacts = await Contact.find(query).select('_id firstName companyName email emailSequence');
  return contacts;
};

/**
 * Run scheduled sends (call this periodically, e.g., every hour)
 * @param {number} dailyLimit - Max emails to send per day (default 50)
 * @returns {Object} Summary of sends
 */
export const runScheduledSends = async (dailyLimit = 50) => {
  // Check daily limit
  const sentToday = await getDailySentCount();
  const remaining = dailyLimit - sentToday;
  if (remaining <= 0) {
    return {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      limitReached: true,
      message: `Daily limit (${dailyLimit}) already reached. Sent today: ${sentToday}`
    };
  }

  const contactsDue = await getContactsDueForEmail();
  const contactsToProcess = contactsDue.slice(0, remaining);

  const results = {
    totalProcessed: contactsToProcess.length,
    successful: 0,
    failed: 0,
    errors: [],
    sentToday,
    remaining: remaining - contactsToProcess.length
  };

  for (const contact of contactsToProcess) {
    try {
      await sendNextEmail(contact._id.toString());
      results.successful++;
      console.log(`✅ Sent email to ${contact.email} (${contact.firstName} ${contact.companyName})`);
    } catch (err) {
      results.failed++;
      results.errors.push({
        contactId: contact._id,
        email: contact.email,
        error: err.message
      });
      console.error(`❌ Failed to send email to ${contact.email}:`, err.message);
    }
    // 10-second delay between sends (Gmail rate limit)
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  return results;
};

/**
 * Analytics: Get sequence performance data
 */
export const getSequenceAnalytics = async (sequenceType = null) => {
  const query = { 'emailSequence.sequenceType': { $exists: true, $ne: null } };
  if (sequenceType) query['emailSequence.sequenceType'] = sequenceType;

  const contacts = await Contact.find(query);

  const stats = {
    sequenceType: sequenceType || 'all',
    totalSequencesStarted: contacts.length,
    sequenceStatusBreakdown: {
      active: 0,
      paused: 0,
      completed: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0
    },
    emailsSentBreakdown: {
      email1: 0,
      email2: 0,
      email3: 0,
      email4: 0,
      email5: 0
    },
    abTestResults: {},
    totalReplies: 0,
    replyRate: 0,
    avgEmailsPerSequence: 0,
    bounceStats: {
      totalBounced: 0,
      hardBounces: 0,
      softBounces: 0,
      complaints: 0
    }
  };

  let totalEmailsSent = 0;

  contacts.forEach(contact => {
    const seq = contact.emailSequence;

    // Status breakdown
    stats.sequenceStatusBreakdown[seq.sequenceStatus]++;

    // Bounce stats
    if (contact.flags?.bounced) {
      stats.bounceStats.totalBounced++;
      if (contact.flags.bounceType === 'hard') {
        stats.bounceStats.hardBounces++;
      } else if (contact.flags.bounceType === 'soft') {
        stats.bounceStats.softBounces++;
      } else if (contact.flags.bounceType === 'complaint') {
        stats.bounceStats.complaints++;
      }
    }

    // Emails sent breakdown
    seq.emailHistory.forEach(email => {
      const emailKey = `email${email.emailNumber}`;
      if (stats.emailsSentBreakdown[emailKey] !== undefined) {
        stats.emailsSentBreakdown[emailKey]++;
      }
    });

    // A/B test results
    const variant = seq.abTest.variantSent || `variant_${seq.abTest.variantIndex}`;
    if (!stats.abTestResults[variant]) {
      stats.abTestResults[variant] = { sent: 0, replies: 0, replyRate: 0 };
    }
    stats.abTestResults[variant].sent++;
    if (seq.sequenceStatus === 'replied') {
      stats.abTestResults[variant].replies++;
    }

    // Reply stats
    if (seq.sequenceStatus === 'replied') {
      stats.totalReplies++;
    }

    totalEmailsSent += seq.emailHistory.length;
  });

  // Calculate aggregates
  if (contacts.length > 0) {
    stats.replyRate = (stats.totalReplies / contacts.length) * 100;
    stats.avgEmailsPerSequence = totalEmailsSent / contacts.length;
  }

  // Calculate reply rates per variant
  Object.keys(stats.abTestResults).forEach(variant => {
    const data = stats.abTestResults[variant];
    data.replyRate = (data.replies / data.sent) * 100;
  });

  return stats;
};

/**
 * Export summary for monitoring
 */
export const getServiceHealth = async () => {
  const activeSequences = await Contact.countDocuments({
    'emailSequence.sequenceStatus': 'active'
  });

  const sequencesReadyToSend = await Contact.countDocuments({
    'emailSequence.sequenceStatus': 'active',
    'emailSequence.nextEmailScheduledFor': { $lte: new Date() }
  });

  return {
    activeSequences,
    readyToSend: sequencesReadyToSend,
    lastCheck: new Date()
  };
};
