/**
 * Email Sequence Routes — Phase 2
 * RESTful API for managing email sequences
 */

import express from "express";
import {
  initializeSequence,
  sendNextEmail,
  markContactReplied,
  pauseSequence,
  resumeSequence,
  getSequenceStatus,
  getContactsDueForEmail,
  runScheduledSends,
  getSequenceAnalytics,
  getServiceHealth
} from "../ai-service/sequenceService.js";

const sequenceRouter = express.Router();

// ============================================================================
// PARAMETERLESS ROUTES (must come first so Express doesn't confuse them with :id routes)
// ============================================================================

/**
 * GET /api/sequences/health
 * Get service health status
 */
sequenceRouter.get("/health", async (req, res) => {
  try {
    const health = await getServiceHealth();

    res.json({
      success: true,
      health
    });
  } catch (err) {
    console.error("Get health error:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/sequences/due
 * Get all contacts due for next email send
 * Optional query param: type (A or B)
 */
sequenceRouter.get("/due", async (req, res) => {
  try {
    const { type } = req.query;
    const contacts = await getContactsDueForEmail(type);

    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    console.error("Get contacts due error:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/sequences/analytics
 * Get sequence performance analytics
 * Optional query param: type (A or B)
 */
sequenceRouter.get("/analytics", async (req, res) => {
  try {
    const { type } = req.query;
    const analytics = await getSequenceAnalytics(type);

    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error("Get analytics error:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/sequences/initialize
 * Initialize a new email sequence for a contact
 */
sequenceRouter.post("/initialize", async (req, res) => {
  try {
    const { contactId, sequenceType } = req.body;

    if (!contactId || !sequenceType) {
      return res.status(400).json({
        success: false,
        error: "contactId and sequenceType are required"
      });
    }

    const contact = await initializeSequence(contactId, sequenceType);

    res.json({
      success: true,
      message: `Sequence ${sequenceType} initialized for contact`,
      contact: {
        _id: contact._id,
        firstName: contact.firstName,
        companyName: contact.companyName,
        email: contact.email,
        sequence: contact.emailSequence
      }
    });
  } catch (err) {
    console.error("Initialize sequence error:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/sequences/run-scheduled
 * Run scheduled sends for all contacts due for emails
 * This is called by a cron job or background service
 */
sequenceRouter.post("/run-scheduled", async (req, res) => {
  try {
    const results = await runScheduledSends();

    res.json({
      success: true,
      message: `Processed ${results.totalProcessed} contacts`,
      results
    });
  } catch (err) {
    console.error("Run scheduled sends error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ============================================================================
// PARAMETERIZED ROUTES (must come after parameterless routes)
// ============================================================================

/**
 * GET /api/sequences/:contactId/status
 * Get sequence status for a contact
 */
sequenceRouter.get("/:contactId/status", async (req, res) => {
  try {
    const { contactId } = req.params;
    const status = await getSequenceStatus(contactId);

    res.json({
      success: true,
      status
    });
  } catch (err) {
    console.error("Get sequence status error:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/sequences/:contactId/send
 * Send the next email in the sequence for a contact
 */
sequenceRouter.post("/:contactId/send", async (req, res) => {
  try {
    const { contactId } = req.params;

    const result = await sendNextEmail(contactId);

    res.json({
      success: true,
      message: `Email ${result.emailNumber} sent successfully`,
      email: result
    });
  } catch (err) {
    console.error("Send next email error:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/sequences/:contactId/mark-replied
 * Mark that a contact replied to an email
 */
sequenceRouter.post("/:contactId/mark-replied", async (req, res) => {
  try {
    const { contactId } = req.params;
    const { emailNumber, replyMessage } = req.body;

    if (!emailNumber) {
      return res.status(400).json({
        success: false,
        error: "emailNumber is required"
      });
    }

    const result = await markContactReplied(contactId, emailNumber, replyMessage);

    res.json({
      success: true,
      message: "Contact marked as replied",
      result
    });
  } catch (err) {
    console.error("Mark replied error:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/sequences/:contactId/pause
 * Pause a sequence
 */
sequenceRouter.post("/:contactId/pause", async (req, res) => {
  try {
    const { contactId } = req.params;
    const result = await pauseSequence(contactId);

    res.json({
      success: true,
      message: "Sequence paused",
      result
    });
  } catch (err) {
    console.error("Pause sequence error:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/sequences/:contactId/resume
 * Resume a paused sequence
 */
sequenceRouter.post("/:contactId/resume", async (req, res) => {
  try {
    const { contactId } = req.params;
    const result = await resumeSequence(contactId);

    res.json({
      success: true,
      message: "Sequence resumed",
      result
    });
  } catch (err) {
    console.error("Resume sequence error:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

export default sequenceRouter;
