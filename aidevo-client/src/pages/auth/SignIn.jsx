import React, { useState, useRef, useEffect } from "react";
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
  Target,
  Info
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

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
  const validationTimeout = useRef(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeout.current) {
        clearTimeout(validationTimeout.current);
      }
    };
  }, []);

  // Demo credentials helper
  const showDemoCredentials = () => {
    if (formData.userType === "student") {
      toast.success(
        <div className="text-center">
          <p className="font-semibold">Student Demo Format:</p>
          <p className="text-sm mt-1">200142.cse@student.just.edu.bd</p>
          <p className="text-xs text-gray-600 mt-1">Roll.Department@student.just.edu.bd</p>
        </div>,
        { 
          duration: 5000,
          icon: '🎓'
        }
      );
    } else {
      toast.success(
        <div className="text-center">
          <p className="font-semibold">Organization Demo Format:</p>
          <p className="text-sm mt-1">contact@yourorg.edu.bd</p>
          <p className="text-xs text-gray-600 mt-1">Use your organization email</p>
        </div>,
        { 
          duration: 5000,
          icon: '🏢'
        }
      );
    }
  };

  // Real-time email validation with toast
  const validateEmailInRealTime = (email) => {
    if (!email) return;

    if (formData.userType === "student") {
      const studentEmailRegex = /^\d+\.[a-z]+@student\.just\.edu\.bd$/;
      
      // Clear previous timeout
      if (validationTimeout.current) {
        clearTimeout(validationTimeout.current);
      }

      // Set new timeout for validation
      validationTimeout.current = setTimeout(() => {
        if (!studentEmailRegex.test(email)) {
          toast.error(
            <div>
              <p className="font-medium">Invalid Student Email Format</p>
              <p className="text-sm mt-1">Required: roll.dept@student.just.edu.bd</p>
              <p className="text-xs text-gray-300 mt-1">Example: 200142.cse@student.just.edu.bd</p>
            </div>,
            { 
              duration: 4000,
              id: 'email-validation' // Same ID to prevent multiple toasts
            }
          );
        } else {
          toast.success("✓ Valid student email format", { 
            duration: 2000,
            id: 'email-validation'
          });
        }
      }, 1000);
    }
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));
    
    if (error) setError("");
    
    // Real-time email validation
    validateEmailInRealTime(email);
  };

  const handlePasswordChange = (e) => {
    setFormData(prev => ({ ...prev, password: e.target.value }));
    if (error) setError("");
  };

  const handleUserTypeChange = (newType) => {
    setFormData(prev => ({ ...prev, userType: newType }));
    setError("");
    
    // Show toast for user type change
    toast.success(
      <div className="flex items-center gap-2">
        {newType === "student" ? (
          <>
            <User className="w-4 h-4" />
            <span>Switched to Student Sign In</span>
          </>
        ) : (
          <>
            <Users className="w-4 h-4" />
            <span>Switched to Organization Sign In</span>
          </>
        )}
      </div>,
      { duration: 2000 }
    );

    // Clear any existing email validation toasts
    toast.dismiss('email-validation');
  };

  const handleRememberMeChange = (e) => {
    const rememberMe = e.target.checked;
    setFormData(prev => ({ ...prev, rememberMe }));
    
    if (rememberMe) {
      toast.success("We'll remember you on this device", { 
        duration: 2000,
        icon: '🔐'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Clear any existing validation toasts
    toast.dismiss('email-validation');

    // Basic validation with toast
    if (!formData.email || !formData.password) {
      const errorMsg = "Please fill in all fields";
      setError(errorMsg);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Please fill in all required fields</span>
        </div>,
        { duration: 3000 }
      );
      setIsLoading(false);
      return;
    }

    // Email format validation based on user type
    if (formData.userType === "student") {
      const studentEmailRegex = /^\d+\.[a-z]+@student\.just\.edu\.bd$/;
      if (!studentEmailRegex.test(formData.email)) {
        const errorMsg = "Please use your student email: roll.dept@student.just.edu.bd";
        setError(errorMsg);
        toast.error(
          <div>
            <p className="font-medium">Invalid Student Email</p>
            <p className="text-sm mt-1">Format: roll.dept@student.just.edu.bd</p>
            <button 
              onClick={showDemoCredentials}
              className="text-xs text-cyan-300 underline mt-1 hover:text-cyan-200"
            >
              Show example format
            </button>
          </div>,
          { duration: 4000 }
        );
        setIsLoading(false);
        return;
      }
    }

    try {
      // Show loading toast with user type context
      const loadingToast = toast.loading(
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>
            Signing in as {formData.userType === 'student' ? 'Student' : 'Organization'}...
          </span>
        </div>,
        { duration: Infinity }
      );

      // Attempt sign in
      await signInUser(formData.email, formData.password);
      
      // Update loading toast to success
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <p className="font-semibold">Welcome back!</p>
            <p className="text-sm">
              {formData.userType === 'student' ? 'Student' : 'Organization'} account verified
            </p>
          </div>
        </div>,
        { 
          id: loadingToast,
          duration: 3000 
        }
      );
      
      setSuccess("Successfully signed in! Redirecting...");
      
      // Store remember me preference with toast feedback
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userType', formData.userType);
        toast.success("Remember me enabled for future sessions", { 
          duration: 2000,
          icon: '💾'
        });
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userType');
      }
      
      // Show redirecting toast
      toast.loading("Redirecting to dashboard...", { duration: 1000 });
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
      
    } catch (error) {
      console.error("Error signing in:", error);
      
      let errorMessage = "Failed to sign in. Please check your credentials and try again.";
      let toastDuration = 4000;
      
      // Handle specific Firebase auth errors with detailed toasts
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Invalid email address format";
          toast.error(
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Please check your email format</span>
            </div>,
            { duration: toastDuration }
          );
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email";
          toast.error(
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <div>
                <p className="font-medium">Account not found</p>
                <p className="text-sm">Please check your email or create an account</p>
              </div>
            </div>,
            { duration: toastDuration }
          );
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          toast.error(
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <div>
                <p className="font-medium">Incorrect Password</p>
                <p className="text-sm">Please check your password and try again</p>
              </div>
            </div>,
            { duration: toastDuration }
          );
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          toast.error(
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <div>
                <p className="font-medium">Too Many Attempts</p>
                <p className="text-sm">Account temporarily locked. Try again later.</p>
              </div>
            </div>,
            { duration: 5000 }
          );
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled. Please contact support.";
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <div>
                <p className="font-medium">Account Disabled</p>
                <p className="text-sm">Please contact support for assistance</p>
              </div>
            </div>,
            { duration: 5000 }
          );
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection.";
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <div>
                <p className="font-medium">Network Error</p>
                <p className="text-sm">Please check your internet connection</p>
              </div>
            </div>,
            { duration: 4000 }
          );
          break;
        default:
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <div>
                <p className="font-medium">Sign In Failed</p>
                <p className="text-sm">Please check your credentials</p>
              </div>
            </div>,
            { duration: toastDuration }
          );
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password with toast
  const handleForgotPassword = () => {
    toast.loading("Redirecting to password recovery...", { duration: 1500 });
    // The Link component will handle the actual navigation
  };

  // Handle sign up navigation with toast
  const handleSignUpNavigation = () => {
    toast.loading("Redirecting to sign up...", { duration: 1000 });
  };

  return (
    <div className="min-h-screen mt-10 flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl relative"
      >
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
              onClick={() => handleUserTypeChange(value)}
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
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Format: roll.dept@student.just.edu.bd
                </p>
                <button
                  type="button"
                  onClick={showDemoCredentials}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  See example
                </button>
              </div>
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
                onClick={handleForgotPassword}
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
                onClick={() => {
                  setShowPassword(!showPassword);
                  toast.success(showPassword ? "Password hidden" : "Password visible", { 
                    duration: 1500 
                  });
                }}
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
                  onChange={handleRememberMeChange}
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
              onClick={handleSignUpNavigation}
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
          <div className="text-center">
            <p className="text-xs text-blue-700 font-medium mb-2">
              <span className="bg-blue-100 px-2 py-1 rounded-lg">💡 Need help?</span>
            </p>
            <button
              type="button"
              onClick={showDemoCredentials}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium underline transition-colors flex items-center gap-1 mx-auto"
            >
              <Info className="w-3 h-3" />
              Show email format examples
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignIn;