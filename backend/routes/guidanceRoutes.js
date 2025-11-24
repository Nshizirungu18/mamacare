const express = require("express");
const { getGuidanceByWeek } = require("../controllers/guidanceController");

const router = express.Router();
router.get("/", getGuidanceByWeek); // /api/guidance?week=20

module.exports = router;
