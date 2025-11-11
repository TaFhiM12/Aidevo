import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff, 
  User, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  Shield,
  Users,
  Target
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from '../../hooks/useAuth';

const SignIn = () => {
  const { signInUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "student",
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Email format validation based on user type
    if (formData.userType === "student") {
      const studentEmailRegex = /^\d+\.[a-z]+@student\.just\.edu\.bd$/;
      if (!studentEmailRegex.test(formData.email)) {
        setError("Please use your student email: roll.dept@student.just.edu.bd");
        setIsLoading(false);
        return;
      }
    }

    try {
      await signInUser(formData.email, formData.password);
      setSuccess("Successfully signed in! Redirecting...");
      
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
      
    } catch (error) {
      console.error("Error signing in:", error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/invalid-email':
          setError("Invalid email address format");
          break;
        case 'auth/user-not-found':
          setError("No account found with this email");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Please try again later.");
          break;
        case 'auth/user-disabled':
          setError("This account has been disabled. Please contact support.");
          break;
        default:
          setError("Failed to sign in. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setFormData(prev => ({ ...prev, password: e.target.value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen mt-10 flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl relative"
      >
        {/* Header with Gradient Border */}
        {/* <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"> */}
          {/* <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1 rounded-2xl shadow-lg">
            <div className="bg-white rounded-xl p-3">
              <LogIn className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div> */}

        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3"
          >
            Welcome Back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-lg"
          >
            Sign in to continue your campus journey
          </motion.p>
        </div>

        {/* User Type Selection - Card Style */}
        <motion.div 
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { value: "student", label: "Student", icon: User, description: "Student account" },
            { value: "organization", label: "Organization", icon: Users, description: "Organization account" }
          ].map(({ value, label, icon: Icon, description }) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={() => {
                setFormData(prev => ({ ...prev, userType: value }));
                setError("");
              }}
              disabled={isLoading}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                formData.userType === value 
                  ? "border-blue-500 bg-blue-50/50 shadow-lg" 
                  : "border-gray-200 bg-white/50 hover:border-blue-300 hover:bg-blue-50/30"
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  formData.userType === value 
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <Icon size={16} />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${
                    formData.userType === value ? "text-blue-600" : "text-gray-700"
                  }`}>
                    {label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <span className="font-medium text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium text-sm">{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                required
                placeholder={
                  formData.userType === "student" 
                    ? "200142.cse@student.just.edu.bd"
                    : "contact@organization.edu"
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-4 bg-white/80 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700 font-medium"
                disabled={isLoading}
              />
            </div>
            {formData.userType === "student" && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Format: roll.dept@student.just.edu.bd
              </p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handlePasswordChange}
                required
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-xl px-4 py-4 bg-white/80 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700 font-medium pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          {/* Remember Me */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="w-5 h-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded-xl disabled:opacity-50 cursor-pointer transition-all duration-200"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 bg-blue-500/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-200"></div>
              </div>
              <span className="text-sm text-gray-700 font-medium">Remember me</span>
            </label>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl disabled:shadow-none flex items-center justify-center gap-3 group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="w-6 h-6" />
                <span>Sign In</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Sign Up Link */}
        <motion.div 
          className="text-center mt-8 pt-6 border-t border-gray-200/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-500 hover:text-blue-600 font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-1 group"
            >
              Create account
              <motion.svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </Link>
          </p>
        </motion.div>

        {/* Demo Credentials Hint */}
        <motion.div 
          className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-blue-700 text-center font-medium">
            <span className="bg-blue-100 px-2 py-1 rounded-lg">Demo:</span> Use your registered email and password to sign in
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignIn;