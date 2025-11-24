// src/pages/Clinics.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api"; // axios instance with baseURL '/api'
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BackButton from "../components/BackButton";

// Fix default icon issue in many bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ---------- DEFAULT / FALLBACK CLINICS (Rwanda samples) ----------
const FALLBACK = [
  {
    _id: "kig-1",
    name: "King Faisal Hospital",
    address: "KN 82 St, Kigali",
    province: "Kigali City",
    district: "Kicukiro",
    phone: "+250788123456",
    services: ["Obstetrics", "Gynecology", "Pediatrics"],
    // optional coordinates for map (lat, lng)
    location: { lat: -1.9425, lng: 30.0891 },
  },
  {
    _id: "kig-2",
    name: "CHUK (University Teaching Hospital)",
    address: "KG 11 Ave, Kigali",
    province: "Kigali City",
    district: "Nyarugenge",
    phone: "+250788654321",
    services: ["Obstetrics", "Emergency", "Surgery"],
    location: { lat: -1.9512, lng: 30.0626 },
  },
  {
    _id: "kig-3",
    name: "Muhima Health Center",
    address: "Muhima, Kigali",
    province: "Kigali City",
    district: "Kimironko",
    phone: "+250788112233",
    services: ["Prenatal Care", "Immunization"],
    location: { lat: -1.9378, lng: 30.0911 },
  },
  {
    _id: "rwa-1",
    name: "Rwamagana District Hospital",
    address: "Rwamagana, Eastern Province",
    province: "Eastern Province",
    district: "Rwamagana",
    phone: "+250788445566",
    services: ["Maternal Care", "Emergency"],
    location: { lat: -1.9500, lng: 30.4300 },
  },
  {
    _id: "reb-1",
    name: "Rebero Health Center",
    address: "Rebero, Kigali",
    province: "Kigali City",
    district: "Gasabo",
    phone: "+250788987654",
    services: ["Maternal Care", "Vaccination"],
    location: { lat: -1.9515, lng: 30.1164 },
  },
];

// ---------- Helpers ----------
const haversineDistanceKm = (a, b) => {
  // a, b: { lat, lng }
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
};

