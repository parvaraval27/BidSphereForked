import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
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
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register" className="bg-white px-3 py-1 rounded-md">Register</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
