// models/Clinic.js
const mongoose = require('mongoose');

const clinicSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    phone: { type: String },
    type: { type: String },
    services: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clinic', clinicSchema);
