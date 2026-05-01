import express from 'express';
import AuditLog from '../models/AuditLog.js';
import * as auditLogger from '../services/auditLogger.js';
import * as suppressionManager from '../services/suppressionManager.js';
import * as complianceChecker from '../services/complianceChecker.js';
import { verifyEmail } from '../services/emailVerifier.js';

const complianceRouter = express.Router();

// GET /audit-stats — Aggregate audit log statistics
complianceRouter.get('/audit-stats', async (req, res) => {
  try {
    const { from } = req.query;
    const stats = await auditLogger.getAuditStats(from || null);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[Compliance] Audit stats error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /audit-log — Query audit logs with pagination & filtering
complianceRouter.get('/audit-log', async (req, res) => {
  try {
    const { email, eventType, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (email) filter.email = email;
    if (eventType) filter.eventType = eventType;

    const events = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[Compliance] Audit log error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /suppression — Get suppression list
complianceRouter.get('/suppression', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = await suppressionManager.getSuppressionList(parseInt(page), parseInt(limit));
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Compliance] Suppression list error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /suppression — Add email to suppression list
complianceRouter.post('/suppression', async (req, res) => {
  try {
    const { email, reason = 'doNotContact' } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const result = await suppressionManager.addToSuppression(email, reason);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Compliance] Add suppression error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /suppression/import — Bulk import suppression list
complianceRouter.post('/suppression/import', async (req, res) => {
  try {
    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ success: false, error: 'Emails array required' });
    }

    const result = await suppressionManager.importSuppressionList(emails);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Compliance] Import suppression error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /suppression/stats — Suppression list statistics
complianceRouter.get('/suppression/stats', async (req, res) => {
  try {
    const stats = await suppressionManager.getSuppressionStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[Compliance] Suppression stats error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /check/:sequenceType — Run compliance check for sequence
complianceRouter.get('/check/:sequenceType', async (req, res) => {
  try {
    const { sequenceType } = req.params;
    const result = await complianceChecker.checkCompliance(sequenceType);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Compliance] Check error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /gdpr/export/:contactId — Export GDPR data for contact
complianceRouter.get('/gdpr/export/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const data = await auditLogger.exportGDPRData(contactId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[Compliance] GDPR export error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /verify-email — Verify single email address
complianceRouter.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const result = await verifyEmail(email);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Compliance] Verify email error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default complianceRouter;
