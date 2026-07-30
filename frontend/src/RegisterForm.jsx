import { useState } from "react";
import { registerUser } from "./api";

export default function RegisterForm({ onRegistered, onSwitchToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!avatar) {
      setError("Avatar image is required");
      return;
    }
    setLoading(true);
    try {
      await registerUser({ fullName, email, username, password, avatar });
      onRegistered();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Create account</h2>
      <label>
        Full name
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <label>
        Avatar
        <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </button>
      <p className="switch">
        Already have an account? <button type="button" className="link" onClick={onSwitchToLogin}>Log in</button>
      </p>
    </form>
  );
}
