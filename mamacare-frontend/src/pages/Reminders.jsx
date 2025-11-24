import { useEffect, useState } from "react";
import api from "../api/api";
import ReminderCard from "../components/ReminderCard";
import BackButton from "../components/BackButton";

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dateTime: "",
    reminderType: "custom",
  });

  const [editingId, setEditingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    const loadReminders = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/reminders");
        if (isActive) setReminders(data);
      } catch (err) {
        console.error(err.response?.data || err.message);
        if (isActive) setError("Failed to fetch reminders");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadReminders();
    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  const refreshReminders = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or update reminder
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        dateTime: new Date(formData.dateTime).toISOString(),
        reminderType: formData.reminderType,
      };

      if (editingId) {
        await api.put(`/reminders/${editingId}`, payload);
        setSuccess("Reminder updated successfully!");
      } else {
        await api.post("/reminders", payload);
        setSuccess("Reminder added successfully!");
      }

      setFormData({
        title: "",
        description: "",
        dateTime: "",
        reminderType: "custom",
      });
      setEditingId(null);
      refreshReminders();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save reminder");
    }
  };

  // Prepare form for editing
  const handleEdit = (reminder) => {
    const datetimeLocal = new Date(reminder.dateTime)
      .toISOString()
      .slice(0, 16); // YYYY-MM-DDTHH:mm

    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      dateTime: datetimeLocal,
      reminderType: reminder.reminderType || "custom",
    });
    setEditingId(reminder._id);
    setError("");
    setSuccess("");
  };

  // Delete reminder
  const handleDelete = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/reminders/${id}`);
      setSuccess("Reminder deleted successfully!");
      refreshReminders();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to delete reminder");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <BackButton to="/dashboard" />
        </div>
        <h1 className="text-2xl font-bold mb-6">Reminders</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Reminder" : "Add New Reminder"}
        </h2>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

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
        />

        <input
          type="datetime-local"
          name="dateTime"
          value={formData.dateTime}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <select
          name="reminderType"
          value={formData.reminderType}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="custom">Custom</option>
          <option value="medication">Medication</option>
          <option value="appointment">Appointment</option>
        </select>

        <button
          type="submit"
          className={`w-full py-2 rounded-lg text-white ${
            editingId
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-500 hover:bg-green-600"
          } transition`}
        >
          {editingId ? "Update Reminder" : "Add Reminder"}
        </button>
      </form>

      {/* Reminders List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p>No reminders yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((reminder) => (
            <div key={reminder._id} className="relative">
              <ReminderCard reminder={reminder} />
              <div className="flex justify-end mt-2 gap-2">
                <button
                  onClick={() => handleEdit(reminder)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(reminder._id)}
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
    </div>
  );
};

export default Reminders;
