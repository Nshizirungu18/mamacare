import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Navbar = () => {
  const { logout, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const privateLinks = useMemo(
    () => [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Community", path: "/community" },
      { name: "Wellness", path: "/wellness" },
      { name: "Reminders", path: "/reminders" },
      { name: "Clinics", path: "/clinics" },
      { name: "Profile", path: "/profile" },
    ],
    []
  );

  const publicLinks = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "Clinics", path: "/clinics" },
      { name: "Login", path: "/login" },
      { name: "Register", path: "/register" },
    ],
    []
  );

  const links = isAuthenticated ? privateLinks : publicLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const shouldHideLogout = !isAuthenticated;

  return (
    <nav className="bg-blue-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
            MamaCare
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {links.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`hover:text-gray-200 transition ${
                  location.pathname === link.path ? "underline" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
            {!shouldHideLogout && (
              <button
                onClick={handleLogout}
                className="ml-4 bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-600 px-4 pt-2 pb-4 space-y-1">
          {links.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-2 py-1 rounded hover:bg-blue-500 transition ${
                location.pathname === link.path ? "underline" : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {!shouldHideLogout && (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full bg-red-500 px-3 py-2 rounded hover:bg-red-600 transition mt-2"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
