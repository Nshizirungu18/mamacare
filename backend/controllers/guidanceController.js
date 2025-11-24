const Guidance = require("../models/Guidance");

const getGuidanceByWeek = async (req, res) => {
  try {
    const { week } = req.query;
    const guidance = await Guidance.find({ week: Number(week) });
    res.json(guidance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getGuidanceByWeek };
