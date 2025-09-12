import { useState } from "react";
import { signup } from "../services/auth";
import fetchMe from "../services/user";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [welcomeName, setWelcomeName] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup(email, password); // creates account + stores tokens
      const me = await fetchMe(); // verify & get username/email
      const name = me?.username || me?.email || "there";
      setWelcomeName(name);
    } catch (err) {
      setError(err.message || "Sign up failed");
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
          <legend className="fieldset-legend">Create account</legend>

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
            {loading ? "Creating…" : "Sign up"}
          </button>

          {error && (
            <div className="alert alert-error mt-3">
              <span>{error}</span>
            </div>
          )}
        </fieldset>
      </form>

      {welcomeName && (
        <div className="alert alert-success">
          <span>welcome {welcomeName}</span>
        </div>
      )}
    </div>
  );
}
