import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { ButtonLoading } from "../components/Loading";
import Alert from "../components/Alert";
import { api } from "../services/index";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user types
    if (error) setError("");
  };

  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.post("/auth/forgot-password", { email });

      if (response.data?.success) {
        setMessage(
          response.data?.message ||
            "If an account with this email exists, a password reset link has been sent.",
        );
        setMessageType("success");
        setSubmitted(true);
        setEmail("");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err.response?.data?.message || "An error occurred. Please try again.",
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-dark">
      <div className="max-w-md w-full">
        <div className="card shadow-glow border-brand-orange/10 backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-orange/20">
              <Mail className="w-8 h-8 text-brand-orange" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Forgot Password
            </h2>
            <p className="text-brand-text-secondary mt-2">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <Alert
              type={messageType}
              message={message}
              onClose={() => setMessage("")}
            />
          )}

          {/* Success State */}
          {submitted ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-300 text-center">
                  ✓ Check your email for the password reset link. It will expire
                  in 15 minutes.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-brand-text-secondary text-center">
                  Didn't receive the email? Check your spam folder or request
                  another link.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessage("");
                  }}
                  className="w-full px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-medium rounded-lg transition-colors"
                >
                  Send Another Link
                </button>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-brand-text-secondary mb-2 ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-orange text-brand-text-muted">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`input pl-12 ${error ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? <ButtonLoading /> : "Send Reset Link"}
              </button>

              {/* Footer */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-brand-text-secondary hover:text-brand-orange transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
