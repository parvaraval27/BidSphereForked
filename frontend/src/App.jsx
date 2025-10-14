import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpPage from "./pages/Auth"; 
import Contact from "./pages/contact";
function App() {
  return (
    <div className="bg-[#fdfbf6] min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/otp" element={<OtpPage />} />
      </Routes>
    </div>
  );
}

export default App;
