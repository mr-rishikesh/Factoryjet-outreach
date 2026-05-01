import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  lastSentDate : { type: Date ,    default: () => {
      const today = new Date();
      today.setDate(today.getDate() - 100); 
      return today;
    }}, // imp
  firstName: String,
  lastName: String,
  title: String,
  companyName: String,
  companyNameForEmails: String,
  email: String,
  emailStatus: String,
  primaryEmailSource: String,
  primaryEmailVerificationSource: String,
  emailConfidence: Number,
  primaryEmailCatchAllStatus: String,
  primaryEmailLastVerifiedAt: String,
  departments: String,
  contactOwner: String,
  workDirectPhone: String,
  homePhone: String,
  mobilePhone: String,
  corporatePhone: String,
  otherPhone: String,
  stage: String,
  lists: String,
  lastContacted: String,
  accountOwner: String,
  employees: String,
  industry: String,
  keywords: String,
  personLinkedinUrl: String,
  website: String,
  companyLinkedinUrl: String,
  facebookUrl: String,
  twitterUrl: String,
  city: String,
  state: String,
  country: String,
  companyAddress: String,
  companyCity: String,
  companyState: String,
  companyCountry: String,
  companyPhone: String,
  technologies: String,
  annualRevenue: String,
  totalFunding: String,
  latestFunding: String,
  latestFundingAmount: String,
  lastRaisedAt: String,
  subsidiaryOf: String,
  emailSent: String,
  emailOpen: String,
  emailBounced: String,
  replied: String,
  demoed: String,
  numberOfRetailLocations: String,
  apolloContactId: String,
  apolloAccountId: String,
  secondaryEmail: String,
  secondaryEmailSource: String,
  secondaryEmailStatus: String,
  secondaryEmailVerificationSource: String,
  tertiaryEmail: String,
  tertiaryEmailSource: String,
  tertiaryEmailStatus: String,
  tertiaryEmailVerificationSource: String,
    // outreach status
  outreachStatus: {
    type: String,
    enum: [
      "NOT_SENT",
      "SENT",
      "FOLLOWUP_PENDING",
      "REPLIED_POSITIVE",
      "REPLIED_NEGATIVE",
      "NO_RESPONSE",
      "CLOSED"
    ],
    default: "NOT_SENT"
  },

  // reply tracking
  reply: {
    replied: {
      type: Boolean,
      default: false
    },

    replyType: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      default: null
    },

    replyMessage: String,

    repliedAt: Date
  },

  // followup tracking
  followup: {
    followupCount: {
      type: Number,
      default: 0
    },

    maxFollowups: {
      type: Number,
      default: 3
    },

    nextFollowupAt: Date,

    followupEnabled: {
      type: Boolean,
      default: true
    }
  },

  // email tracking
  emailStats: {
    emailsSent: {
      type: Number,
      default: 0
    },

    opened: {
      type: Boolean,
      default: false
    },

    openedCount: {
      type: Number,
      default: 0
    },

    lastOpenedAt: Date
  },

  // email history
  emails: [
    {
      type: {
        type: String
      },

      subject: String,

      sentAt: Date
    }
  ],

  // flags
  flags: {
    doNotContact: {
      type: Boolean,
      default: false
    },

    bounced: {
      type: Boolean,
      default: false
    },

    unsubscribe: {
      type: Boolean,
      default: false
    },

    bounceType: {
      type: String,
      enum: ['hard', 'soft', 'complaint', null],
      default: null
    },

    bounceReason: {
      type: String,
      default: null
    },

    bouncedAt: {
      type: Date,
      default: null
    }
  },

  // notes
  notes: {
    type: String,
    default: "MARCH17-26"
  },

  // Email sequence tracking (Phase 2 - 2026 Sequences)
  emailSequence: {
    // Which sequence: 'A' (US Shopify DTC) or 'B' (UK SMB)
    sequenceType: {
      type: String,
      enum: ['A', 'B'],
      default: null
    },

    // Current email number (1-5) in the sequence
    currentEmailNumber: {
      type: Number,
      default: 0
    },

    // Sequence status
    sequenceStatus: {
      type: String,
      enum: ['not_started', 'active', 'paused', 'completed', 'replied', 'bounced', 'unsubscribed'],
      default: 'not_started'
    },

    // Start date of the sequence
    sequenceStartedAt: Date,

    // Complete history of emails sent in this sequence
    emailHistory: [
      {
        emailNumber: {
          type: Number,
          required: true
        },
        day: {
          type: Number,
          required: true
        },
        subject: String,
        body: String,
        subjectVariant: {
          type: String,
          default: 'primary'
        },
        variantIndex: {
          type: Number,
          default: 0
        },
        sentAt: {
          type: Date,
          default: Date.now
        },
        deliveryStatus: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'bounced', 'complained', 'failed'],
          default: 'pending'
        },
        bounceCode: {
          type: String,
          default: null
        },
        bounceMessage: {
          type: String,
          default: null
        },
        openedAt: Date,
        clickedAt: Date,
        repliedAt: Date
      }
    ],

    // Scheduled dates for remaining emails (Day 1→4→8→13→19)
    scheduledDates: {
      email1: Date,  // Day 1
      email2: Date,  // Day 4
      email3: Date,  // Day 8
      email4: Date,  // Day 13
      email5: Date   // Day 19
    },

    // Next email scheduled to send
    nextEmailNumber: {
      type: Number,
      default: 1
    },
    nextEmailScheduledFor: Date,

    // When the last email was sent
    lastEmailSentAt: Date,

    // A/B test tracking
    abTest: {
      variantIndex: {
        type: Number,
        default: 0
      },
      variantSent: String,
      replyRate: {
        type: Number,
        default: 0
      }
    }
  }

}, { timestamps: true });

export default mongoose.model("Contact", contactSchema);
