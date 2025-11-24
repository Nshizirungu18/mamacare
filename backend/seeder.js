// seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Clinic = require('./models/Clinic');
const clinics = require('./data/clinics');
const PregnancyMilestone = require('./models/PregnancyMilestone');
const pregnancyMilestones = require('./data/pregnancyMilestones');
const Guidance = require("./models/Guidance");
const guidance = require("./data/guidance");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // Clear existing collections
    await Clinic.deleteMany();
    await PregnancyMilestone.deleteMany();
    await Guidance.deleteMany();

    // Insert seed data
    await Clinic.insertMany(clinics);
    await PregnancyMilestone.insertMany(pregnancyMilestones);
    await Guidance.insertMany(guidance);

    console.log('Clinics, pregnancy milestones, and guidance imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    process.exit(1);
  }
};

importData();
