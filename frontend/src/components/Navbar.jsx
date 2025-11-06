import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser, getCurrentUser } from "../api"; 
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
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // if parsing fails, store raw string
          setUser(storedUser);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      // defensive: try sessionStorage as a fallback
      try {
        const s = sessionStorage.getItem("bidsphere_user");
        setUser(s ? JSON.parse(s) : null);
      } catch {
        setUser(null);
      }
    }
    try {
      const storedAdmin = localStorage.getItem("bidsphere_admin");
      setAdmin(storedAdmin ? JSON.parse(storedAdmin) : null);
    } catch {setAdmin(null);}
  };

  useEffect(() => {
    // try to get authoritative user from backend first
    let mounted = true;
    (async () => {
      try {
        const res = await getCurrentUser();
        if (!mounted) return;
        if (res?.user) {
          setUser(res.user);
          // mirror into localStorage for compatibility with other flows
          try { localStorage.setItem("bidsphere_user", JSON.stringify(res.user)); } catch {}
          return;
        }
      } catch (err) {
        // ignore and fallback to storage
      }
      loadAuthFromStorage();
    })();
    return () => { mounted = false; };
  }, [location]);

  // listen to storage events so navbar updates when auth changes in other tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "bidsphere_user") loadAuthFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
        <li><Link to='/create-auction'>Create Auction</Link></li>

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
            <li><Link to="/dashboard">Dashboard</Link></li>
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
