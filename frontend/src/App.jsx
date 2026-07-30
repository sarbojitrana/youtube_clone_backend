import { useEffect, useState } from "react";
import { fetchCurrentUser, logoutUser } from "./api";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Dashboard from "./Dashboard";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken") || "");
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentUser(token)
      .then((data) => setUser(data.data))
      .catch(() => {
        localStorage.removeItem("accessToken");
        setToken("");
      })
      .finally(() => setLoading(false));
  }, [token]);

  function handleLoggedIn(loggedInUser, accessToken) {
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setUser(loggedInUser);
  }

  async function handleLogout() {
    try {
      await logoutUser(token);
    } catch {
      // ignore, clear client state regardless
    }
    localStorage.removeItem("accessToken");
    setToken("");
    setUser(null);
    setView("login");
  }

  return (
    <div className="app">
      <h1>StreamHub</h1>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : view === "login" ? (
        <LoginForm onLoggedIn={handleLoggedIn} onSwitchToRegister={() => setView("register")} />
      ) : (
        <RegisterForm
          onRegistered={() => setView("login")}
          onSwitchToLogin={() => setView("login")}
        />
      )}
    </div>
  );
}
