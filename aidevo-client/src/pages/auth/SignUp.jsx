import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Building2,
  Mail,
  Lock,
  Calendar,
  Globe,
  Upload,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  GraduationCap,
  Shield,
  Users,
  Target,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import toast from "react-hot-toast";
import API from "../../utils/api";

export default function SignUp() {
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    orgType: "",
    roleType: "", // New field added
    tagline: "",
    founded: "",
    website: "",
    phone: "",
    campus: "",
    mission: "",
    studentId: "",
    department: "",
    session: "",
    interests: "",
  });

  const {
    createUser,
    updateProfileUser,
    setLoading: setAuthLoading,
  } = useAuth();
  const navigate = useNavigate();

  const orgTypes = [
    "Club",
    "Social Service",
    "Association",
  ];
  
  // Role types configuration
  const roleTypes = {
    "Club": [
      "Debate Club",
      "Sports Club", 
      "Robotics Club",
      "Photographic Club",
      "Cultural Club",
      "Programming Club",
      "Music Club",
      "Drama Club",
      "Art Club",
      "Literature Club"
    ],
    "Social Service": [
      "Blood Bank",
      "Unnotomomoshir",
      "Community Service",
      "Environmental Service",
      "Educational Support",
      "Disaster Relief",
      "Health Awareness",
      "Poverty Alleviation"
    ],
    "Association": [
      "Sylhet Association",
      "Dhaka Association", 
      "Khulna Association",
      "Chittagong Association",
      "Rajshahi Association",
      "Barisal Association",
      "Rangpur Association",
      "Mymensingh Association"
    ]
  };

  const campuses = [
    "Main Campus",
    "North Campus",
    "South Campus",
    "City Campus",
    "Online",
  ];

  const departments = [
    { name: "Computer Science and Engineering", code: "cse" },
    { name: "Electrical and Electronic Engineering", code: "eee" },
    { name: "Industrial and Production Engineering", code: "ipe" },
    { name: "Petroleum and Mining Engineering", code: "pme" },
    { name: "Chemical Engineering", code: "che" },
    { name: "Biomedical Engineering", code: "bme" },
    { name: "Textile Engineering", code: "te" },
    { name: "Microbiology", code: "mb" },
    { name: "Fisheries and Marine Bioscience", code: "fmb" },
    { name: "Genetic Engineering and Biotechnology", code: "gebt" },
    { name: "Pharmacy", code: "phar" },
    { name: "Biochemistry and Molecular Biology", code: "bmb" },
    { name: "Environmental Science and Technology", code: "est" },
    { name: "Nutrition and Food Technology", code: "nft" },
    { name: "Food Engineering", code: "fmb" },
    { name: "Climate and Disaster Management", code: "cdm" },
    { name: "Physical Education and Sports Science", code: "pess" },
    { name: "Physiotherapy and Rehabilitation", code: "ptr" },
    { name: "Nursing and Health Science", code: "nhs" },
    { name: "English", code: "eng" },
    { name: "Physics", code: "phy" },
    { name: "Chemistry", code: "chem" },
    { name: "Mathematics", code: "math" },
    { name: "Applied Statistics and Data Science", code: "asd" },
    { name: "Accounting and Information Systems", code: "ais" },
    { name: "Management", code: "mgt" },
    { name: "Finance and Banking", code: "fb" },
    { name: "Marketing", code: "mkt" },
  ];

  const sessions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return `${year}-${year + 1}`;
  });

  const interestsOptions = [
    "Charity & Volunteering",
    "Clubs & Societies",
    "Associations",
    "Sports & Athletics",
    "Cultural Activities",
    "Technical & Coding",
    "Research & Innovation",
    "Entrepreneurship",
    "Arts & Creativity",
    "Leadership & Development",
    "Community Service",
    "Environmental Causes",
    "Education & Tutoring",
    "Professional Development",
    "Social Events",
  ];

  // Handle photo upload
  const handlePhotoUpload = async (file) => {
    try {
      const url = await uploadToCloudinary(file);
      if (!url) throw new Error("Failed to upload image");
      return url;
    } catch (error) {
      console.error("Photo upload error:", error);
      throw new Error("Failed to upload photo. Please try again.");
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file (JPEG, PNG, etc.)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      setError("");
    }
  };

  // Trigger file input click
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Professional password validation
  const validatePassword = (password) => {
    const strength = {
      length: password.length >= 8,
      uppercase: /(?=.*[A-Z])/.test(password),
      lowercase: /(?=.*[a-z])/.test(password),
      number: /(?=.*\d)/.test(password),
      special: /(?=.*[@$!%*?&])/.test(password),
    };

    setPasswordStrength(strength);

    const errors = [];
    if (!strength.length) errors.push("At least 8 characters");
    if (!strength.uppercase) errors.push("One uppercase letter");
    if (!strength.lowercase) errors.push("One lowercase letter");
    if (!strength.number) errors.push("One number");
    if (!strength.special) errors.push("One special character (@$!%*?&)");

    return errors;
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData((prev) => ({ ...prev, password }));
    validatePassword(password);
  };

  // Validate passwords match
  const validatePasswordMatch = () => {
    return formData.password === formData.confirmPassword;
  };

  // Validate student email format
  const validateStudentEmail = (email) => {
    const emailRegex = /^\d+\.[a-z]+@student\.just\.edu\.bd$/;
    if (!emailRegex.test(email)) {
      return "Email must be in format: roll.dept@student.just.edu.bd (e.g., 200142.cse@student.just.edu.bd)";
    }

    const [localPart] = email.split("@");
    const [roll, dept] = localPart.split(".");

    if (roll.length !== 6) {
      return "Roll number must be exactly 6 digits";
    }

    const validDepartments = departments.map((dept) => dept.code);
    if (!validDepartments.includes(dept)) {
      return "Invalid department code. Please select from the list.";
    }

    return null;
  };

  // Validate organization email
  const validateOrganizationEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  // Calculate password strength score
  const getPasswordStrength = () => {
    const requirements = Object.values(passwordStrength);
    const metRequirements = requirements.filter(Boolean).length;
    return (metRequirements / requirements.length) * 100;
  };

  // Get password strength color
  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 40) return "from-red-500 to-red-600";
    if (strength <= 80) return "from-yellow-500 to-orange-500";
    return "from-green-500 to-emerald-600";
  };

  // Get password strength text
  const getStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength <= 40) return "Weak";
    if (strength <= 80) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  let createdFirebaseUser = null;
  let creatingToast = null;

  try {
    creatingToast = toast.loading("Creating your account...");

    let photoURL = null;

    if (photoFile) {
      const uploadToast = toast.loading("Uploading profile photo...");
      try {
        photoURL = await handlePhotoUpload(photoFile);
        toast.success("Photo uploaded successfully!", { id: uploadToast });
      } catch (uploadError) {
        toast.error("Failed to upload photo", { id: uploadToast });
        throw uploadError;
      }
    }

    const userCredential = await createUser(formData.email, formData.password);
    createdFirebaseUser = userCredential.user;

    const userData = {
      uid: createdFirebaseUser.uid,
      email: formData.email,
      name: formData.name,
      role,
      photoURL:
        photoURL ||
        (role === "organization"
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
              formData.orgName
            )}&background=4bbeff&color=fff`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              formData.name
            )}&background=4bbeff&color=fff`),
      createdAt: new Date().toISOString(),
      ...(role === "organization"
        ? {
            organization: {
              name: formData.orgName,
              type: formData.orgType,
              roleType: formData.roleType,
              tagline: formData.tagline,
              founded: formData.founded,
              website: formData.website,
              phone: formData.phone,
              campus: formData.campus,
              mission: formData.mission,
              membershipCount: 0,
              status: "active",
              verified: false,
            },
          }
        : {
            student: {
              studentId: formData.studentId,
              department: formData.department,
              session: formData.session,
              interests: formData.interests,
              year: new Date().getFullYear(),
              status: "active",
              verified: false,
            },
          }),
    };

    await API.post("/users", userData);

    await updateProfileUser({
      displayName: formData.name,
      photoURL: userData.photoURL,
    });

    toast.success("Account created successfully!", {
      id: creatingToast,
    });

    navigate("/dashboard");
  } catch (error) {
    console.error("Signup error:", error);

    if (createdFirebaseUser) {
      try {
        await createdFirebaseUser.delete();
        console.log("Rolled back Firebase user because Mongo save failed");
      } catch (deleteError) {
        console.error("Failed to rollback Firebase user:", deleteError);
      }
    }

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create account. Please try again.";

    setError(errorMessage);
    toast.error(errorMessage, {
      id: creatingToast || undefined,
    });
  } finally {
    setLoading(false);
    setAuthLoading(false);
  }
};

  // Password requirement component
  const PasswordRequirement = ({ met, text }) => (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {met ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-400" />
      )}
      <span className={`text-sm ${met ? "text-green-600" : "text-gray-500"}`}>
        {text}
      </span>
    </motion.div>
  );

  return (
    <div className="min-h-screen mt-10 flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-8"
      >
        {/* Header with Gradient Border */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1 rounded-2xl shadow-lg">
            <div className="bg-white rounded-xl p-3">
              <GraduationCap className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="text-center mb-8 pt-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3"
          >
            Join Aidevo
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-lg"
          >
            Start your campus journey with endless possibilities
          </motion.p>
        </div>

        {/* Role Selection - Card Style */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            {
              value: "student",
              label: "Student",
              icon: User,
              description: "Join as a student",
            },
            {
              value: "organization",
              label: "Organization",
              icon: Users,
              description: "Create organization",
            },
          ].map(({ value, label, icon: Icon, description }) => (
            <motion.button
              key={value}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={() => setRole(value)}
              disabled={loading}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                role === value
                  ? "border-blue-500 bg-blue-50/50 shadow-lg"
                  : "border-gray-200 bg-white/50 hover:border-blue-300 hover:bg-blue-50/30"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    role === value
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="">
                  <h3
                    className={`font-semibold text-sm ${
                      role === value ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
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
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Section */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 border-4 border-white shadow-2xl overflow-hidden group-hover:shadow-3xl transition-all duration-500">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <Camera className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-2xl"></div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handlePhotoClick}
                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-full shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-200 group"
                disabled={loading}
              >
                <Upload className="w-5 h-5" />
                <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200"></div>
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </div>
          </motion.div>

          {/* Common Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="text-sm font-medium text-gray-700">
                {role === "organization"
                  ? "Contact Person Name *"
                  : "Full Name *"}
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <User className="text-gray-400 mr-3" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={
                    role === "organization" ? "John Doe" : "Your full name"
                  }
                  className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  disabled={loading}
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Mail className="text-gray-400 mr-3" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder={
                    role === "organization"
                      ? "contact@organization.edu"
                      : "200142.cse@student.just.edu.bd"
                  }
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  disabled={loading}
                  required
                />
              </div>
              {role === "student" && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Format: roll.dept@student.just.edu.bd
                </p>
              )}
            </motion.div>
          </div>

          {/* Password Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Lock className="text-gray-400 mr-3" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="Create a strong password"
                  className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <label className="text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Lock className="text-gray-400 mr-3" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm your password"
                  className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {formData.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm font-medium ${
                    validatePasswordMatch() ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {validatePasswordMatch()
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Password Strength Meter */}
          {formData.password && (
            <motion.div
              className="space-y-3 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-blue-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Password strength:
                </span>
                <span
                  className={`text-sm font-medium ${
                    getPasswordStrength() <= 40
                      ? "text-red-600"
                      : getPasswordStrength() <= 80
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {getStrengthText()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${getStrengthColor()} shadow-inner`}
                  initial={{ width: 0 }}
                  animate={{ width: `${getPasswordStrength()}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                ></motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <PasswordRequirement
                  met={passwordStrength.length}
                  text="At least 8 characters"
                />
                <PasswordRequirement
                  met={passwordStrength.uppercase}
                  text="One uppercase letter"
                />
                <PasswordRequirement
                  met={passwordStrength.lowercase}
                  text="One lowercase letter"
                />
                <PasswordRequirement
                  met={passwordStrength.number}
                  text="One number"
                />
                <PasswordRequirement
                  met={passwordStrength.special}
                  text="One special character"
                />
              </div>
            </motion.div>
          )}

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
                      <label className="text-sm font-medium text-gray-700">
                        Organization Name *
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Building2 className="text-gray-400 mr-3" size={18} />
                        <input
                          type="text"
                          value={formData.orgName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              orgName: e.target.value,
                            }))
                          }
                          placeholder="Photographic Society"
                          className="w-full outline-none text-gray-700 placeholder-gray-400"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Organization Type *
                      </label>
                      <select
                        value={formData.orgType}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            orgType: e.target.value,
                            roleType: "", // Reset roleType when orgType changes
                          }));
                        }}
                        disabled={loading}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        required
                      >
                        <option value="">Select Type</option>
                        {orgTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* New Role Type Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Organization Sub-type *
                    </label>
                    <select
                      value={formData.roleType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          roleType: e.target.value,
                        }))
                      }
                      disabled={loading || !formData.orgType}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select {formData.orgType} Type</option>
                      {formData.orgType && roleTypes[formData.orgType]?.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {!formData.orgType && (
                      <p className="text-xs text-gray-500 mt-1">
                        Please select organization type first
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tagline: e.target.value,
                        }))
                      }
                      placeholder="Brief description of your organization"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Founded Date
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Calendar className="text-gray-400 mr-3" size={18} />
                        <input
                          type="date"
                          value={formData.founded}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              founded: e.target.value,
                            }))
                          }
                          className="w-full outline-none text-gray-700"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Campus
                      </label>
                      <select
                        value={formData.campus}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            campus: e.target.value,
                          }))
                        }
                        disabled={loading}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      >
                        <option value="">Select Campus</option>
                        {campuses.map((campus) => (
                          <option key={campus} value={campus}>
                            {campus}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+880 12389-45679"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Globe className="text-gray-400 mr-3" size={18} />
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              website: e.target.value,
                            }))
                          }
                          placeholder="https://your-organization.edu"
                          className="w-full outline-none text-gray-700 placeholder-gray-400"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Mission Statement
                    </label>
                    <textarea
                      value={formData.mission}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mission: e.target.value,
                        }))
                      }
                      placeholder="Describe your organization's mission and purpose..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none h-24 placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Student ID *
                      </label>
                      <input
                        type="text"
                        value={formData.studentId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            studentId: e.target.value,
                          }))
                        }
                        placeholder="200142"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
                        disabled={loading}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Your 6-digit student ID
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Session *
                      </label>
                      <select
                        value={formData.session}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            session: e.target.value,
                          }))
                        }
                        disabled={loading}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        required
                      >
                        <option value="">Select Session</option>
                        {sessions.map((session) => (
                          <option key={session} value={session}>
                            {session}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      disabled={loading}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.code} value={dept.code}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* New Interests Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Interests
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                      <Heart className="text-gray-400 mr-3" size={18} />
                      <select
                        value={formData.interests}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            interests: e.target.value,
                          }))
                        }
                        disabled={loading}
                        className="w-full outline-none text-gray-700 bg-transparent"
                      >
                        <option value="">Select your interests</option>
                        {interestsOptions.map((interest) => (
                          <option key={interest} value={interest}>
                            {interest}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">
                      What type of organizations are you interested in?
                    </p>
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
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl disabled:shadow-none flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-6 h-6" />
                <span>
                  Create {role === "organization" ? "Organization" : "Student"}{" "}
                  Account
                </span>
              </>
            )}
          </motion.button>
        </form>

        <motion.div
          className="text-center mt-8 pt-6 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/signin")}
              disabled={loading}
              className="text-blue-500 hover:text-blue-600 font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-1 group"
            >
              Sign In
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </motion.svg>
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}