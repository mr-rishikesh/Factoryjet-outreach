import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import cron from "node-cron";
import Contact from "./models/Contacts.js";
import { sendColdMailTest } from "./ai-service/service.js";
// import { sendEmail } from "./email-service/index.js";
import emailRouter from "./routes/email.router.js";
import contactRouter from "./routes/contact.router.js";
import sequenceRouter from "./routes/sequence.router.js";
import deliveryRouter from "./routes/delivery.router.js";
import complianceRouter from "./routes/compliance.router.js";
import { runScheduledSends } from "./ai-service/sequenceService.js";

const app = express();
const PORT = 5000;
console.log("SERVER.JS LOADED AT " + new Date().toISOString());

// CORS for frontend
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

console.log("Mounting routers...");
app.use("/email", emailRouter);
console.log("✅ Email router mounted");
app.use("/api/contacts", contactRouter);
console.log("✅ Contacts router mounted");
app.use("/api/sequences", sequenceRouter);
console.log("✅ Sequences router mounted");
app.use("/", deliveryRouter);
console.log("✅ Delivery router mounted");
app.use("/api/compliance", complianceRouter);
console.log("✅ Compliance router mounted");

// Test route
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Test route works" });
});

// Debug: Check contact count
app.get("/api/debug/contacts-count", async (req, res) => {
  try {
    const count = await Contact.countDocuments();
    const sample = await Contact.find().limit(3).select("firstName lastName email companyName").lean();
    console.log(`[DEBUG] Total contacts: ${count}`);
    res.json({ success: true, totalContacts: count, sample });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Debug: Check API response
app.get("/api/debug/contacts-api", async (req, res) => {
  try {
    const contacts = await Contact.find().limit(5).select("firstName lastName email").lean();
    const count = await Contact.countDocuments();
    console.log(`[DEBUG API] Returning ${contacts.length} contacts from total ${count}`);
    res.json({
      success: true,
      data: contacts,
      pagination: { page: 1, limit: 5, total: count, pages: Math.ceil(count / 5) }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct compliance check route for testing
app.get("/api/compliance/check/:sequenceType", async (req, res) => {
  try {
    const { sequenceType } = req.params;
    const { checkCompliance } = await import('./services/complianceChecker.js');
    const result = await checkCompliance(sequenceType);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Compliance Direct] Check error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// MongoDB connect
mongoose.connect("mongodb+srv://mrrishikesh2_db_user:qP9ir3ns0hlQDJ5D@cluster0.axlzsbl.mongodb.net/factoryjet", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ MongoDB connected");

  // Register cron job for scheduled sends
  const cronSchedule = process.env.CRON_SCHEDULE || '0 * * * *'; // Hourly by default
  console.log(`📅 Cron scheduled: ${cronSchedule}`);

  cron.schedule(cronSchedule, async () => {
    const day = new Date().getDay();
    const hour = new Date().getHours();
    const sendDays = (process.env.SEND_DAYS || '2,3').split(',').map(Number);
    const hourStart = parseInt(process.env.SEND_HOUR_START || '7');
    const hourEnd = parseInt(process.env.SEND_HOUR_END || '11');

    // Check if sending is allowed on this day and time
    if (!sendDays.includes(day) || hour < hourStart || hour >= hourEnd) {
      console.log(`[CRON] Outside send window (day=${day}, hour=${hour})`);
      return;
    }

    console.log(`[CRON] Running scheduled sends...`);
    try {
      const results = await runScheduledSends(parseInt(process.env.DAILY_SEND_LIMIT || '50'));
      console.log(`[CRON] ✅ Completed: ${results.successful} sent, ${results.failed} failed`);
    } catch (err) {
      console.error(`[CRON] ❌ Error:`, err.message);
    }
  });
})
  .catch(err => console.error("❌ MongoDB error:", err));

const upload = multer({ dest: "uploads/" });

// app.get("/res" ,async (req , res) => {
//   console.log("route");
  
//  const {subject , body } = await  sendColdMailTest();
//   try {
  
  
//   const {sucess} = await sendEmail({subject , body});

//   if(sucess) {
//     return  res.json({success : true , subject , body})
//   }
//   else {
//      return  res.json({success : false , subject , body})
//   }
//   } catch (error) {
//     console.log(error);
//     return;
//   }
  

// })
// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file provided" });
    }
    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", async () => {
        console.log(`[UPLOAD] CSV parsed: ${results.length} rows found`);
        if (results.length === 0) {
          fs.unlinkSync(filePath);
          return res.json({ success: true, inserted: 0, skipped: 0, total: 0, error: "CSV file is empty" });
        }

        console.log(`[UPLOAD] First row keys:`, Object.keys(results[0]));
        let inserted = 0, skipped = 0;
        const skipReasons = {};

        for (let idx = 0; idx < results.length; idx++) {
          const record = results[idx];
          try {
            const email = record["Email"] || record["email"] || "";
            const apolloId = record["Apollo Contact Id"] || record["apolloContactId"] || "";

            // Skip if no email or Apollo ID
            if (!email && !apolloId) {
              skipReasons["noEmailOrApolloId"] = (skipReasons["noEmailOrApolloId"] || 0) + 1;
              console.log(`[UPLOAD] Row ${idx}: Skipping - no email or Apollo ID`);
              skipped++;
              continue;
            }

            const filter = apolloId
              ? { apolloContactId: apolloId }
              : { email: email };

            // if exists → skip
            const existing = await Contact.findOne(filter);
            if (existing) {
              skipReasons["duplicate"] = (skipReasons["duplicate"] || 0) + 1;
              console.log(`[UPLOAD] Row ${idx}: Skipping - duplicate (${email || apolloId})`);
              skipped++;
              continue;
            }

            // else insert with proper schema mapping
            const contactData = {
              firstName: record["First Name"],
              lastName: record["Last Name"],
              title: record["Title"],
              companyName: record["Company Name"],
              companyNameForEmails: record["Company Name for Emails"],
              email: record["Email"],
              emailStatus: record["Email Status"],
              primaryEmailSource: record["Primary Email Source"],
              primaryEmailVerificationSource: record["Primary Email Verification Source"],
              emailConfidence: record["Email Confidence"] ? parseInt(record["Email Confidence"]) : null,
              primaryEmailCatchAllStatus: record["Primary Email Catch-all Status"],
              primaryEmailLastVerifiedAt: record["Primary Email Last Verified At"],
              departments: record["Departments"],
              contactOwner: record["Contact Owner"],
              workDirectPhone: record["Work Direct Phone"],
              homePhone: record["Home Phone"],
              mobilePhone: record["Mobile Phone"],
              corporatePhone: record["Corporate Phone"],
              otherPhone: record["Other Phone"],
              stage: record["Stage"],
              lists: record["Lists"],
              lastContacted: record["Last Contacted"],
              accountOwner: record["Account Owner"],
              employees: record["# Employees"],
              industry: record["Industry"],
              keywords: record["Keywords"],
              personLinkedinUrl: record["Person Linkedin Url"],
              website: record["Website"],
              companyLinkedinUrl: record["Company Linkedin Url"],
              facebookUrl: record["Facebook Url"],
              twitterUrl: record["Twitter Url"],
              city: record["City"],
              state: record["State"],
              country: record["Country"],
              companyAddress: record["Company Address"],
              companyCity: record["Company City"],
              companyState: record["Company State"],
              companyCountry: record["Company Country"],
              companyPhone: record["Company Phone"],
              technologies: record["Technologies"],
              annualRevenue: record["Annual Revenue"],
              totalFunding: record["Total Funding"],
              latestFunding: record["Latest Funding"],
              latestFundingAmount: record["Latest Funding Amount"],
              lastRaisedAt: record["Last Raised At"],
              subsidiaryOf: record["Subsidiary of"],
              numberOfRetailLocations: record["Number of Retail Locations"],
              apolloContactId: record["Apollo Contact Id"],
              apolloAccountId: record["Apollo Account Id"],
              secondaryEmail: record["Secondary Email"],
              secondaryEmailSource: record["Secondary Email Source"],
              secondaryEmailStatus: record["Secondary Email Status"],
              secondaryEmailVerificationSource: record["Secondary Email Verification Source"],
              tertiaryEmail: record["Tertiary Email"],
              tertiaryEmailSource: record["Tertiary Email Source"],
              tertiaryEmailStatus: record["Tertiary Email Status"],
              tertiaryEmailVerificationSource: record["Tertiary Email Verification Source"],
              // reply tracking
              reply: {
                replied: record["Replied"] === "true" || record["Replied"] === true,
                replyType: null
              },
              // email stats
              emailStats: {
                emailsSent: 0,
                opened: record["Email Open"] === "true" || record["Email Open"] === true,
                openedCount: 0
              },
              // flags
              flags: {
                doNotContact: false,
                bounced: record["Email Bounced"] === "true" || record["Email Bounced"] === true,
                unsubscribe: false
              }
            };

            await Contact.create(contactData);
            inserted++;
            console.log(`[UPLOAD] Row ${idx}: ✅ Inserted - ${email}`);
          } catch (err) {
            console.error(`[UPLOAD] Row ${idx}: ❌ Error - ${err.message}`);
            skipReasons["error"] = (skipReasons["error"] || 0) + 1;
            skipped++;
            continue;
          }
        }

        fs.unlinkSync(filePath);
        console.log(`[UPLOAD] SUMMARY: Total rows=${results.length}, Inserted=${inserted}, Skipped=${skipped}`, skipReasons);
        res.json({ success: true, inserted, skipped, total: results.length, skipReasons });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// 404 handler (must be after all other routes)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
