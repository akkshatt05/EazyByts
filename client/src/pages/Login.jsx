import { useState } from "react";
import API from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      window.location.href = "/dashboard";
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">
          🔐
        </div>

        <h1>Admin Login</h1>

        <p className="login-subtitle">
          Sign in to manage your portfolio
        </p>

        <form onSubmit={handleLogin} className="login-form">

          <div className="login-form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMessage("");
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          {message && (
            <div className="login-error">
              {message}
            </div>
          )}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <a href="/" className="back-home-link">
          ← Back to Portfolio
        </a>

      </div>
    </div>
  );
}

export default Login;