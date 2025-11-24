const PregnancyMilestone = require("../models/PregnancyMilestone");

// Fetch milestone by week
const getMilestoneByWeek = async (req, res) => {
  try {
    const { week } = req.params;
    const milestone = await PregnancyMilestone.findOne({ week });
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch all milestones
const getAllMilestones = async (req, res) => {
  try {
    const milestones = await PregnancyMilestone.find();
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMilestoneByWeek, getAllMilestones };
