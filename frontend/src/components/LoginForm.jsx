import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


export default function LoginForm({ onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth(); // Use our AuthContext login function

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use the AuthContext login function
      await login(email, password);
      
      // Close the modal on successful login
      document.getElementById('login_modal').close();
      console.log("Login success");

      // Update navbar login state
      if (onLogin) onLogin();

      setEmail("");
      setPassword("");

      // Close modal
      const modal = document.getElementById("login_modal");
      if (modal) modal.close();

      if (onClose) onClose();

      // Navigate to homepage
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset className="fieldset bg-base-200/60 rounded-box p-4 relative">
          <h3 className="text-5xl md:text-2xl font-bold text-black drop-shadow-lg mb-4">
            Sign in
          </h3>

          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className={`btn btn-primary mt-4 ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {error && (
            <div className="alert alert-error mt-3">
              <span>{error}</span>
            </div>
          )}
        </fieldset>
      </form>
    </div>
  );
}