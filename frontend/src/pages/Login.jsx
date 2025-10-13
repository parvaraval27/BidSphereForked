// frontend/src/pages/Login.js
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("/login", { ...form, rememberMe })
      .then(res => {
        setUser(res.data.user); // user returned from server
        if (res.data.user.role === "admin") navigate("/admin");
        else navigate("/");
      })
      .catch(err => {
        console.error(err.response?.data || err.message);
        alert("Login failed: " + (err.response?.data?.message || err.message));
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} value={form.email} required />
        <br/>
        <input name="password" type="password" placeholder="Password" onChange={handleChange} value={form.password} required />
        <br/>
        <label>
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /> Remember Me
        </label>
        <br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
