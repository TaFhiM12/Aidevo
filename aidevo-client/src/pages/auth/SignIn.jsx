import React, { useState } from "react";
import { Mail, Lock, LogIn, Eye, EyeOff, User, Building2, Smartphone } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "student",
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Sign In data:", formData);
      setIsLoading(false);
      // TODO: Add backend login logic later
    }, 1500);
  };

  const InputField = ({ label, icon: Icon, type, name, value, onChange, placeholder, required = true }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white placeholder-gray-400"
        />
        {name === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-8 mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {/* User Type Selection */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { value: "student", label: "Student", icon: User },
            { value: "organization", label: "Organization", icon: Building2 }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: value }))}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                formData.userType === value 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <InputField
            label="Email Address"
            icon={Mail}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@university.edu"
          />

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#4bbeff] hover:text-[#3aa8e6] font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white placeholder-gray-400"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-[#4bbeff] focus:ring-[#4bbeff] border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] hover:from-[#3aa8e6] hover:to-[#2b96d4] disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </motion.button>

          {/* Demo Credentials */}
         
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#4bbeff] hover:text-[#3aa8e6] font-semibold transition-colors inline-flex items-center gap-1"
            >
              Create account
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;