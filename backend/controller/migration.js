import 'dotenv/config';
import Contact from "../models/Contacts.js";
import mongoose from "mongoose";

export async function migrate() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/factoryjet';
  await mongoose.connect(mongoUri);

  await Contact.updateMany(
    {},
    {
      $set: {
        outreachStatus: "SENT",

        reply: {
          replied: false,
          replyType: null,
          replyMessage: null,
          repliedAt: null
        },

        followup: {
          followupCount: 0,
          maxFollowups: 3,
          nextFollowupAt: null,
          followupEnabled: true
        },

        emailStats: {
          emailsSent: 1,
          opened: false,
          openedCount: 0,
          lastOpenedAt: null
        },

        emails: [],

        flags: {
          doNotContact: false,
          bounced: false,
          unsubscribe: false
        },

        

        notes: "DONOTSEND",
        monthCame:"january26"
      }
    }
  );

  console.log("Migration completed");
  process.exit();
}

