// controllers/userController.js

const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Helper: calculate pregnancy progress
const calcPregnancyInfo = (lmp) => {
  if (!lmp) {
    return {
      weeksPregnant: null,
      trimester: null,
      progressPercent: null,
    };
  }

  const lmpDate = new Date(lmp);
  const today = new Date();

  // Weeks pregnant
  const diffMs = today - lmpDate;
  const weeksPregnant = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

  // Trimester
  let trimester = "";
  if (weeksPregnant <= 13) trimester = "1st Trimester";
  else if (weeksPregnant <= 27) trimester = "2nd Trimester";
  else trimester = "3rd Trimester";

  // Progress %
  const progressPercent = Math.min(
    Math.round((weeksPregnant / 40) * 100),
    100
  );

  return { weeksPregnant, trimester, progressPercent };
};

// @desc Register new user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, dob, lmp, phone, language } = req.body;

  if (!firstName || !lastName || !email || !password || !lmp) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Auto-calculate due date
  const dueDate = new Date(lmp);
  dueDate.setDate(dueDate.getDate() + 280);

  const user = await User.create({
    name: `${firstName} ${lastName}`,
    email: email.toLowerCase(),
    password,
    dob,
    lmp,
    dueDate,
    phone,
    language,
  });

  const pregInfo = calcPregnancyInfo(lmp);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    dob: user.dob,
    lmp: user.lmp,
    dueDate: user.dueDate,
    phone: user.phone,
    language: user.language,
    isAdmin: user.isAdmin,
    ...pregInfo,
    token: generateToken(user._id),
  });
});

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  const pregInfo = calcPregnancyInfo(user.lmp);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    dob: user.dob,
    lmp: user.lmp,
    dueDate: user.dueDate,
    phone: user.phone,
    language: user.language,
    isAdmin: user.isAdmin,
    ...pregInfo,
    token: generateToken(user._id),
  });
});

// @desc Get logged-in user's profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const pregInfo = calcPregnancyInfo(user.lmp);

  res.json({
    ...user._doc,
    ...pregInfo,
  });
});

// @desc Update profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email ? req.body.email.toLowerCase() : user.email;
  user.dob = req.body.dob || user.dob;
  user.lmp = req.body.lmp || user.lmp;

  // If LMP changed → recalc due date
  if (req.body.lmp) {
    const dueDate = new Date(req.body.lmp);
    dueDate.setDate(dueDate.getDate() + 280);
    user.dueDate = dueDate;
  }

  user.phone = req.body.phone || user.phone;
  user.language = req.body.language || user.language;

  if (req.body.password) user.password = req.body.password;

  const updatedUser = await user.save();
  const pregInfo = calcPregnancyInfo(updatedUser.lmp);

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    dob: updatedUser.dob,
    lmp: updatedUser.lmp,
    dueDate: updatedUser.dueDate,
    phone: updatedUser.phone,
    language: updatedUser.language,
    isAdmin: updatedUser.isAdmin,
    ...pregInfo,
    token: generateToken(updatedUser._id),
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
