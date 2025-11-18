import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    dob: "",
    lmp: "",
    dueDate: "",
    phone: "",
    password: "",
    language: "English",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Calculate due date from LMP
  const calculateDueDate = (lmp) => {
    if (!lmp) return "";
    const lmpDate = new Date(lmp);
    const due = new Date(lmpDate);
    due.setDate(due.getDate() + 280); // 40 weeks
    return due.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Update due date automatically when LMP changes
      if (name === "lmp") {
        updated.dueDate = calculateDueDate(value);
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation for required fields
    const requiredFields = ["email", "firstName", "lastName", "password", "lmp"];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        setError(`Please fill the required field: ${field}`);
        return;
      }
    }

    try {
      const payload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        lmp: formData.lmp,
        dueDate: formData.dueDate || calculateDueDate(formData.lmp),
        phone: formData.phone,
        password: formData.password,
        language: formData.language,
      };

      console.log("Payload sent to backend:", payload);

      await api.post("/users/register", payload);
      setSuccess("Registration successful! Redirecting to login...");
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        dob: "",
        lmp: "",
        dueDate: "",
        phone: "",
        password: "",
        language: "English",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">MamaCare Registration</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Names */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 font-medium">First Name *</label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">Last Name *</label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email *</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block mb-1 font-medium">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* LMP */}
          <div>
            <label className="block mb-1 font-medium">First Day of Last Period (LMP) *</label>
            <input
              type="date"
              name="lmp"
              value={formData.lmp}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Calculated Due Date */}
          <div>
            <label className="block mb-1 font-medium">Calculated Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-medium">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Language */}
          <div>
            <label className="block mb-1 font-medium">Preferred Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="Kinyarwanda">Kinyarwanda</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!formData.lmp} // disable until LMP filled
            className={`w-full py-2 rounded-lg text-white transition ${
              !formData.lmp
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
