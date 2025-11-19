import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import NotificationPopup from "../components/NotificationPopup";
import BackButton from "../components/BackButton";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    lmp: "",
    dueDate: "",
    phone: "",
    password: "",
    language: "English",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

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

  // Validate age (must be at least 10 years old)
  const validateAge = (dob) => {
    if (!dob) return { valid: true, message: "" };
    
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge--;
    }
    
    if (actualAge < 10) {
      return { valid: false, message: "You must be at least 10 years old to register." };
    }
    return { valid: true, message: "" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowPopup(false);

    // Frontend validation for required fields
    const requiredFields = ["email", "firstName", "lastName", "password", "lmp", "gender"];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        const fieldName = field === "lmp" ? "Last Menstrual Period" : field;
        setError(`Please fill the required field: ${fieldName}`);
        setPopupMessage(`Please fill the required field: ${fieldName}`);
        setPopupType("error");
        setShowPopup(true);
        return;
      }
    }

    // Validate gender (must be female)
    if (formData.gender.toLowerCase() !== "female") {
      setError("Only female users can register for MamaCare.");
      setPopupMessage("Only female users can register for MamaCare.");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    // Validate age
    if (formData.dob) {
      const ageValidation = validateAge(formData.dob);
      if (!ageValidation.valid) {
        setError(ageValidation.message);
        setPopupMessage(ageValidation.message);
        setPopupType("error");
        setShowPopup(true);
        return;
      }
    }

    try {
      const payload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        gender: formData.gender,
        lmp: formData.lmp,
        dueDate: formData.dueDate || calculateDueDate(formData.lmp),
        phone: formData.phone,
        password: formData.password,
        language: formData.language,
      };

      console.log("Payload sent to backend:", payload);

      await api.post("/users/register", payload);
      setSuccess("Registration successful! Redirecting to login...");
      setPopupMessage("Registration successful! Redirecting to login...");
      setPopupType("success");
      setShowPopup(true);
      
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        lmp: "",
        dueDate: "",
        phone: "",
        password: "",
        language: "English",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Registration failed";
      setError(errorMsg);
      setPopupMessage(errorMsg);
      setPopupType("error");
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <NotificationPopup
        message={popupMessage}
        type={popupType}
        show={showPopup}
        onClose={() => {
          setShowPopup(false);
          setPopupMessage("");
        }}
        duration={popupType === "success" ? 2000 : 5000}
      />
      
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <BackButton to="/" />
        </div>
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

          {/* Gender */}
          <div>
            <label className="block mb-1 font-medium">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">MamaCare is exclusively for female users</p>
          </div>

          {/* DOB */}
          <div>
            <label className="block mb-1 font-medium">Date of Birth *</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split("T")[0]}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">You must be at least 10 years old</p>
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
