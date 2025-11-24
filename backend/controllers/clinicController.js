// controllers/clinicController.js
const asyncHandler = require("express-async-handler");
const Clinic = require("../models/Clinic");

// @desc    Get all clinics
// @route   GET /api/clinics
// @access  Public
const getClinics = asyncHandler(async (req, res) => {
  const clinics = await Clinic.find({});
  res.json(clinics);
});

// @desc    Add a clinic (admin feature)
// @route   POST /api/clinics
// @access  Private/Admin
const addClinic = asyncHandler(async (req, res) => {
  const { name, address, phone, services } = req.body;

  if (!name || !address) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  const clinic = new Clinic({ name, address, phone, services });
  const createdClinic = await clinic.save();
  res.status(201).json(createdClinic);
});

module.exports = {
  getClinics,
  addClinic,
};
