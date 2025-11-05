import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyMail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import CreateAuction from "./pages/CreateAuction";
import EditAuctionDraft from "./pages/EditAuctionDraft";


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
        <Route path="/verifyemail" element={<VerifyEmail />} />
        <Route path="/create-auction" element={<CreateAuction />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/edit-auction-draft/:id" element={<EditAuctionDraft />} />
      </Routes>
    </div>
  );
}

export default App;
