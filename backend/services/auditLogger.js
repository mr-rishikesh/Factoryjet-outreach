import AuditLog from '../models/AuditLog.js';

// Fire-and-forget safe: all functions wrapped in try/catch, failures never crash sends
const safeLog = async (promise) => {
  try {
    return await promise;
  } catch (err) {
    console.error('[AuditLog] Error:', err.message);
  }
};

export const logEmailSent = (contact, emailNumber, sequenceType, subject) => {
  return safeLog(
    AuditLog.create({
      eventType: 'email_sent',
      contactId: contact._id,
      email: contact.email,
      sequenceType,
      emailNumber,
      details: { subject },
    })
  );
};

export const logEmailFailed = (contact, emailNumber, sequenceType, errorMessage) => {
  return safeLog(
    AuditLog.create({
      eventType: 'email_failed',
      contactId: contact._id,
      email: contact.email,
      sequenceType,
      emailNumber,
      details: { error: errorMessage },
    })
  );
};

export const logBounce = (contact, bounceType, bounceReason) => {
  return safeLog(
    AuditLog.create({
      eventType: 'bounce',
      contactId: contact._id,
      email: contact.email,
      details: { bounceType, bounceReason },
    })
  );
};

export const logUnsubscribe = (contact) => {
  return safeLog(
    AuditLog.create({
      eventType: 'unsubscribe',
      contactId: contact._id,
      email: contact.email,
      details: {},
    })
  );
};

export const exportGDPRData = async (contactId) => {
  try {
    const { Contact } = await import('../models/Contacts.js');

    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const auditEvents = await AuditLog.find({ contactId }, null, { sort: { createdAt: -1 } });

    // Log the export itself
    await AuditLog.create({
      eventType: 'gdpr_export',
      contactId,
      email: contact.email,
      details: { exportedAt: new Date() },
    });

    return {
      contact: {
        _id: contact._id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        companyName: contact.companyName,
        industry: contact.industry,
        flags: contact.flags,
        emailSequence: contact.emailSequence,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
      auditEvents,
      exportedAt: new Date(),
    };
  } catch (err) {
    console.error('[AuditLog] GDPR export error:', err.message);
    throw err;
  }
};

export const getAuditStats = async (fromDate = null) => {
  try {
    const query = {};
    if (fromDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    }

    const stats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      email_sent: 0,
      email_failed: 0,
      bounce: 0,
      unsubscribe: 0,
      gdpr_export: 0,
      compliance_check: 0,
    };

    stats.forEach((stat) => {
      if (result[stat._id] !== undefined) {
        result[stat._id] = stat.count;
      }
    });

    return result;
  } catch (err) {
    console.error('[AuditLog] Stats error:', err.message);
    throw err;
  }
};
