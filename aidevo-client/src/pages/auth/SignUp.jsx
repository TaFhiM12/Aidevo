import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Building2, Mail, Lock, MapPin, Users, Calendar, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignUp() {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    orgName: "",
    orgType: "",
    tagline: "",
    founded: "",
    website: "",
    phone: "",
    address: "",
    campus: "",
    mission: "",
    president: "",
    facultyAdvisor: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...formData, role });
    alert(`✅ ${role === 'organization' ? 'Organization' : 'Student'} account created successfully!`);
    navigate("/login");
  };

  const orgTypes = ["Club", "NGO", "Department", "Community", "Society", "Association"];
  const campuses = ["Main Campus", "North Campus", "South Campus", "City Campus", "Online"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 py-8 mt-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join our university community</p>
        </div>

        {/* Role toggle */}
        <div className="flex bg-gray-100 rounded-xl p-2 mb-8">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 py-4 rounded-lg text-base font-semibold transition-all flex items-center justify-center space-x-2 ${
              role === "student" 
                ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <User size={18} />
            <span>Student</span>
          </button>
          <button
            onClick={() => setRole("organization")}
            className={`flex-1 py-4 rounded-lg text-base font-semibold transition-all flex items-center justify-center space-x-2 ${
              role === "organization" 
                ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Building2 size={18} />
            <span>Organization</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {role === 'organization' ? 'Contact Person Name' : 'Full Name'} *
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <User className="text-gray-400 mr-3" size={18} />
                <input 
                  type="text" 
                  name="name" 
                  placeholder={role === 'organization' ? "John Doe" : "Your full name"}
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address *</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Mail className="text-gray-400 mr-3" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@university.edu"
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password *</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Lock className="text-gray-400 mr-3" size={18} />
              <input 
                type="password" 
                name="password"
                placeholder="Create a strong password"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Dynamic fields */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {role === "organization" ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Organization Name *</label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Building2 className="text-gray-400 mr-3" size={18} />
                        <input
                          type="text"
                          name="orgName"
                          placeholder="Photographic Society"
                          className="w-full outline-none text-gray-700 placeholder-gray-400"
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Organization Type *</label>
                      <select
                        name="orgType"
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        required
                      >
                        <option value="">Select Type</option>
                        {orgTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tagline</label>
                    <input
                      type="text"
                      name="tagline"
                      placeholder="Brief description of your organization"
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Founded Date</label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Calendar className="text-gray-400 mr-3" size={18} />
                        <input
                          type="date"
                          name="founded"
                          className="w-full outline-none text-gray-700"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Campus</label>
                      <select
                        name="campus"
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      >
                        <option value="">Select Campus</option>
                        {campuses.map(campus => (
                          <option key={campus} value={campus}>{campus}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Users className="text-gray-400 mr-3" size={18} />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+1 (555) 123-4567"
                          className="w-full outline-none text-gray-700 placeholder-gray-400"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Website</label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Globe className="text-gray-400 mr-3" size={18} />
                        <input
                          type="url"
                          name="website"
                          placeholder="https://your-organization.edu"
                          className="w-full outline-none text-gray-700 placeholder-gray-400"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mission Statement</label>
                    <textarea
                      name="mission"
                      placeholder="Describe your organization's mission and purpose..."
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none h-24 placeholder-gray-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      placeholder="STU-2024-001"
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      placeholder="Computer Science"
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Create {role === 'organization' ? 'Organization' : 'Student'} Account
          </motion.button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <span
            className="text-blue-500 hover:text-blue-600 cursor-pointer font-semibold"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </motion.div>
    </div>
  );
}