// ---------- Component ----------
export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState([]); // multiple services
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Map & geolocation
  const [userLoc, setUserLoc] = useState(null); // {lat, lng}
  const [mapCenter, setMapCenter] = useState({ lat: -1.9706, lng: 30.1044 }); // Kigali default
  const [mapZoom, setMapZoom] = useState(11);

  // Favorites (localStorage)
  const FAV_KEY = "mamacare_fav_clinics";
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // appointment modal / quick email link: we will use mailto
  const makeAppointmentMailto = (clinic) => {
    const subject = encodeURIComponent(`Appointment request - ${clinic.name}`);
    const body = encodeURIComponent(
      `Hello,\n\nI would like to request an appointment at ${clinic.name}.\n\nName:\nPreferred date/time:\nReason:\n\nThank you.`
    );
    return `mailto:info@${clinic.name.replace(/\s+/g, "").toLowerCase()}.example?subject=${subject}&body=${body}`;
  };

  // Fetch clinics from backend (or fallback)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/clinics"); // expects /api/clinics
        if (Array.isArray(res.data) && res.data.length > 0) {
          // ensure each clinic has location; otherwise leave undefined
          setClinics(res.data);
        } else {
          setClinics(FALLBACK);
        }
      } catch (err) {
        console.warn("Failed to fetch clinics from backend — using fallback", err.message || err);
        setClinics(FALLBACK);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Get user location (geolocation)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        setMapCenter(loc);
        setMapZoom(12);
      },
      (err) => {
        console.warn("Geolocation failed or denied:", err.message);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  // Derived lists: provinces, types, services
  const provinces = useMemo(() => {
    const set = new Set();
    clinics.forEach((c) => c.province && set.add(c.province));
    return Array.from(set).sort();
  }, [clinics]);

  const types = useMemo(() => {
    const set = new Set();
    clinics.forEach((c) => c.type && set.add(c.type));
    return Array.from(set).sort();
  }, [clinics]);

  const availableServices = useMemo(() => {
    const s = new Set();
    clinics.forEach((c) => (c.services || []).forEach((svc) => s.add(svc)));
    return Array.from(s).sort();
  }, [clinics]);

  // Filtering + search + distance sort
  const processedClinics = useMemo(() => {
    let list = clinics.map((c) => ({ ...c }));

    // text search by name or address or district
    if (search && search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(s) ||
          (c.address || "").toLowerCase().includes(s) ||
          (c.district || "").toLowerCase().includes(s)
      );
    }

    // province filter
    if (provinceFilter) {
      list = list.filter((c) => c.province === provinceFilter);
    }

    // type filter
    if (typeFilter) {
      list = list.filter((c) => c.type === typeFilter);
    }

    // services filter (AND)
    if (serviceFilter.length > 0) {
      list = list.filter((c) =>
        serviceFilter.every((sf) => (c.services || []).includes(sf))
      );
    }

    // compute distance if userLoc & clinic location exist
    if (userLoc) {
      list = list.map((c) => {
        const loc = c.location || c.coords || (c.lat && c.lng ? { lat: c.lat, lng: c.lng } : null);
        if (loc) {
          const dist = haversineDistanceKm(userLoc, loc);
          return { ...c, distanceKm: dist };
        }
        return { ...c, distanceKm: null };
      });

      // sort by distance if distance exists (closest first)
      list.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return list;
  }, [clinics, search, provinceFilter, typeFilter, serviceFilter, userLoc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedClinics.length / PAGE_SIZE));
  const pageItems = processedClinics.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Favorites behavior
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      let next;
      if (prev.includes(id)) next = prev.filter((x) => x !== id);
      else next = [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Save appointment: we just open mailto (or you can call endpoint)
  const onBookAppointment = (clinic) => {
    // open mailto link
    const mailto = makeAppointmentMailto(clinic);
    window.location.href = mailto;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading clinics…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <BackButton to="/" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded shadow mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Clinics Map</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (userLoc) {
                      setMapCenter(userLoc);
                      setMapZoom(13);
                    } else {
                      alert("Enable location in your browser to use nearby search");
                    }
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Near me
                </button>
                <button
                  onClick={() => {
                    // reset map to Kigali
                    setMapCenter({ lat: -1.9706, lng: 30.1044 });
                    setMapZoom(11);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Reset
                </button>
              </div>
            </div>

            <div style={{ height: 420 }} className="rounded overflow-hidden">
              <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {userLoc && (
                  <>
                    <Marker position={[userLoc.lat, userLoc.lng]}>
                      <Popup>You're here</Popup>
                    </Marker>
                    <Circle center={[userLoc.lat, userLoc.lng]} radius={5000} pathOptions={{ color: "#60a5fa", opacity: 0.25 }} />
                  </>
                )}

                {processedClinics.map((c) => {
                  const loc = c.location || c.coords || (c.lat && c.lng ? { lat: c.lat, lng: c.lng } : null);
                  if (!loc) return null;
                  return (
                    <Marker key={c._id} position={[loc.lat, loc.lng]}>
                      <Popup>
                        <div className="max-w-xs">
                          <h3 className="font-semibold">{c.name}</h3>
                          <p className="text-xs">{c.address}</p>
                          <p className="text-xs">Services: {(c.services || []).join(", ")}</p>
                          <div className="mt-2 flex gap-2">
                            <a className="px-2 py-1 bg-green-500 text-white rounded text-xs" href={`tel:${c.phone || ""}`}>Call</a>
                            <button onClick={() => onBookAppointment(c)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Book</button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* List + pagination */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Clinics List</h3>
            <div className="space-y-3">
              {pageItems.map((c) => (
                <div key={c._id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-gray-600">{c.address} — {c.district || c.province}</p>
                    <p className="text-xs text-gray-500">Services: {(c.services || []).join(", ")}</p>
                    {c.distanceKm !== null && c.distanceKm !== undefined && (
                      <p className="text-xs text-gray-500">≈ {c.distanceKm.toFixed(1)} km</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <button onClick={() => window.open(`tel:${c.phone || ""}`)} className="px-3 py-1 bg-green-500 text-white rounded">Call</button>
                      <button onClick={() => onBookAppointment(c)} className="px-3 py-1 bg-blue-500 text-white rounded">Book</button>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => toggleFavorite(c._id)} className={`px-2 py-1 rounded ${favorites.includes(c._id) ? "bg-yellow-400" : "bg-gray-200"}`}>
                        {favorites.includes(c._id) ? "★ Favorited" : "☆ Save"}
                      </button>
                      <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address || c.name)}`} className="px-2 py-1 bg-gray-100 rounded">Directions</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, processedClinics.length)} of {processedClinics.length}</p>
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 bg-gray-200 rounded">First</button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 bg-gray-200 rounded">Prev</button>
                <span className="px-3">{page}/{totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 bg-gray-200 rounded">Next</button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 bg-gray-200 rounded">Last</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Filters & Favorites */}
        <aside className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold">Filters</h4>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name/address/district" className="w-full mt-2 p-2 border rounded" />

            <div className="mt-3">
              <label className="block text-sm font-medium">Province</label>
              <select value={provinceFilter} onChange={(e) => { setProvinceFilter(e.target.value); setPage(1); }} className="w-full p-2 border rounded mt-1">
                <option value="">All</option>
                {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium">Type</label>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="w-full p-2 border rounded mt-1">
                <option value="">All</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium">Services</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableServices.map((s) => {
                  const active = serviceFilter.includes(s);
                  return (
                    <button key={s} onClick={() => { setServiceFilter((prev) => active ? prev.filter(x => x !== s) : [...prev, s]); setPage(1); }} className={`px-3 py-1 rounded ${active ? "bg-blue-500 text-white" : "bg-gray-100"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <button onClick={() => { setSearch(""); setProvinceFilter(""); setTypeFilter(""); setServiceFilter([]); setPage(1); }} className="w-full px-3 py-2 bg-gray-200 rounded">Clear Filters</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold">Favorites</h4>
            {favorites.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">No favorites yet. Click "Save" on a clinic to add.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {favorites.map((id) => {
                  const c = clinics.find((x) => x._id === id) || clinics.find((x) => x.id === id);
                  if (!c) return null;
                  return (
                    <div key={id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.address}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => window.open(`tel:${c.phone || ""}`)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Call</button>
                        <button onClick={() => toggleFavorite(id)} className="px-2 py-1 bg-yellow-400 rounded text-xs">Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
}
