// src/pages/Dashboard.jsx
import React, { useCallback, useEffect, useState } from "react";
import api from "../api/api"; // your axios instance (baseURL: /api)
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

/**
 * MamaCare Dashboard (Advanced UI - Option C)
 *
 * Features:
 * - Animated SVG progress ring (pregnancy progressPercent)
 * - Weeks pregnant, trimester, due date, days remaining
 * - Baby size + fun fact for current week
 * - Symptoms, safe exercises, nutrition tips for the current week
 * - Emergency contacts panel
 * - Clinics list (fetches /clinics, falls back to sample)
 * - Week slider to explore week-by-week info (0-40)
 *
 * Drop into src/pages/Dashboard.jsx and import into routes.
 */

const DEFAULT_CLINICS = [
  {
    id: "sample-1",
    name: "Hope Maternity Clinic",
    address: "12 Health Ave, Kigali",
    phone: "+250 788 000 111",
    services: ["Prenatal care", "Ultrasound", "Vaccinations"],
  },
  {
    id: "sample-2",
    name: "Mother & Baby Hospital",
    address: "45 Wellness Rd, Kigali",
    phone: "+250 788 000 222",
    services: ["Emergency delivery", "Neonatal care", "Counseling"],
  },
];

const babySizes = [
  /* simplified: index = week; provide up to 40 (0-40) */
  "Seed", // 0
  "Poppy seed", // 1
  "Sesame seed", // 2
  "Blueberry", // 3
  "Avocado (tiny)", // 4
  "Lima bean", // 5
  "Grape", // 6
  "Raspberry", // 7
  "Strawberry", // 8
  "Green olive", // 9
  "Kumquat", // 10
  "Fig", // 11
  "Lime", // 12
  "Lemon", // 13
  "Apple", // 14
  "Orange", // 15
  "Avocado", // 16
  "Turnip", // 17
  "Bell pepper", // 18
  "Mango", // 19
  "Banana", // 20
  "Carrot", // 21
  "Papaya", // 22
  "Grapefruit", // 23
  "Corn on the cob", // 24
  "Cantaloupe", // 25
  "Rutabaga", // 26
  "Cauliflower", // 27
  "Eggplant", // 28
  "Cabbage", // 29
  "Butternut squash", // 30
  "Coconut", // 31
  "Pineapple", // 32
  "Honeydew melon", // 33
  "Durian", // 34
  "Large mango", // 35
  "Honeydew (bigger)", // 36
  "Small watermelon", // 37
  "Large watermelon", // 38
  "Very large watermelon", // 39
  "Full-term (approx)" // 40
];

