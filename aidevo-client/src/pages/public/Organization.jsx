import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  MapPin, 
  Building2, 
  Globe, 
  Phone, 
  Mail,
  Clock,
  UserCheck,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ApplicationModal from '../../components/layouts/ApplicationModal';
import useAuth from '../../hooks/useAuth';
import useUserRole from '../../hooks/useUserRole';
import Loading from '../../components/common/Loading';
import API from '../../utils/api';

const Organization = () => {
  const { user } = useAuth();
  const { userInfo, loading: roleLoading } = useUserRole();
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const orgTypes = ['all', 'Club', 'NGO', 'Department', 'Community', 'Society', 'Association'];
  const campuses = ['all', 'Main Campus', 'North Campus', 'South Campus', 'City Campus', 'Online'];

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (user && userInfo?.role === 'student') {
      fetchUserApplications();
    }
  }, [user, userInfo, refreshTrigger]);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchTerm, selectedType, selectedCampus]);

  const fetchOrganizations = async () => {
  try {
    setLoading(true);
    setError("");

    console.log("Fetching organizations...");

    let organizationsData = [];

    try {
      const response = await API.get("/organizations/with-applications");
      organizationsData = Array.isArray(response.data) ? response.data : [];
    } catch (e) {
      console.log("Enhanced endpoint failed, trying basic endpoint...");
      console.log(e)
      const response = await API.get("/organizations");
      const basicOrganizations = Array.isArray(response.data) ? response.data : [];

      organizationsData = basicOrganizations.map((org) => ({
        ...org,
        applicationCount: 0,
      }));
    }

    console.log("Organizations fetched:", organizationsData.length);
    setOrganizations(organizationsData);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    setError("Failed to load organizations. Please try again.");
    setOrganizations([]);
  } finally {
    setLoading(false);
  }
};

