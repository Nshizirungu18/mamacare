import { useEffect, useState } from "react";
import api from "../api/api";
import WellnessCard from "../components/WellnessCard";
import BackButton from "../components/BackButton";

const Wellness = () => {
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    mood: "",
    symptoms: "",
    sleepHours: "",
    hydrationLiters: "",
    nutritionNotes: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    const loadWellness = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/wellness");
        if (isActive) setWellnessLogs(data);
      } catch (err) {
        console.error(err.response?.data || err.message);
        if (isActive) setError("Failed to fetch wellness logs");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadWellness();
    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  const refreshWellness = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        date: formData.date || new Date().toISOString(),
        mood: formData.mood || undefined,
        symptoms: formData.symptoms
          ? formData.symptoms.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        sleepHours: formData.sleepHours ? Number(formData.sleepHours) : undefined,
        hydrationLiters: formData.hydrationLiters
          ? Number(formData.hydrationLiters)
          : undefined,
        nutritionNotes: formData.nutritionNotes || undefined,
      };

      if (editingId) {
        await api.put(`/wellness/${editingId}`, payload);
        setSuccess("Wellness log updated successfully!");
      } else {
        await api.post("/wellness", payload);
        setSuccess("Wellness log added successfully!");
      }

      setFormData({
        date: "",
        mood: "",
        symptoms: "",
        sleepHours: "",
        hydrationLiters: "",
        nutritionNotes: "",
      });
      setEditingId(null);
      refreshWellness();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save wellness log");
    }
  };

  const handleEdit = (log) => {
    setFormData({
      date: log.date ? new Date(log.date).toISOString().split("T")[0] : "",
      mood: log.mood || "",
      symptoms: Array.isArray(log.symptoms) ? log.symptoms.join(", ") : log.symptoms || "",
      sleepHours: log.sleepHours || "",
      hydrationLiters: log.hydrationLiters || "",
      nutritionNotes: log.nutritionNotes || "",
    });
    setEditingId(log._id);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/wellness/${id}`);
      setSuccess("Wellness log deleted successfully!");
      refreshWellness();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to delete log");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <BackButton to="/dashboard" />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Wellness Logs</h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Wellness Log" : "Add New Wellness Log"}
          </h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mood
              </label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select mood</option>
                <option value="excited">Excited</option>
                <option value="happy">Happy</option>
                <option value="calm">Calm</option>
                <option value="tired">Tired</option>
                <option value="anxious">Anxious</option>
                <option value="energetic">Energetic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symptoms (comma-separated)
              </label>
              <input
                type="text"
                name="symptoms"
                placeholder="e.g., nausea, fatigue, back pain"
                value={formData.symptoms}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sleep Hours
              </label>
              <input
                type="number"
                name="sleepHours"
                placeholder="e.g., 8"
                min="0"
                max="24"
                step="0.5"
                value={formData.sleepHours}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hydration (Liters)
              </label>
              <input
                type="number"
                name="hydrationLiters"
                placeholder="e.g., 2.5"
                min="0"
                step="0.1"
                value={formData.hydrationLiters}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nutrition Notes
            </label>
            <textarea
              name="nutritionNotes"
              placeholder="Notes about your nutrition today..."
              value={formData.nutritionNotes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              editingId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {editingId ? "Update Log" : "Add Log"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  date: "",
                  mood: "",
                  symptoms: "",
                  sleepHours: "",
                  hydrationLiters: "",
                  nutritionNotes: "",
                });
                setError("");
                setSuccess("");
              }}
              className="w-full py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel Edit
            </button>
          )}
        </form>

        {/* Wellness Logs */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading wellness logs...</p>
          </div>
        ) : wellnessLogs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500 text-lg">No wellness logs yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              Start tracking your wellness by adding your first log above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wellnessLogs.map((log) => (
              <div key={log._id} className="relative">
                <WellnessCard log={log} />
                <div className="flex justify-end mt-2 gap-2">
                  <button
                    onClick={() => handleEdit(log)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(log._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wellness;
