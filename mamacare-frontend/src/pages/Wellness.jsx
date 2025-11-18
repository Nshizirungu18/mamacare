import { useEffect, useState } from "react";
import api from "../api/api";
import WellnessCard from "../components/WellnessCard";

const Wellness = () => {
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  });

  const [editingId, setEditingId] = useState(null); // for update
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

  // Handle form change
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or update wellness log
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/wellness/${editingId}`, formData);
      } else {
        await api.post("/wellness", formData);
      }
      setFormData({ title: "", description: "", date: "" });
      setEditingId(null);
      refreshWellness();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to save wellness log");
    }
  };

  // Edit a log
  const handleEdit = log => {
    setFormData({
      title: log.title,
      description: log.description,
      date: log.date.split("T")[0],
    });
    setEditingId(log._id);
  };

  // Delete a log
  const handleDelete = async id => {
    try {
      await api.delete(`/wellness/${id}`);
      refreshWellness();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to delete log");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Wellness Logs</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Wellness Log" : "Add New Wellness Log"}
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className={`w-full py-2 rounded-lg text-white ${
            editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
          } transition`}
        >
          {editingId ? "Update Log" : "Add Log"}
        </button>
      </form>

      {/* Wellness Logs */}
      {loading ? (
        <p className="text-center text-gray-500">Loading wellness logs...</p>
      ) : wellnessLogs.length === 0 ? (
        <p>No wellness logs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wellnessLogs.map(log => (
            <div key={log._id} className="relative">
              <WellnessCard log={log} />
              <div className="flex justify-end mt-2 gap-2">
                <button
                  onClick={() => handleEdit(log)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(log._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wellness;
