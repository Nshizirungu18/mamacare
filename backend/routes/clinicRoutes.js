// routes/clinicRoutes.js
const express = require("express");
const router = express.Router();
const { getClinics, addClinic } = require("../controllers/clinicController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public route to fetch clinics
router.get("/", getClinics);

// Admin route to add clinics
router.post("/", protect, admin, addClinic);

module.exports = router;
