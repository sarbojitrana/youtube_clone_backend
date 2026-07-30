import { useState } from "react";
import { loginUser } from "./api";

export default function LoginForm({ onLoggedIn, onSwitchToRegister }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ identifier, password });
      onLoggedIn(data.data.user, data.data.accessToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Log in</h2>
      <label>
        Username or email
        <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </button>
      <p className="switch">
        Need an account? <button type="button" className="link" onClick={onSwitchToRegister}>Register</button>
      </p>
    </form>
  );
}
