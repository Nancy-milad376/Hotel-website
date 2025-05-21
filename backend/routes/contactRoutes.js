const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
//const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/", contactController.createContactMessage);

// Protected routes (admin only)
router.get("/", contactController.getContactMessages);
router.get("/:id", contactController.getContactMessageById);
router.put("/:id", contactController.updateContactStatus);
router.delete("/:id", contactController.deleteContactMessage);

module.exports = router;
