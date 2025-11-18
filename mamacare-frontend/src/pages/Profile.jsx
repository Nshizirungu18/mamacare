import { useEffect, useState } from "react";
import api from "../api/api";
import useAuthStore from "../store/authStore";

const Profile = () => {
  const { setUser, logout } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dueDate: "",
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
          name: data.name,
          email: data.email,
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
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
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">My Profile</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading profile...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-500">{message}</p>}

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="date"
              name="dueDate"
              placeholder="Due Date"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Update Profile
            </button>
          </form>
        )}

        <button
          onClick={() => logout()}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
