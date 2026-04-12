// components/events/AdvancedEventCreationForm.jsx
import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Tag,
  Eye,
  FileText,
  Image,
  Phone,
  Mail,
  Building,
  Globe,
  ChevronRight,
  Sparkles,
  Shield,
  Award,
  Heart,
  Music,
  Code,
  Trophy,
  HandHeart,
  Landmark,
  Laptop,
} from "lucide-react";
import { getEventFormConfig } from "../../config/advancedEventFormConfig";
import { COMMON_EVENT_DEFAULTS } from "../../config/eventFormConfig";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import RenderAdvancedDynamicField from "../forms/RenderAdvancedDynamicField"; // Make sure this path is correct
import API from "../../utils/api";

const AdvancedEventCreationForm = ({
  organizationType,
  organizationName,
  organizationEmail,
  roleType = null,
}) => {
  const config = useMemo(() => {
    return getEventFormConfig(organizationType, roleType);
  }, [organizationType, roleType]);

  const initialState = useMemo(() => {
    if (!config) return null;

    const extraDefaults = {};
    for (const field of config.extraFields) {
      if (field.type === "checkbox")
        extraDefaults[field.name] = field.defaultChecked || false;
      else if (field.type === "multiselect") extraDefaults[field.name] = [];
      else extraDefaults[field.name] = "";
    }

    return {
      ...COMMON_EVENT_DEFAULTS,
      ...config.defaultValues,
      ...extraDefaults,
      organization: organizationName || "",
      organizationEmail: organizationEmail || "",
      contactEmail: organizationEmail || "",
      organizationType: organizationType,
      roleType: roleType,
    };
  }, [config, organizationName, organizationEmail, organizationType, roleType]);

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);

  const totalSteps = 3;

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">
            Configuration Not Found
          </h1>
          <p className="text-gray-600">
            Event form configuration not found for this organization type.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (type === "file") {
      const file = files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          Swal.fire("Invalid File", "Please select an image file", "warning");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire(
            "File Too Large",
            "Image size should be less than 5MB",
            "warning",
          );
          return;
        }
        setFormData((prev) => ({ ...prev, [name]: file }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
  const nextErrors = {};

  if (!formData) return false;

  if (currentStep === 1) {
    const requiredBasic = ["title", "shortDesc", "location", "startAt", "endAt"];

    for (const field of requiredBasic) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        nextErrors[field] = `${field} is required`;
      }
    }

    if (
      formData.startAt &&
      formData.endAt &&
      new Date(formData.endAt) <= new Date(formData.startAt)
    ) {
      nextErrors.endAt = "End time must be after start time";
    }
  }

  if (currentStep === 2) {
    if (!formData.contactEmail || !formData.contactEmail.includes("@")) {
      nextErrors.contactEmail = "Valid email required";
    }
  }

  if (currentStep === 3) {
    for (const field of config.extraFields) {
      const value = formData[field.name];

      if (field.required) {
        if (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "") ||
          (Array.isArray(value) && value.length === 0)
        ) {
          nextErrors[field.name] = `${field.label} is required`;
        }
      }
    }
  }

  setErrors(nextErrors);
  return Object.keys(nextErrors).length === 0;
};

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      Swal.fire({
        title: "Missing Information",
        text: "Please fill all required fields before proceeding",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildSpecialRequirements = () => {
    const specialRequirements = {};
    for (const field of config.extraFields) {
      specialRequirements[field.name] = formData[field.name];
    }
    return specialRequirements;
  };

  const resetForm = () => {
    const extraDefaults = {};
    for (const field of config.extraFields) {
      if (field.type === "checkbox") extraDefaults[field.name] = false;
      else if (field.type === "multiselect") extraDefaults[field.name] = [];
      else extraDefaults[field.name] = "";
    }

    setFormData({
      ...COMMON_EVENT_DEFAULTS,
      ...config.defaultValues,
      ...extraDefaults,
      organization: organizationName || "",
      organizationEmail: organizationEmail || "",
      contactEmail: organizationEmail || "",
      organizationType: organizationType,
      roleType: roleType,
    });
    setErrors({});
    setCurrentStep(1);
  };

  // components/events/AdvancedEventCreationForm.jsx (updated handleSubmit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill all required fields correctly.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(0);

      let coverUrl = "";
      if (formData.cover) {
        setUploadProgress(30);
        try {
          coverUrl = await uploadToCloudinary(formData.cover);
          console.log("Cover uploaded successfully:", coverUrl);
          setUploadProgress(60);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
      }

      // Build the event payload
      const eventPayload = {
        title: formData.title,
        shortDesc: formData.shortDesc,
        longDesc: formData.longDesc || "",
        organization: organizationName,
        organizationEmail: organizationEmail,
        organizationType: organizationType,
        roleType: roleType,
        type: formData.type,
        category: formData.category,
        location: formData.location,
        startAt: formData.startAt,
        endAt: formData.endAt,
        registrationDeadline: formData.registrationDeadline || null,
        registrationRequired: formData.registrationRequired,
        maxCapacity: formData.maxCapacity
          ? parseInt(formData.maxCapacity)
          : null,
        fee: formData.fee || "0",
        contactName: formData.contactName || "",
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || "",
        tags: formData.tags || "",
        visibility: formData.visibility,
        cover: coverUrl,
        requirements: formData.requirements || "",
        targetAudience: formData.targetAudience,
        specialRequirements: buildSpecialRequirements(),
        createdAt: new Date().toISOString(),
        status: "active",
      };

      console.log(
        "Sending event payload:",
        JSON.stringify(eventPayload, null, 2),
      );

      setUploadProgress(80);

      // Make the API call
      const res = await API.post("/events", eventPayload);

      console.log("API Response:", res);

      setUploadProgress(100);

      if (!res.success) {
        throw new Error(res.message || "Failed to create event");
      }

      Swal.fire({
        title: "Event Created Successfully!",
        html: `
        <div class="text-center">
          <div class="mb-4">🎉</div>
          <p class="text-gray-600">Your event "${formData.title}" has been created.</p>
          <p class="text-sm text-gray-500 mt-2">It will be reviewed and published shortly.</p>
        </div>
      `,
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "View Events",
      }).then(() => {
        window.location.href = "/events";
      });

      resetForm();
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);

      // Extract detailed error message
      let errorMessage = "Failed to create event";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const getIcon = () => {
    const icons = {
      "💻": <Code className="w-6 h-6" />,
      "⚡": <Shield className="w-6 h-6" />,
      "🤖": <Award className="w-6 h-6" />,
      "🩸": <Heart className="w-6 h-6" />,
      "🤝": <HandHeart className="w-6 h-6" />,
      "🏔️": <Landmark className="w-6 h-6" />,
      "🏙️": <Globe className="w-6 h-6" />,
      "⚽": <Trophy className="w-6 h-6" />,
      "🎭": <Music className="w-6 h-6" />,
    };
    return icons[config.icon] || <Sparkles className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${config.color} shadow-lg mb-4`}
          >
            {getIcon()}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {config.pageTitle}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {config.pageDescription}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step
                        ? `bg-gradient-to-r ${config.color}`
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between max-w-md mx-auto mt-2">
            <span className="text-sm text-gray-500">Basic Info</span>
            <span className="text-sm text-gray-500">Details</span>
            <span className="text-sm text-gray-500">Custom Fields</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-500" />
                    Basic Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-gray-700">
                        Event Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Annual Tech Conference 2024"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-gray-700">
                        Short Description{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="shortDesc"
                        value={formData.shortDesc}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Brief description of your event (max 200 characters)"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                      {errors.shortDesc && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.shortDesc}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-gray-700">
                        Detailed Description
                      </label>
                      <textarea
                        name="longDesc"
                        value={formData.longDesc}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Full description of your event including agenda, highlights, etc."
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <MapPin className="text-gray-400 mr-3" size={18} />
                        <input
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Venue name and address"
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.location}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Event Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="on-campus">On-campus</option>
                        <option value="online">Online</option>
                        <option value="off-campus">Off-campus</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Start Date & Time{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Clock className="text-gray-400 mr-3" size={18} />
                        <input
                          type="datetime-local"
                          name="startAt"
                          value={formData.startAt}
                          onChange={handleChange}
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        End Date & Time <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Clock className="text-gray-400 mr-3" size={18} />
                        <input
                          type="datetime-local"
                          name="endAt"
                          value={formData.endAt}
                          onChange={handleChange}
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                      {errors.endAt && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.endAt}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Registration Deadline
                      </label>
                      <input
                        type="datetime-local"
                        name="registrationDeadline"
                        value={formData.registrationDeadline}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Max Capacity
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Users className="text-gray-400 mr-3" size={18} />
                        <input
                          type="number"
                          name="maxCapacity"
                          value={formData.maxCapacity}
                          onChange={handleChange}
                          placeholder="Unlimited if empty"
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Fee (BDT)
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <DollarSign className="text-gray-400 mr-3" size={18} />
                        <input
                          name="fee"
                          value={formData.fee}
                          onChange={handleChange}
                          placeholder="0 for free"
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Category
                      </label>
                      <input
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Target Audience
                      </label>
                      <input
                        name="targetAudience"
                        value={formData.targetAudience}
                        onChange={handleChange}
                        placeholder="e.g., All Students, CSE Students, Faculty"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-gray-700">
                        Tags
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Tag className="text-gray-400 mr-3" size={18} />
                        <input
                          name="tags"
                          value={formData.tags}
                          onChange={handleChange}
                          placeholder="Comma-separated tags (e.g., tech, workshop, networking)"
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Cover Image
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Image className="text-gray-400 mr-3" size={18} />
                        <input
                          type="file"
                          name="cover"
                          accept="image/*"
                          onChange={handleChange}
                          className="w-full outline-none bg-transparent text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Max 5MB. JPG, PNG, GIF accepted
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="registrationRequired"
                        checked={formData.registrationRequired}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-500 rounded"
                      />
                      <label className="font-medium text-gray-700">
                        Registration Required
                      </label>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Visibility
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Eye className="text-gray-400 mr-3" size={18} />
                        <select
                          name="visibility"
                          value={formData.visibility}
                          onChange={handleChange}
                          className="w-full outline-none bg-transparent"
                        >
                          <option value="public">
                            Public - Everyone can see
                          </option>
                          <option value="private">
                            Private - Only invited can see
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Organization & Contact Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Building className="w-6 h-6 text-blue-500" />
                    Organization & Contact Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Organization Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Building className="text-gray-400 mr-3" size={18} />
                        <input
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                      {errors.organization && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.organization}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Organization Email{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Mail className="text-gray-400 mr-3" size={18} />
                        <input
                          type="email"
                          name="organizationEmail"
                          value={formData.organizationEmail}
                          onChange={handleChange}
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                      {errors.organizationEmail && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.organizationEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Contact Person Name
                      </label>
                      <input
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Contact Email <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Mail className="text-gray-400 mr-3" size={18} />
                        <input
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleChange}
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                      {errors.contactEmail && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.contactEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        Contact Phone
                      </label>
                      <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <Phone className="text-gray-400 mr-3" size={18} />
                        <input
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          placeholder="+880 1XXX-XXXXXX"
                          className="w-full outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-gray-700">
                        Additional Requirements
                      </label>
                      <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Any special requirements for participants (e.g., bring laptop, ID card, etc.)"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Custom Fields */}
              {currentStep === 3 && config.extraFields.length > 0 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-500" />
                    Event Specific Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {config.extraFields.map((field) => (
                      <div
                        key={field.name}
                        className={
                          field.type === "textarea" ||
                          field.type === "multiselect"
                            ? "md:col-span-2"
                            : ""
                        }
                      >
                        {/* FIXED: Use as JSX component, not function call */}
                        <RenderAdvancedDynamicField
                          field={field}
                          value={formData[field.name]}
                          onChange={handleChange}
                          error={errors[field.name]}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && config.extraFields.length === 0 && (
                <motion.div
                  key="step3-empty"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Ready to Publish!
                  </h3>
                  <p className="text-gray-600">
                    No additional details required. Review and create your
                    event.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="px-8 py-6 bg-gray-50 border-t flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Previous
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 ml-auto"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 ml-auto disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Create Event
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-white rounded-xl shadow-2xl p-4 w-72 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Uploading...
              </span>
              <span className="text-sm font-medium text-blue-600">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdvancedEventCreationForm;
