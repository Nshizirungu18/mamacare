const express = require("express");
const { getMilestoneByWeek, getAllMilestones } = require("../controllers/pregnancyController");

const router = express.Router();

// GET all milestones
router.get("/", getAllMilestones);

// GET milestone by week
router.get("/:week", getMilestoneByWeek);

module.exports = router;
