import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { uploadToCloudinary } from "../../../../utils/uploadToCloudinary";
import CreateEventForm from '../../../../components/forms/CreateEventForm';

const AssociationEventCreation = () => {
  // Extended form data for association specific fields
  const [extendedFormData, setExtendedFormData] = useState({
    eventType: "Networking Session",
    membershipRequired: "open",
    guestSpeakers: "",
    professionalLevel: "All Levels",
    ceCredits: false,
    creditHours: 0,
    industryFocus: "",
    networkingSession: true,
    certificationProvided: false
  });

  const eventTypes = [
    "Networking Session",
    "Professional Workshop",
    "Annual Conference",
    "Seminar/Talk",
    "Training Program",
    "Committee Meeting",
    "Social Gathering",
    "Award Ceremony",
    "Industry Visit",
    "Mentorship Program"
  ];

  const professionalLevels = [
    "All Levels",
    "Students/Entry Level",
    "Junior Professionals",
    "Mid-Career Professionals",
    "Senior Executives",
    "Mixed Audience"
  ];

  const industries = [
    "Technology", "Business", "Healthcare", "Education", "Engineering",
    "Arts & Media", "Science & Research", "Government", "Non-profit", "General"
  ];

  const handleExtendedChange = (field, value) => {
    setExtendedFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateEvent = async (formData) => {
    try {
      let imageUrl = "";

      if (formData.cover) {
        imageUrl = await uploadToCloudinary(formData.cover);
      }

      // Merge basic form data with association specific data
      const eventData = {
        ...formData,
        category: "professional",
        tags: formData.tags ? `${formData.tags}, professional, networking, development` : "professional, networking, development",
        cover: imageUrl,
        organizationType: "association",
        specialRequirements: {
          eventType: extendedFormData.eventType,
          membershipRequired: extendedFormData.membershipRequired,
          guestSpeakers: extendedFormData.guestSpeakers,
          professionalLevel: extendedFormData.professionalLevel,
          ceCredits: extendedFormData.ceCredits,
          creditHours: extendedFormData.creditHours,
          industryFocus: extendedFormData.industryFocus,
          networkingSession: extendedFormData.networkingSession,
          certificationProvided: extendedFormData.certificationProvided
        }
      };

      const res = await axios.post("http://localhost:3000/events", eventData);

      if (res.data.success) {
        Swal.fire({
          title: "🎉 Association Event Created!",
          text: "Your professional event has been scheduled successfully.",
          icon: "success",
          confirmButtonColor: "#059669",
        });
        
        // Reset extended form data
        setExtendedFormData({
          eventType: "Networking Session",
          membershipRequired: "open",
          guestSpeakers: "",
          professionalLevel: "All Levels",
          ceCredits: false,
          creditHours: 0,
          industryFocus: "",
          networkingSession: true,
          certificationProvided: false
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "❌ Error Creating Association Event",
        text: err.response?.data?.message || "Failed to create association event",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Custom fields for association
  const associationCustomFields = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            🎯 Event Type *
          </label>
          <select
            value={extendedFormData.eventType}
            onChange={(e) => handleExtendedChange("eventType", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
            required
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Professional Level */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            📊 Target Professional Level
          </label>
          <select
            value={extendedFormData.professionalLevel}
            onChange={(e) => handleExtendedChange("professionalLevel", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
          >
            {professionalLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Membership Requirement */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            👥 Membership Requirement
          </label>
          <select
            value={extendedFormData.membershipRequired}
            onChange={(e) => handleExtendedChange("membershipRequired", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
          >
            <option value="open">Open to all</option>
            <option value="members">Members only</option>
            <option value="members-guests">Members + guests</option>
            <option value="invitation">By invitation only</option>
          </select>
        </div>

        {/* Industry Focus */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            🏭 Industry Focus
          </label>
          <select
            value={extendedFormData.industryFocus}
            onChange={(e) => handleExtendedChange("industryFocus", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
          >
            <option value="">General/Cross-industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Guest Speakers */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          🎤 Guest Speakers & Presenters
        </label>
        <textarea
          value={extendedFormData.guestSpeakers}
          onChange={(e) => handleExtendedChange("guestSpeakers", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white resize-none h-20"
          placeholder="List confirmed or potential guest speakers, their affiliations, and topics..."
        />
      </div>

      {/* Professional Development Features */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Professional Development Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CE Credits */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <input
              type="checkbox"
              checked={extendedFormData.ceCredits}
              onChange={(e) => handleExtendedChange("ceCredits", e.target.checked)}
              className="checkbox checkbox-success checkbox-sm"
            />
            <div className="flex-1">
              <span className="block text-sm font-medium text-gray-700">Continuing Education Credits</span>
              <span className="text-xs text-gray-600">This event offers professional development credits</span>
            </div>
            {extendedFormData.ceCredits && (
              <div className="w-20">
                <input
                  type="number"
                  value={extendedFormData.creditHours}
                  onChange={(e) => handleExtendedChange("creditHours", parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Hours"
                  min="0.5"
                  step="0.5"
                />
              </div>
            )}
          </div>

          {/* Networking Session */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <input
              type="checkbox"
              checked={extendedFormData.networkingSession}
              onChange={(e) => handleExtendedChange("networkingSession", e.target.checked)}
              className="checkbox checkbox-success checkbox-sm"
            />
            <div>
              <span className="block text-sm font-medium text-gray-700">Networking Session</span>
              <span className="text-xs text-gray-600">Dedicated time for professional networking</span>
            </div>
          </div>

          {/* Certification */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <input
              type="checkbox"
              checked={extendedFormData.certificationProvided}
              onChange={(e) => handleExtendedChange("certificationProvided", e.target.checked)}
              className="checkbox checkbox-success checkbox-sm"
            />
            <div>
              <span className="block text-sm font-medium text-gray-700">Certificate of Participation</span>
              <span className="text-xs text-gray-600">Provide certificates to attendees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-l-4 border-green-500">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-700 mb-2">
                  Create Association Event
                </h1>
                <p className="text-green-600 text-lg">
                  Organize professional development events, networking sessions, and workshops
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-6">
            <h2 className="text-2xl font-bold">Association Event Details</h2>
            <p className="text-green-100 text-sm mt-1">
              Plan your professional development or networking event
            </p>
          </div>
          
          <div className="p-2">
            <CreateEventForm
              onSubmit={handleCreateEvent}
              customFields={associationCustomFields}
            />
          </div>
        </div>

        {/* Association Event Tips */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-green-200 p-6">
          <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            💡 Association Event Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">• Clearly state membership requirements and fees</li>
              <li className="flex items-center gap-2">• Highlight professional development benefits</li>
              <li className="flex items-center gap-2">• Plan networking opportunities and icebreakers</li>
              <li className="flex items-center gap-2">• Consider hybrid (in-person + virtual) options</li>
            </ul>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">• Follow up with attendees for feedback</li>
              <li className="flex items-center gap-2">• Provide resources and presentation materials</li>
              <li className="flex items-center gap-2">• Record sessions for future reference</li>
              <li className="flex items-center gap-2">• Build partnerships with industry professionals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssociationEventCreation;