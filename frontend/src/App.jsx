// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import api from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New: show loading until /me resolves

  useEffect(() => {
    // Auto-login using cookie if present
    api.get("/me", { withCredentials: true }) // make sure your api.js has withCredentials or pass here
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false)); // stop loading
  }, []);

  const handleLogout = () => {
    api.post("/logout", {}, { withCredentials: true })
      .then(() => setUser(null))
      .catch(() => setUser(null));
  };

  if (loading) {
    // Show a simple loading screen while checking auth
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <>
      <nav style={{ padding: "10px", background: "#f4f4f4" }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>

        {!user && (
          <>
            <Link to="/login" style={{ marginRight: 10 }}>Login</Link>
            <Link to="/register" style={{ marginRight: 10 }}>Register</Link>
          </>
        )}

        {user && user.role === "admin" && (
          <Link to="/admin" style={{ marginRight: 10 }}>Admin Dashboard</Link>
        )}

        {user && <button onClick={handleLogout} style={{ marginLeft: 10 }}>Logout</button>}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} />
        <Route path="/admin" element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