const fetchUserApplications = async () => {
  if (!user) return;

  try {
    setApplicationsLoading(true);
    console.log("Fetching user applications for student:", user.uid);

    const response = await API.get(`/students/${user.uid}/applications`);
    const applicationsData = Array.isArray(response.data) ? response.data : [];

    console.log("User applications fetched:", applicationsData.length);
    setUserApplications(applicationsData);
  } catch (error) {
    console.error("Error fetching user applications:", error);
    setUserApplications([]);
  } finally {
    setApplicationsLoading(false);
  }
};

  const filterOrganizations = () => {
    let filtered = organizations;

    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organization?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organization?.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organization?.campus?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(org => org.organization?.type === selectedType);
    }

    if (selectedCampus !== 'all') {
      filtered = filtered.filter(org => org.organization?.campus === selectedCampus);
    }

    setFilteredOrganizations(filtered);
  };

  const getUserApplicationStatus = (organizationId) => {
    if (!user || userInfo?.role !== 'student') return null;
    
    const application = userApplications.find(app => 
      app.organizationId === organizationId.toString()
    );
    
    console.log(`Checking application for org ${organizationId}:`, application ? application.status : 'Not applied');
    return application ? application.status : null;
  };

  const handleApply = (organization) => {
    console.log('Apply clicked for organization:', organization.organization?.name);
    setSelectedOrganization(organization);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async () => {
    console.log('Application submitted successfully!');
    setShowApplicationModal(false);
    setSelectedOrganization(null);
    
    setRefreshTrigger(prev => prev + 1);
    
    setTimeout(() => {
      fetchOrganizations();
      if (user && userInfo?.role === 'student') {
        fetchUserApplications();
      }
    }, 500);
  };

  const getButtonConfig = (organization) => {
    const applicationStatus = getUserApplicationStatus(organization._id);
    console.log(`Button config for ${organization.organization?.name}:`, {
      user: !!user,
      role: userInfo?.role,
      applicationStatus,
      roleLoading,
      applicationsLoading
    });

    if (!user) {
      return {
        text: 'Sign In to Apply',
        disabled: true,
        className: 'from-gray-400 to-gray-500 cursor-not-allowed',
        icon: LogIn
      };
    }

    if (roleLoading || applicationsLoading) {
      return {
        text: 'Loading...',
        disabled: true,
        className: 'from-gray-400 to-gray-500 cursor-not-allowed',
        icon: Clock
      };
    }

    if (userInfo?.role !== 'student') {
      return {
        text: 'Students Only',
        disabled: true,
        className: 'from-gray-400 to-gray-500 cursor-not-allowed',
        icon: AlertCircle
      };
    }

    if (applicationStatus) {
      const statusConfig = {
        pending: {
          text: 'Application Pending',
          className: 'from-yellow-500 to-amber-500 cursor-default',
          icon: Clock
        },
        approved: {
          text: 'Approved ✓',
          className: 'from-green-500 to-emerald-500 cursor-default',
          icon: CheckCircle
        },
        rejected: {
          text: 'Application Rejected',
          className: 'from-red-500 to-rose-500 cursor-default',
          icon: XCircle
        }
      };
      return { ...statusConfig[applicationStatus], disabled: true };
    }

    return {
      text: 'Apply Now',
      disabled: false,
      className: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
      icon: Users
    };
  };

  const getStatusBadge = (organization) => {
    const applicationStatus = getUserApplicationStatus(organization._id);
    
    if (!applicationStatus) return null;

    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pending Review',
        icon: Clock
      },
      approved: {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Approved Member',
        icon: CheckCircle
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Application Rejected',
        icon: XCircle
      }
    };

    const config = statusConfig[applicationStatus];
    const Icon = config.icon;

    return (
      <div className={`absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color} z-10`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </div>
    );
  };

  if (loading) {
    return <Loading/>
  }

  return (
    <div className="min-h-screen  py-8 px-4 mt-14">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Campus Organizations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover and join various clubs, societies, and organizations at our campus. 
            Find your community and make a difference!
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
              >
                {orgTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Campus Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
              >
                {campuses.map(campus => (
                  <option key={campus} value={campus}>
                    {campus === 'all' ? 'All Campuses' : campus}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Organizations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredOrganizations.map((organization, index) => {
              const buttonConfig = getButtonConfig(organization);
              const ButtonIcon = buttonConfig.icon;
              const statusBadge = getStatusBadge(organization);

              return (
                <motion.div
                  key={organization._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 relative"
                >
                  {/* Application Status Badge */}
                  {statusBadge}

                  {/* Organization Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start space-x-4">
                      <img
                        src={organization.photoURL || `https://ui-avatars.com/api/?name=${organization.organization?.name}&background=4bbeff&color=fff`}
                        alt={organization.organization?.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {organization.organization?.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-600 font-medium">
                            {organization.organization?.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {organization.organization?.campus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tagline */}
                    {organization.organization?.tagline && (
                      <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                        {organization.organization.tagline}
                      </p>
                    )}
                  </div>

                  {/* Organization Details */}
                  <div className="p-6 space-y-3">
                    {/* Mission Preview */}
                    {organization.organization?.mission && (
                      <div>
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {organization.organization.mission}
                        </p>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2">
                      {organization.organization?.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={organization.organization.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 transition-colors truncate"
                          >
                            {organization.organization.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      {organization.organization?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{organization.organization.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{organization.email}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{organization.applicationCount || 0} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <UserCheck className="w-4 h-4" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <motion.button
                      whileHover={!buttonConfig.disabled ? { scale: 1.02 } : {}}
                      whileTap={!buttonConfig.disabled ? { scale: 0.98 } : {}}
                      onClick={() => !buttonConfig.disabled && handleApply(organization)}
                      disabled={buttonConfig.disabled}
                      className={`w-full bg-gradient-to-r ${buttonConfig.className} text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      <ButtonIcon className="w-5 h-5" />
                      {buttonConfig.text}
                    </motion.button>
                    
                    {!buttonConfig.disabled && buttonConfig.text === 'Apply Now' && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Join this organization and be part of the community
                      </p>
                    )}
                    
                    {buttonConfig.disabled && buttonConfig.text === 'Sign In to Apply' && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Please sign in to apply to organizations
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredOrganizations.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {organizations.length === 0 ? 'No organizations available' : 'No organizations found'}
            </h3>
            <p className="text-gray-500">
              {organizations.length === 0 
                ? 'There are no organizations registered yet.' 
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {showApplicationModal && selectedOrganization && (
          <ApplicationModal
            organization={selectedOrganization}
            onClose={() => {
              setShowApplicationModal(false);
              setSelectedOrganization(null);
            }}
            onSubmit={handleApplicationSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Organization;