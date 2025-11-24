import { useEffect, useState } from "react";
import api from "../api/api";
import useAuthStore from "../store/authStore";
import BackButton from "../components/BackButton";

const Profile = () => {
  const { setUser, logout } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    lmp: "",
    dueDate: "",
    phone: "",
    language: "English",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/users/profile");
        if (!isActive) return;
        setFormData({
          name: data.name || "",
          email: data.email || "",
          dob: data.dob ? data.dob.split("T")[0] : "",
          lmp: data.lmp ? data.lmp.split("T")[0] : "",
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
          phone: data.phone || "",
          language: data.language || "English",
        });
      } catch (err) {
        if (isActive) {
          console.error("Failed to fetch profile:", err.response?.data || err.message);
          setError("Failed to fetch profile");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isActive = false;
    };
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate due date when LMP changes
      if (name === "lmp" && value) {
        const lmpDate = new Date(value);
        const dueDate = new Date(lmpDate);
        dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
        updated.dueDate = dueDate.toISOString().split("T")[0];
      }
      return updated;
    });
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const { data } = await api.put("/users/profile", formData);
      setUser(data, data.token); // update Zustand
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <BackButton to="/dashboard" />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            My Profile
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Menstrual Period (LMP) *
                  </label>
                  <input
                    type="date"
                    name="lmp"
                    value={formData.lmp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date (auto-calculated)
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="French">French</option>
                    <option value="Kinyarwanda">Kinyarwanda</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  Update Profile
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold"
                >
                  Logout
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
