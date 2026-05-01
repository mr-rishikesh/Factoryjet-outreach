import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['email_sent', 'email_failed', 'bounce', 'unsubscribe', 'gdpr_export', 'suppression_add', 'compliance_check'],
      required: true,
      index: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      index: true,
    },
    email: {
      type: String,
      index: true,
    },
    sequenceType: {
      type: String,
      enum: ['A', 'B', null],
      default: null,
    },
    emailNumber: {
      type: Number,
      min: 1,
      max: 5,
    },
    details: mongoose.Schema.Types.Mixed, // Flexible payload per event type
  },
  { timestamps: true }
);

// TTL index: auto-delete after 365 days for GDPR compliance
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model('AuditLog', auditLogSchema);
