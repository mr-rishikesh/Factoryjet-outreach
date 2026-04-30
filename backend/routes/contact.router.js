import express from "express";
import {
  getContacts,
  filterContacts,
  getContactById,
  updateContact,
  bulkUpdateContacts,
  getContactStats,
} from "../controller/contact.controller.js";
import { sendToContacts, sendFollowup } from "../controller/emailAction.controller.js";

const contactRouter = express.Router();

// Contact routes — specific routes BEFORE generic :id routes
contactRouter.get("/stats", getContactStats);
contactRouter.get("/filter", filterContacts);
contactRouter.patch("/bulk", bulkUpdateContacts);
contactRouter.get("/:id", getContactById);
contactRouter.get("/", getContacts);
contactRouter.patch("/:id", updateContact);

// Email action routes
contactRouter.post("/emails/send", sendToContacts);
contactRouter.post("/emails/followup", sendFollowup);

export default contactRouter;
