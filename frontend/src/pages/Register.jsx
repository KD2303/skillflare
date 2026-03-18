import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  UserPlus,
  GraduationCap,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { ButtonLoading } from "../components/Loading";
import {
  getRoleFromEmail,
  isAllowedEmailDomain,
  isEmailDomainRestricted,
} from "../utils/helpers";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const detectedRole = useMemo(
    () => getRoleFromEmail(formData.email),
    [formData.email],
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isSubmittingRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    } else if (
      isEmailDomainRestricted() &&
      !isAllowedEmailDomain(formData.email)
    ) {
      newErrors.email =
        "Only @mitsgwalior.in (Faculty) and @mitsgwl.ac.in (Student) emails are allowed";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!validateForm()) return;

    try {
      isSubmittingRef.current = true;
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: detectedRole,
      });
      navigate("/dashboard");
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      isSubmittingRef.current = false;
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
              <UserPlus className="w-8 h-8 text-brand-orange" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-brand-text-secondary mt-2">
              Join SkillFlare and start collaborating
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-brand-text-secondary mb-2 ml-1"
              >
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-orange text-brand-text-muted">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input pl-12 ${errors.name ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs font-medium text-red-400 ml-1">
                  {errors.name}
                </p>
              )}
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-12 ${errors.email ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                  placeholder="you@mits.ac.in"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-red-400 ml-1">
                  {errors.email}
                </p>
              )}
              {/* Auto-detected Role Badge */}
              {formData.email && !errors.email && detectedRole && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-orange/10 border border-brand-orange/20">
                  <ShieldCheck className="w-4 h-4 text-brand-orange" />
                  <span className="text-sm text-brand-orange font-medium">
                    Role detected:{" "}
                    <span className="font-bold uppercase">
                      {detectedRole === "teacher" ? "Faculty" : "Student"}
                    </span>
                  </span>
                </div>
              )}
              {formData.email &&
                !errors.email &&
                isEmailDomainRestricted() &&
                !detectedRole &&
                formData.email.includes("@") && (
                  <p className="mt-1.5 text-xs font-medium text-yellow-400 ml-1">
                    Use @mitsgwalior.in (Faculty) or @mitsgwl.ac.in (Student)
                  </p>
                )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-brand-text-secondary mb-2 ml-1"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-orange text-brand-text-muted">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-12 pr-10 ${errors.password ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-text-muted hover:text-brand-orange transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-red-400 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-brand-text-secondary mb-2 ml-1"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-orange text-brand-text-muted">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-12 ${errors.confirmPassword ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs font-medium text-red-400 ml-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 font-bold shadow-glow"
            >
              {loading ? <ButtonLoading /> : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center pt-6 border-t border-brand-border/50">
            <p className="text-brand-text-secondary">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand-orange font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
