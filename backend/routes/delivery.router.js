import express from 'express';
import mongoose from 'mongoose';
import Contact from '../models/Contacts.js';
import { logUnsubscribe, logBounce } from '../services/auditLogger.js';

const deliveryRouter = express.Router();

/**
 * GET /unsubscribe?token=<contactId>
 * Handles unsubscribe requests from email links
 */
deliveryRouter.get('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Unsubscribe</title><style>body{font-family:sans-serif;padding:40px;text-align:center;}</style></head>
          <body><h2>Invalid unsubscribe link</h2><p>No token provided.</p></body>
        </html>
      `);
    }

    // Validate and parse ObjectId
    let contactId;
    try {
      contactId = new mongoose.Types.ObjectId(token);
    } catch (err) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Unsubscribe</title><style>body{font-family:sans-serif;padding:40px;text-align:center;}</style></head>
          <body><h2>Invalid token</h2><p>Could not process unsubscribe request.</p></body>
        </html>
      `);
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Unsubscribe</title><style>body{font-family:sans-serif;padding:40px;text-align:center;}</style></head>
          <body><h2>Contact not found</h2><p>Could not find contact record.</p></body>
        </html>
      `);
    }

    // Check if already unsubscribed
    if (contact.flags?.unsubscribe) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Unsubscribe</title><style>body{font-family:sans-serif;padding:40px;text-align:center;}</style></head>
          <body><h2>Already unsubscribed</h2><p>This email was already removed from our list.</p></body>
        </html>
      `);
    }

    // Mark as unsubscribed
    contact.flags.unsubscribe = true;
    if (contact.emailSequence) {
      contact.emailSequence.sequenceStatus = 'unsubscribed';
    }
    await contact.save();

    // Log unsubscribe event
    logUnsubscribe(contact).catch(console.error);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Unsubscribed</title><style>body{font-family:sans-serif;padding:40px;text-align:center;background:#f5f5f5;}</style></head>
        <body>
          <h2>Unsubscribed Successfully</h2>
          <p>You've been removed from our mailing list.</p>
          <p style="color:#666;font-size:12px;">You will no longer receive emails from us.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title><style>body{font-family:sans-serif;padding:40px;text-align:center;}</style></head>
        <body><h2>Error</h2><p>Could not process unsubscribe request.</p></body>
      </html>
    `);
  }
});

/**
 * POST /bounce
 * Webhook handler for bounce notifications from email service
 */
deliveryRouter.post('/bounce', async (req, res) => {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.BOUNCE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const headerSecret = req.headers['x-webhook-secret'];
      if (headerSecret !== webhookSecret) {
        return res.status(401).json({ success: false, error: 'Invalid webhook secret' });
      }
    }

    const { email, bounceType, bounceReason, bounceCode } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address required' });
    }

    const contact = await Contact.findOne({ email });
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    // Mark contact as bounced
    contact.flags.bounced = true;
    contact.flags.bounceType = bounceType || 'soft';
    contact.flags.bounceReason = bounceReason || null;
    contact.flags.bouncedAt = new Date();

    // Stop sequence if active
    if (contact.emailSequence?.sequenceStatus === 'active') {
      contact.emailSequence.sequenceStatus = 'bounced';
    }

    await contact.save();

    // Log bounce event
    logBounce(contact, bounceType, bounceReason).catch(console.error);

    res.json({
      success: true,
      contactId: contact._id,
      email: contact.email,
      bounceType: contact.flags.bounceType
    });
  } catch (err) {
    console.error('Bounce webhook error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default deliveryRouter;
