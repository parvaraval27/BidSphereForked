import React, { useState } from "react";
import loginImg from "../assets/login.jpg";
import { Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();


    if (!form.email || !form.password || !form.role) {
      alert("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    alert("Logged in successfully!");
    setForm({ email: "", password: "", role: "", remember: false });
  };

  return (
    <div className="flex p-10 items-center justify-center">
      
      <div className="w-1/2">
        <img src={loginImg} alt="Login Banner" className="rounded-lg" />
      </div>

     
      <div className="w-1/2 pl-12">
        <h2 className="text-3xl font-bold mb-6">Log in</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-4"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-4"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-4"
          >
            <option value="">Select Role</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              className="mr-2"
            />
            Remember Me
          </div>

          <button
            type="submit"
            className="bg-red-500 text-white px-6 py-2 rounded w-full mb-3"
          >
            Log In
          </button>
        </form>

        <p className="text-sm text-red-600 mb-2 cursor-pointer">
          Forgot Password?
        </p>
        <p>
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