// Sample week-based tips (dos/donts, symptoms, exercises, nutrition)
const weekGuides = (() => {
  const baseDos = [
    "Continue prenatal vitamins (folic acid + iron).",
    "Drink plenty of water (aim 8+ cups/day).",
    "Keep a balanced diet with protein, vegetables, and whole grains.",
  ];
  const baseDonts = [
    "Avoid alcohol and recreational drugs.",
    "Do not smoke or expose yourself to secondhand smoke.",
    "Avoid raw/undercooked meat and unpasteurized products.",
  ];

  const guides = {};
  for (let w = 0; w <= 40; w++) {
    const dos = [...baseDos];
    const donts = [...baseDonts];
    const symptoms = [];
    const exercises = [];
    const nutrition = [];

    // Gentle progressive tips by trimester
    if (w <= 12) {
      symptoms.push("Nausea, fatigue, breast tenderness are common.");
      exercises.push("Gentle walking, pelvic tilts.");
      nutrition.push("Small frequent meals to manage nausea.");
      dos.push("Schedule your first prenatal appointment.");
    } else if (w <= 27) {
      symptoms.push("Energy often improves; possible back pain.");
      exercises.push("Prenatal yoga, swimming, brisk walking.");
      nutrition.push("Increase iron-rich foods and calcium.");
      dos.push("Start pelvic floor exercises (Kegels).");
    } else {
      symptoms.push("Shortness of breath, swollen ankles, Braxton Hicks.");
      exercises.push("Gentle stretching, prenatal yoga, walking.");
      nutrition.push("Focus on protein and hydration; avoid excessive sodium.");
      dos.push("Prepare birth plan and pack bag for hospital.");
    }

    // Add a couple week-specific items
    if (w === 0) dos.push("If trying to conceive, track LMP and start folic acid.");
    if (w === 12) dos.push("First-trimester screening may be recommended.");
    if (w === 20) dos.push("Anomaly scan usually around week 20.");
    if (w === 28) dos.push("Consider glucose screening for gestational diabetes.");
    if (w === 36) dos.push("Discuss birth plan and signs of labor with your provider.");

    // Nutrition specifics
    nutrition.push("Eat leafy greens, lean protein, whole grains, healthy fats.");

    guides[w] = {
      dos,
      donts,
      symptoms,
      exercises,
      nutrition,
    };
  }
  return guides;
})();

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [weeksPregnant, setWeeksPregnant] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [trimester, setTrimester] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const navigate = useNavigate();

  // Helper: get token robustly (support different keys)
  const getToken = useCallback(
    () =>
      localStorage.getItem("userToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken"),
    []
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      // Prefer using axios instance (api) that already has baseURL '/api'
      const res = await api.get("/users/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = res.data;
      setUser(data);

      // Defensive: ensure we have lmp or dueDate
      const lmpDate = data.lmp ? new Date(data.lmp) : null;
      const due = data.dueDate ? new Date(data.dueDate) : lmpDate ? new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000) : null;

      if (!lmpDate && !due) {
        // No pregnancy info: leave defaults
        setWeeksPregnant(0);
        setProgressPercent(0);
        setTrimester("Unknown");
        setDueDate(null);
        setDaysRemaining(null);
        setSelectedWeek(0);
      } else {
        const today = new Date();
        const diffDays = lmpDate ? Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24)) : Math.max(0, Math.floor((280 * 24 * 60 * 60 * 1000 - (due - today)) / (1000 * 60 * 60 * 24)));
        const weeks = Math.max(0, Math.floor(diffDays / 7));
        const percent = Math.min(Math.round((weeks / 40) * 100), 100);
        let tri = "1st Trimester";
        if (weeks >= 13 && weeks <= 26) tri = "2nd Trimester";
        if (weeks >= 27) tri = "3rd Trimester";
        const remaining = due ? Math.max(Math.ceil((due - today) / (1000 * 60 * 60 * 24)), 0) : null;

        setWeeksPregnant(weeks);
        setProgressPercent(percent);
        setTrimester(tri);
        setDueDate(due);
        setDaysRemaining(remaining);
        setSelectedWeek(Math.min(Math.max(weeks, 0), 40));
      }
    } catch (err) {
      console.error("Failed to load profile:", err.response?.data || err.message);
      // show fallback defaults
      setUser(null);
      setWeeksPregnant(0);
      setProgressPercent(0);
      setTrimester("Unknown");
      setDueDate(null);
      setDaysRemaining(null);
      setSelectedWeek(0);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const loadClinics = useCallback(async () => {
    try {
      const res = await api.get("/clinics"); // must exist server-side; otherwise fallback
      setClinics(res.data && res.data.length ? res.data : DEFAULT_CLINICS);
    } catch (err) {
      console.warn("Clinics not available from backend, using defaults.", err);
      setClinics(DEFAULT_CLINICS);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    // after profile loaded, try load clinics
    if (user) loadClinics();
  }, [loadClinics, user]);

  const onWeekChange = (delta) => {
    setSelectedWeek((prev) => {
      const next = prev + delta;
      if (next < 0) return 0;
      if (next > 40) return 40;
      return next;
    });
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    return dt.toLocaleDateString();
  };

  // SVG progress ring params
  const R = 56;
  const C = 2 * Math.PI * R;
  const offset = Math.max(0, C - (progressPercent / 100) * C);

  // Selected week guide
  const guide = weekGuides[selectedWeek] || weekGuides[0];
  const babySizeText = babySizes[selectedWeek] || babySizes[babySizes.length - 1];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-3" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <BackButton to="/" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: main summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Hello, {user?.name?.split(" ")[0] || "Mama"}</h1>
                <p className="text-sm text-gray-500">Pregnancy overview</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Due:</p>
                <p className="font-semibold">{formatDate(dueDate)}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row md:items-center md:gap-6">
              {/* Progress ring */}
              <div className="flex items-center gap-6">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(70,70)">
                    <circle r={R} fill="transparent" stroke="#e6e6e6" strokeWidth="12" />
                    <circle
                      r={R}
                      fill="transparent"
                      stroke="url(#g1)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={C}
                      strokeDashoffset={offset}
                      transform={`rotate(-90)`}
                    />
                    <text x="0" y="-4" textAnchor="middle" className="text-sm font-semibold" style={{ fontSize: 14 }}>
                      {progressPercent}%
                    </text>
                    <text x="0" y="18" textAnchor="middle" className="text-xs text-gray-500" style={{ fontSize: 12 }}>
                      Completed
                    </text>
                  </g>
                </svg>

                <div>
                  <p className="text-lg font-semibold">{weeksPregnant} weeks</p>
                  <p className="text-sm text-gray-500">{trimester}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    {daysRemaining !== null ? `${daysRemaining} days until delivery` : "Days remaining: N/A"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => navigate("/wellness")}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Add Wellness
                    </button>
                    <button
                      onClick={() => navigate("/reminders")}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      View Reminders
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-gray-700">Baby this week</h3>
              <p className="mt-2 text-lg font-bold">{babySizeText}</p>
              <p className="text-sm text-gray-500 mt-1">Week {selectedWeek}</p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-gray-700">Symptoms</h3>
              {guide.symptoms.length ? (
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                  {guide.symptoms.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No specific symptoms noted.</p>
              )}
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-gray-700">Safe exercises</h3>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                {guide.exercises.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Nutrition & Do's/Don'ts */}
          <div className="bg-white p-6 rounded shadow">
            <div className="md:flex md:gap-6">
              <div className="md:flex-1">
                <h3 className="font-semibold text-gray-700">Nutrition tips</h3>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                  {guide.nutrition.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
              <div className="md:flex-1 mt-4 md:mt-0">
                <h3 className="font-semibold text-gray-700">Do's & Don'ts (Week {selectedWeek})</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="bg-green-50 p-3 rounded">
                    <h4 className="text-sm font-semibold text-green-700">Do's</h4>
                    <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                      {guide.dos.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <h4 className="text-sm font-semibold text-red-700">Don'ts</h4>
                    <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                      {guide.donts.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Week slider */}
          <div className="bg-white p-4 rounded shadow flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onWeekChange(-1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ←
              </button>
              <div>
                <p className="text-sm text-gray-500">Explore week</p>
                <p className="text-lg font-semibold">{selectedWeek}</p>
              </div>
              <button
                onClick={() => onWeekChange(1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                →
              </button>
            </div>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="40"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">Baby size</p>
              <p className="font-semibold">{babySizeText}</p>
            </div>
          </div>
        </div>

        {/* RIGHT: side panel */}
        <aside className="space-y-6">
          {/* Emergency contacts */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-gray-700">Emergency</h3>
            <p className="text-sm text-gray-500 mt-1">Important numbers to call</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Local Emergency</p>
                  <p className="text-sm text-gray-600">112</p>
                </div>
                <button
                  onClick={() => (window.location.href = "tel:112")}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Call
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Nearest Clinic</p>
                  <p className="text-sm text-gray-600">{clinics?.[0]?.name || "N/A"}</p>
                </div>
                <button
                  onClick={() => (window.location.href = `tel:${clinics?.[0]?.phone || ""}`)}
                  className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                  Call
                </button>
              </div>

              <div className="mt-3">
                <p className="text-sm text-gray-500">Add your doctor</p>
                <button
                  onClick={() => navigate("/profile")}
                  className="mt-2 w-full px-3 py-2 bg-green-500 text-white rounded"
                >
                  Connect Doctor / Update Profile
                </button>
              </div>
            </div>
          </div>

          {/* Clinics list */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-gray-700">Clinics near you</h3>
            <p className="text-sm text-gray-500 mt-1">Tap to view contact or directions</p>
            <div className="mt-3 space-y-3">
              {clinics.map((c) => (
                <div key={c.id || c._id} className="p-3 border rounded flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-gray-600">{c.address}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a
                        href={`tel:${c.phone}`}
                        className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
                      >
                        Call
                      </a>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`}
                        className="text-sm px-2 py-1 bg-gray-200 rounded"
                      >
                        Directions
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Services: {c.services?.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-gray-700">Quick Stats</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div>
                <p className="text-xs text-gray-500">Weeks pregnant</p>
                <p className="font-semibold">{weeksPregnant}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Progress</p>
                <p className="font-semibold">{progressPercent}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Trimester</p>
                <p className="font-semibold">{trimester}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Due date</p>
                <p className="font-semibold">{formatDate(dueDate)}</p>
              </div>
            </div>
          </div>
        </aside>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            Note: This information is for guidance only. Always consult your healthcare provider
            for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
