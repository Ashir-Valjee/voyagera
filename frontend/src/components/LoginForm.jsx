import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth(); // Use our AuthContext login function

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Use the AuthContext login function
      await login(email, password);
      
      // Close the modal on successful login
      document.getElementById('my_modal_5').close();
      
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
    }
  }

  return (
    <div className="max-w-sm space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset className="fieldset bg-base-200/60 rounded-box p-4">
          <legend className="fieldset-legend">Sign in</legend>

          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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