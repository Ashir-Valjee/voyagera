import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/auth"; 
import BackgroundImage from "../assets/signup_background.jpg";
import './SignUp.css';

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
    // 1. Signup
    const { access, refresh } = await signup(email, password);
    console.log("Signup success:", { access, refresh });


    // 2. Save user email
    if (access) localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
    localStorage.setItem("userName", email);

    window.dispatchEvent(new Event("storage"));

    // 3. Redirect to the home page
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
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
      
      <h1 className="absolute top-8 left-8 text-5xl font-bold text-white drop-shadow-lg">
        Welcome!
      </h1>

      {/* Form card */}
      <div className="max-w-lg w-full space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <fieldset className="fieldset bg-base-200/60 rounded-box p-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
              Create Account
            </h2>

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
