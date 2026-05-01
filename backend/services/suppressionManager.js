import Contact from '../models/Contacts.js';

export const isSuppressed = async (email) => {
  try {
    const contact = await Contact.findOne({ email }, 'flags').lean();
    if (!contact) return false;

    return !!(contact.flags?.bounced || contact.flags?.unsubscribe || contact.flags?.doNotContact);
  } catch (err) {
    console.error('[SuppressionManager] Check error:', err.message);
    return false; // On error, allow the send (fail open)
  }
};

export const addToSuppression = async (email, reason) => {
  try {
    if (!['bounced', 'unsubscribe', 'doNotContact'].includes(reason)) {
      throw new Error(`Invalid suppression reason: ${reason}`);
    }

    const contact = await Contact.findOne({ email });
    if (!contact) {
      throw new Error(`Contact not found: ${email}`);
    }

    const flagKey = `flags.${reason}`;
    const update = { [flagKey]: true };
    if (reason !== 'doNotContact') {
      update['flags.bouncedAt'] = new Date();
    }

    await Contact.findByIdAndUpdate(contact._id, { $set: update });

    return { success: true, contactId: contact._id, email, reason };
  } catch (err) {
    console.error('[SuppressionManager] Add error:', err.message);
    throw err;
  }
};

export const getSuppressionList = async (page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    const contacts = await Contact.find(
      {
        $or: [{ 'flags.bounced': true }, { 'flags.unsubscribe': true }, { 'flags.doNotContact': true }],
      },
      'email firstName lastName flags createdAt'
    )
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Contact.countDocuments({
      $or: [{ 'flags.bounced': true }, { 'flags.unsubscribe': true }, { 'flags.doNotContact': true }],
    });

    return {
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    console.error('[SuppressionManager] List error:', err.message);
    throw err;
  }
};

export const importSuppressionList = async (emails) => {
  try {
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new Error('Emails array required and must not be empty');
    }

    const result = await Contact.updateMany(
      { email: { $in: emails } },
      { $set: { 'flags.doNotContact': true } }
    );

    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      total: emails.length,
    };
  } catch (err) {
    console.error('[SuppressionManager] Import error:', err.message);
    throw err;
  }
};

export const getSuppressionStats = async () => {
  try {
    const totalSuppressed = await Contact.countDocuments({
      $or: [{ 'flags.bounced': true }, { 'flags.unsubscribe': true }, { 'flags.doNotContact': true }],
    });

    const bounced = await Contact.countDocuments({ 'flags.bounced': true });
    const unsubscribed = await Contact.countDocuments({ 'flags.unsubscribe': true });
    const doNotContact = await Contact.countDocuments({ 'flags.doNotContact': true });

    return {
      totalSuppressed,
      bounced,
      unsubscribed,
      doNotContact,
    };
  } catch (err) {
    console.error('[SuppressionManager] Stats error:', err.message);
    throw err;
  }
};
