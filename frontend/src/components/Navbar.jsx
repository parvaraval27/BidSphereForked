import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../api"; 
import { logoutAdmin } from "../api/index";

function Navbar() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  //Load from local storage if data is already available
  const loadAuthFromStorage = () => {
    try {
      const storedUser = localStorage.getItem("bidsphere_user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {setUser(null);}
    try {
      const storedAdmin = localStorage.getItem("bidsphere_admin");
      setAdmin(storedAdmin ? JSON.parse(storedAdmin) : null);
    } catch {setAdmin(null);}
  };

  useEffect(() => {
    loadAuthFromStorage();
  }, [location]);

  const handleUserLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout API failed", e);
    }
    localStorage.removeItem("bidsphere_user");
    setUser(null);
    navigate("/login");
  };

  const handleAdminLogout = async () => {
    try {
      if (admin) {
        await logoutAdmin();
      }
    } catch (e) {
      console.warn("Admin logout API failed", e);
    }
    localStorage.removeItem("bidsphere_admin");
    setAdmin(null);
    navigate("/admin/login");
  };

  return (
    <nav className="flex items-center justify-between bg-yellow-500 px-6 py-3">
      <div className="text-2xl font-bold">
        BID<span className="text-black">SPHERE</span>
      </div>

      <input
        type="text"
        placeholder="What are you looking for?"
        className="px-3 py-2 rounded-md w-72"
      />

      <ul className="flex space-x-6 font-medium">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/categories">Categories</Link></li>
        <li><Link to="/contact">Contact</Link></li>

        {!user && !admin && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li>
              <Link to="/register" className="bg-white px-3 py-1 rounded-md">
                Register
              </Link>
            </li>
          </>
        )}

        {user && (
          <>
            <li>Hello, <span className="font-semibold">{user.username}</span></li>
            <li>
              <button onClick={handleUserLogout} className="bg-white px-3 py-1 rounded-md">
                Logout
              </button>
            </li>
          </>
        )}

        {admin && (
          <>
            <li>Hello Admin</li>
            <li>
              <button onClick={handleAdminLogout} className="bg-white px-3 py-1 rounded-md">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
