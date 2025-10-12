import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Building2, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StudentFields from "../../components/auth/StudentFields";
import OrgFields from "../../components/auth/OrgFields";

export default function SignUp() {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...formData, role });
    alert(`✅ Signed up as ${role}`);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>

        {/* Role toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              role === "student" ? "bg-[#C6E7FF] text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setRole("organization")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              role === "organization" ? "bg-[#C6E7FF] text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            Organization
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common fields */}
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-[#4bbeff] transition-colors">
            <User className="text-gray-400 mr-2" size={18} />
            <input type="text" name="name" placeholder="Full Name" className="w-full outline-none text-sm"
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-[#4bbeff] transition-colors">
            <Mail className="text-gray-400 mr-2" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full outline-none text-sm"
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-[#4bbeff] transition-colors">
            <Lock className="text-gray-400 mr-2" size={18} />
            <input 
              type="password" 
              name="password"
              placeholder="Password"
              className="w-full outline-none text-sm"
              onChange={handleChange}
              required
            />
          </div>

          {/* Dynamic fields */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {role === "student" ? (
                <StudentFields handleChange={handleChange} />
              ) : (
                <OrgFields handleChange={handleChange} />
              )}
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-[#4bbeff] hover:bg-[#3aa8e6] text-white py-3 rounded-lg font-medium transition-colors"
          >
            Create Account
          </motion.button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account?{" "}
          <span
            className="text-[#4bbeff] hover:text-[#3aa8e6] cursor-pointer font-medium "
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </motion.div>
    </div>
  );
}