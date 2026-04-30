import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import Contact from "./models/Contacts.js";
import { sendColdMailTest } from "./ai-service/service.js";
// import { sendEmail } from "./email-service/index.js";
import emailRouter from "./routes/email.router.js";
import contactRouter from "./routes/contact.router.js";

const app = express();
const PORT = 5000;

// CORS for frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

app.use("/email", emailRouter);
app.use("/api/contacts", contactRouter);

// MongoDB connect
mongoose.connect("mongodb+srv://mrrishikesh2_db_user:qP9ir3ns0hlQDJ5D@cluster0.axlzsbl.mongodb.net/factoryjet", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
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
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        let inserted = 0, skipped = 0;

        for (const record of results) {
          try {
            const filter = record["Apollo Contact Id"]
              ? { apolloContactId: record["Apollo Contact Id"] }
              : { email: record["Email"] };

            // if exists → skip
            const existing = await Contact.findOne(filter);
            if (existing) {
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
          } catch (err) {
            console.error("Error processing record:", err.message);
            skipped++;
            continue;
          }
        }

        fs.unlinkSync(filePath);
        res.json({ success: true, inserted, skipped, total: results.length });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Error handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
