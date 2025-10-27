import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  Edit3, 
  Save,
  X,
  Upload,
  Award,
  Target,
  Clock,
  Star,
  Facebook,
  Instagram,
  Twitter,
  FileText,
  UserPlus,
  Image as ImageIcon
} from "lucide-react";

const OrganizationProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [profileData, setProfileData] = useState({
    orgName: "Photographic Society",
    orgType: "Club",
    tagline: "Capturing Moments, Creating Memories",
    email: "photo.society@university.edu",
    phone: "+1 (555) 123-4567",
    website: "https://photosociety.university.edu",
    socialMedia: {
      facebook: "universityphotosociety",
      instagram: "@uniphotosoc",
      twitter: "@uni_photos"
    },
    address: "Student Center, Room 205",
    campus: "Main Campus",
    meetingRoom: "SC-205",
    founded: "2018-09-15",
    membershipCount: 145,
    president: "Sarah Johnson",
    facultyAdvisor: "Dr. Michael Chen",
    mission: "To promote photography as an art form and provide a platform for students to learn, share, and grow their photographic skills through workshops, exhibitions, and collaborative projects.",
    vision: "To become the leading student photography community that inspires creativity and technical excellence.",
    meetingSchedule: "Every Wednesday, 6:00 PM",
    upcomingEvents: [
      "Annual Photo Exhibition - Dec 15",
      "Night Photography Workshop - Nov 30",
      "Portrait Photography Contest - Ongoing"
    ],
    achievements: [
      "Best Student Club 2023",
      "University Photography Competition Winners 2022",
      "Community Outreach Award 2021"
    ],
    membershipFee: "$20 per semester",
    membershipBenefits: [
      "Access to professional equipment",
      "Free workshops and training",
      "Exhibition opportunities",
      "Networking with professionals"
    ],
    logo: null,
    coverPhoto: null,
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setProfileData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log('Profile saved:', profileData);
  };

  // Header Component
  const OrganizationHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
    >
      <div className="h-48 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
        {isEditing && (
          <div className="absolute top-4 right-4">
            <label className="btn btn-sm bg-white/90 hover:bg-white border-0 text-gray-700">
              <Upload size={16} />
              Change Cover
              <input type="file" className="hidden" />
            </label>
          </div>
        )}
      </div>

      <div className="px-8 pb-6 -mt-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
          <div className="flex items-end space-x-6">
            <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
              {profileData.logo ? (
                <img src={URL.createObjectURL(profileData.logo)} alt="Logo" className="w-full h-full rounded-xl object-cover" />
              ) : (
                <Building2 className="w-12 h-12 text-blue-500" />
              )}
            </div>

            <div className="pb-4">
              <div className="flex items-center space-x-3 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.orgName}
                    onChange={(e) => handleInputChange('orgName', e.target.value)}
                    className="text-3xl font-bold bg-gray-100 rounded-lg px-3 py-1 border border-gray-300"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">{profileData.orgName}</h1>
                )}
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {profileData.orgType}
                </span>
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  className="text-lg text-gray-600 bg-gray-100 rounded-lg px-3 py-1 border border-gray-300 w-96"
                />
              ) : (
                <p className="text-lg text-gray-600">{profileData.tagline}</p>
              )}
              
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span>{profileData.membershipCount} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Founded {new Date(profileData.founded).getFullYear()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={16} />
                  <span>{profileData.campus}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="btn btn-outline btn-error">
                  <X size={16} />
                  Cancel
                </button>
                <button onClick={handleSave} className="btn btn-primary">
                  <Save size={16} />
                  Save Changes
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Contact Sidebar Component
  const ContactSidebar = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Mail size={18} />
        <span>Contact Information</span>
      </h3>
      
      <div className="space-y-3">
        <ContactField label="Email" value={profileData.email} field="email" />
        <ContactField label="Phone" value={profileData.phone} field="phone" />
        <ContactField label="Website" value={profileData.website} field="website" isLink={true} />
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-500 mb-2 block">Social Media</label>
        <div className="space-y-2">
          {['facebook', 'instagram', 'twitter'].map(platform => (
            <div key={platform} className="flex items-center space-x-2">
              {platform === 'facebook' && <Facebook size={14} className="text-blue-600" />}
              {platform === 'instagram' && <Instagram size={14} className="text-pink-600" />}
              {platform === 'twitter' && <Twitter size={14} className="text-blue-400" />}
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.socialMedia[platform]}
                  onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              ) : (
                <span className="text-sm">{profileData.socialMedia[platform]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Contact Field Component
  const ContactField = ({ label, value, field, isLink = false }) => (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      {isEditing ? (
        <input
          type={field === 'email' ? 'email' : 'text'}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1"
        />
      ) : isLink ? (
        <a href={value} className="text-sm font-medium text-blue-500 hover:underline flex items-center space-x-1 mt-1">
          <Globe size={14} />
          <span>Visit Website</span>
        </a>
      ) : (
        <p className="text-sm font-medium mt-1">{value}</p>
      )}
    </div>
  );

  // Stats Sidebar Component
  const StatsSidebar = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h3 className="font-semibold text-gray-900 mb-4">Organization Stats</h3>
      <div className="space-y-3">
        <StatItem label="Total Members" value={profileData.membershipCount} />
        <StatItem label="Active Since" value={new Date(profileData.founded).getFullYear()} />
        <StatItem label="Events This Month" value="3" />
        <StatItem label="Upcoming Events" value={profileData.upcomingEvents.length} />
      </div>
    </motion.div>
  );

  const StatItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );

  // Tab Content Components
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="text-blue-500" size={20} />
            <h3 className="font-semibold text-gray-900">Our Mission</h3>
          </div>
          {isEditing ? (
            <textarea
              value={profileData.mission}
              onChange={(e) => handleInputChange('mission', e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">{profileData.mission}</p>
          )}
        </div>
        
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Award className="text-green-500" size={20} />
            <h3 className="font-semibold text-gray-900">Our Vision</h3>
          </div>
          {isEditing ? (
            <textarea
              value={profileData.vision}
              onChange={(e) => handleInputChange('vision', e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">{profileData.vision}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="text-purple-500" size={20} />
            <h3 className="font-semibold text-gray-900">Meeting Schedule</h3>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={profileData.meetingSchedule}
              onChange={(e) => handleInputChange('meetingSchedule', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-700">{profileData.meetingSchedule}</p>
              <span className="text-sm text-gray-500">{profileData.meetingRoom}</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="text-orange-500" size={20} />
              <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
            </div>
            <span className="text-sm text-gray-500">{profileData.upcomingEvents.length} events</span>
          </div>
          <div className="space-y-3">
            {profileData.upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">{event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AboutTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <DetailField label="Organization Type" value={profileData.orgType} field="orgType" type="select" 
            options={["Club", "NGO", "Department", "Community", "Society", "Association"]} />
          <DetailField label="Founded Date" value={profileData.founded} field="founded" type="date" />
          <DetailField label="Campus" value={profileData.campus} field="campus" type="select"
            options={["Main Campus", "North Campus", "South Campus", "City Campus", "Online"]} />
        </div>
        <div className="space-y-4">
          <DetailField label="President" value={profileData.president} field="president" />
          <DetailField label="Faculty Advisor" value={profileData.facultyAdvisor} field="facultyAdvisor" />
          <DetailField label="Membership Fee" value={profileData.membershipFee} field="membershipFee" />
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Achievements & Awards</h4>
        <div className="space-y-2">
          {profileData.achievements.map((achievement, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Award className="text-yellow-500" size={16} />
              <span className="text-sm text-gray-700">{achievement}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Membership Benefits</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {profileData.membershipBenefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Star className="text-green-500" size={16} />
              <span className="text-sm text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DetailField = ({ label, value, field, type = "text", options = [] }) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {isEditing ? (
        type === "select" ? (
          <select
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : type === "date" ? (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
        )
      ) : (
        <p className="mt-1 text-gray-900">{value}</p>
      )}
    </div>
  );

  const EventsTab = () => (
    <div className="text-center py-12">
      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Events Management</h3>
      <p className="text-gray-600">Manage your organization's events and activities</p>
    </div>
  );

  const MembersTab = () => (
    <div className="text-center py-12">
      <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Members Management</h3>
      <p className="text-gray-600">View and manage your organization members</p>
    </div>
  );

  const GalleryTab = () => (
    <div className="text-center py-12">
      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo Gallery</h3>
      <p className="text-gray-600">Showcase your organization's photos and memories</p>
    </div>
  );

  // Main Content Component
  const OrganizationContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <ContactSidebar />
        <StatsSidebar />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'about', 'events', 'members', 'gallery'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'about' && <AboutTab />}
            {activeTab === 'events' && <EventsTab />}
            {activeTab === 'members' && <MembersTab />}
            {activeTab === 'gallery' && <GalleryTab />}
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <OrganizationHeader />
        <OrganizationContent />
      </div>
    </div>
  );
};

export default OrganizationProfile;