import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 
import BackgroundImage from "../assets/signup_background.jpg";
import './SignUp.css';

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { signup } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signup(email, password);
      navigate("/profile");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      >
        <img 
        src={BackgroundImage} 
        alt="Signup Background" 
        className="signup-background"
      />

      {/* Form card */}
      <div className="max-w-2xl w-full space-y-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <fieldset className="fieldset bg-base-200/60 backdrop-blur-md rounded-2xl p-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg text-center mb-6">
              Create Account
            </h2>

            <label className="label">
              <span className="label-text text-lg md:text-xl">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full input-lg"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="label mt-4">
              <span className="label-text text-lg md:text-xl">Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full input-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className={`btn btn-primary mt-6 ${loading ? "loading" : ""}`}
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
      </div>
    </div>
  );
}
