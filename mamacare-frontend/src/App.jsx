import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wellness from "./pages/Wellness";
import Reminders from "./pages/Reminders";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar.jsx";
import Clinics from "./pages/Clinics";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/wellness"
          element={
            <PrivateRoute>
              <Wellness />
            </PrivateRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <PrivateRoute>
              <Reminders />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/clinics" element={<Clinics />} />
      </Routes>
    </Router>
  );
}

export default App;
