import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Building2, Mail, Lock, Calendar, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";

export default function SignUp() {
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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
    campus: "",
    mission: "",
    studentId: "",
    department: ""
  });

  const { createUser, updateProfileUser } = useAuth();
  const navigate = useNavigate();

  const orgTypes = ["Club", "NGO", "Department", "Community", "Society", "Association"];
  const campuses = ["Main Campus", "North Campus", "South Campus", "City Campus", "Online"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUser(formData.email, formData.password);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        role: role,
        createdAt: new Date().toISOString(),
        ...(role === 'organization' ? {
          organization: {
            name: formData.orgName,
            type: formData.orgType,
            tagline: formData.tagline,
            founded: formData.founded,
            website: formData.website,
            phone: formData.phone,
            campus: formData.campus,
            mission: formData.mission,
            membershipCount: 0,
            status: 'active'
          }
        } : {
          student: {
            studentId: formData.studentId,
            department: formData.department,
            year: new Date().getFullYear(),
            status: 'active'
          }
        })
      };

      // 3. Save user data to MongoDB
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save user data');
      }

      // 4. Update Firebase profile with display name
      await updateProfileUser({
        displayName: formData.name,
        photoURL: role === 'organization' 
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.orgName)}&background=4bbeff&color=fff`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=4bbeff&color=fff`
      });

      // 5. Success - redirect to appropriate page
      console.log("User created successfully:", userData);
      
      // Redirect based on role
      if (role === 'organization') {
        navigate('/organization/profile');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Role Selection */}
        <div className="flex bg-gray-100 rounded-xl p-2 mb-8">
          <button
            onClick={() => setRole("student")}
            disabled={loading}
            className={`flex-1 py-4 rounded-lg text-base font-semibold transition-all flex items-center justify-center space-x-2 ${
              role === "student" 
                ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
                : "text-gray-600 hover:text-gray-800"
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <User size={18} />
            <span>Student</span>
          </button>
          <button
            onClick={() => setRole("organization")}
            disabled={loading}
            className={`flex-1 py-4 rounded-lg text-base font-semibold transition-all flex items-center justify-center space-x-2 ${
              role === "organization" 
                ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
                : "text-gray-600 hover:text-gray-800"
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Building2 size={18} />
            <span>Organization</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {role === 'organization' ? 'Contact Person Name' : 'Full Name'} *
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <User className="text-gray-400 mr-3" size={18} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={role === 'organization' ? "John Doe" : "Your full name"}
                  className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  disabled={loading}
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
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@university.edu"
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  disabled={loading}
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
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Create a strong password (min. 6 characters)"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Dynamic Fields */}
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
                          value={formData.orgName}
                          onChange={(e) => setFormData(prev => ({ ...prev, orgName: e.target.value }))}
                          placeholder="Photographic Society"
                          className="w-full outline-none text-gray-700 placeholder-gray-400"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Organization Type *</label>
                      <select
                        value={formData.orgType}
                        onChange={(e) => setFormData(prev => ({ ...prev, orgType: e.target.value }))}
                        disabled={loading}
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
                      value={formData.tagline}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Brief description of your organization"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Founded Date</label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Calendar className="text-gray-400 mr-3" size={18} />
                        <input
                          type="date"
                          value={formData.founded}
                          onChange={(e) => setFormData(prev => ({ ...prev, founded: e.target.value }))}
                          className="w-full outline-none text-gray-700"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Campus</label>
                      <select
                        value={formData.campus}
                        onChange={(e) => setFormData(prev => ({ ...prev, campus: e.target.value }))}
                        disabled={loading}
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
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Website</label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Globe className="text-gray-400 mr-3" size={18} />
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://your-organization.edu"
                          className="w-full outline-none text-gray-700 placeholder-gray-400"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mission Statement</label>
                    <textarea
                      value={formData.mission}
                      onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                      placeholder="Describe your organization's mission and purpose..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none h-24 placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Student ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                      placeholder="STU-2024-001"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Computer Science"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create {role === 'organization' ? 'Organization' : 'Student'} Account</span>
            )}
          </motion.button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/signin")}
            disabled={loading}
            className="text-blue-500 hover:text-blue-600 font-semibold transition-colors disabled:opacity-50"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}
