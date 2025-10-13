// frontend/src/pages/Register.js
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Register({ setUser }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
  const [rememberMe, setRememberMe] = useState(true); // you may want default true or false
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("/register", { ...formData, rememberMe })
      .then(res => {
        setUser(res.data.user);
        navigate("/");
      })
      .catch(err => {
        console.error(err.response?.data || err.message);
        setMessage(err.response?.data?.message || "Registration failed");
      });
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <br/>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <br/>
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <br/>
        {/* Role should be 'user' by default, keep admin registration controlled */}
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option> {/* If you allow admin self-register, be careful in prod */}
        </select>
        <br/>
        <label>
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /> Remember Me
        </label>
        <br/>
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Register;
