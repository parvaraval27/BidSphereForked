import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyMail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import CreateAuction from "./pages/CreateAuction";
import EditAuctionDraft from "./pages/EditAuctionDraft";
import AuctionDetails from "./pages/AuctionDetails";
import BidHistory from "./pages/BidHistory";
import Auctions from "./pages/Auctions";
import UserDashboard from "./pages/UserDashboard";
import MyListings from "./pages/MyListings";

import RegistrationFee from "./pages/RegistrationFee";
import UserDashboardBuyer from "./pages/UserDashboardBuyer";
import Contact from "./pages/contact";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <div className="bg-[#fdfbf6] min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:name" element={<Home />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/verifyemail" element={<VerifyEmail />} />
        <Route path="/create-auction" element={<CreateAuction />} />
        <Route path="/auction/:id" element={<AuctionDetails />} />
        <Route path="/auction/:id/bid-history" element={<BidHistory />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/my-listings" element={<MyListings />} />

        <Route path="/registration-fee" element={<RegistrationFee />} />
        <Route path="/registration-fee/:auctionId" element={<RegistrationFee />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/edit-auction-draft/:id" element={<EditAuctionDraft />} />
        <Route path="/buyer/dashboard" element={<UserDashboardBuyer />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
