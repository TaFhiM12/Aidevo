import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Building,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronDown,
  X,
  Star,
  Edit3,
} from "lucide-react";
import axios from "axios";
import useUserRole from '../../../hooks/useUserRole';
import AssociationEventDetails from "./shared/AssociationEventDetails";
import ClubEventDetails from "./shared/ClubEventDetails";
import SocialServiceEventDetails from "./shared/SocialServiceEventDetails";

const OrganizationEvents = () => {
  const { userInfo } = useUserRole();
  const email = userInfo?.email;
  const type = userInfo?.type;
  const organizationName = userInfo?.organization?.name || userInfo?.name;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (email) {
      fetchOrganizationEvents();
    }
  }, [email]);

  const fetchOrganizationEvents = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/organization-events/${email}`);
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error("Error fetching organization events:", error);
    } finally {
      setLoading(false);
    }
  };




const handleDeleteEvent = async (eventId) => {
  const eventTitle = events.find(event => event._id === eventId)?.title || 'this event';
  
  Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete "${eventTitle}". This action cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    background: '#fff',
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-xl font-bold text-gray-900',
      htmlContainer: 'text-gray-600',
      confirmButton: 'px-6 py-3 rounded-lg font-semibold',
      cancelButton: 'px-6 py-3 rounded-lg font-semibold'
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const deleteToast = toast.loading('Deleting event...');
      
      try {
        await axios.delete(`http://localhost:3000/events/${eventId}`);
        
        // Remove the event from state
        setEvents(events.filter(event => event._id !== eventId));
        
        // Success notification
        toast.success('Event deleted successfully!', {
          id: deleteToast,
          duration: 3000,
        });
        
        // Optional: Show success Swal as well
        Swal.fire({
          title: 'Deleted!',
          text: 'Your event has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          background: '#fff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-xl font-bold text-gray-900',
          }
        });
        
      } catch (error) {
        console.error("Error deleting event:", error);
        
        // Error notification
        toast.error(
          error.response?.data?.message || 'Failed to delete event', 
          {
            id: deleteToast,
            duration: 4000,
          }
        );
        
        // Show error Swal
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete event. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          background: '#fff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-xl font-bold text-gray-900',
          }
        });
      }
    }
  });
};

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.shortDesc?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const getCategoryColor = (category) => {
    const colors = {
      professional: "from-blue-500 to-cyan-500",
      competition: "from-purple-500 to-pink-500",
      "blood-donation": "from-red-500 to-rose-500",
      workshop: "from-amber-500 to-orange-500",
      seminar: "from-teal-500 to-cyan-500",
    };
    return colors[category] || "from-gray-500 to-gray-700";
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      draft: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const EventCard = ({ event }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col h-[620px]" // Fixed height
    >
      {/* Event Image - Fixed Height */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {event.cover ? (
          <img
            src={event.cover}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${getCategoryColor(
              event.category
            )} flex items-center justify-center`}
          >
            <Building className="w-12 h-12 text-white" />
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
        </div>

        {/* Upcoming Badge */}
        {isUpcoming(event.startAt) && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg backdrop-blur-sm flex items-center gap-1">
              <Star className="w-3 h-3" />
              Upcoming
            </span>
          </div>
        )}

        {/* Capacity */}
        {event.maxCapacity && (
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.maxCapacity} spots
            </span>
          </div>
        )}
      </div>

      {/* Event Content - Flexible but with min-height */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title and Description Section */}
        <div className="flex-1 mb-4">
          <h3 className="font-bold text-gray-900 text-xl leading-tight line-clamp-2 mb-3 group-hover:text-blue-500 transition-colors min-h-[56px]">
            {event.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 min-h-[60px]">
            {event.shortDesc}
          </p>
        </div>

        {/* Event Details - Fixed Height */}
        <div className="space-y-2 text-sm text-gray-500 mb-4 min-h-[72px]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{formatDate(event.startAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {formatTime(event.startAt)} - {formatTime(event.endAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate capitalize">
              {event.type} • {event.location}
            </span>
          </div>
        </div>

        {/* Tags - Fixed Height with overflow */}
        {event.tags && (
          <div className="flex flex-wrap gap-1 mb-4 min-h-[32px]">
            {event.tags
              .split(",")
              .slice(0, 3)
              .map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                >
                  #{tag.trim()}
                </span>
              ))}
          </div>
        )}

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewDetails(event)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200 rounded-lg hover:bg-blue-50">
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteEvent(event._id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl shadow-lg p-6 h-[520px] flex flex-col">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4 flex-shrink-0"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Organization
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {" "}
              Events
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            Manage and view all events created by {organizationName}
          </p>
        </motion.div>

        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your events..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all duration-300 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedStatus("all");
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filteredEvents.length}
              </span>{" "}
              of {events.length} events
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm
                  ? `No events match "${searchTerm}". Try different keywords or clear filters.`
                  : "You haven't created any events yet."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-[520px]" // Ensure container also has fixed height
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedEvent && (
            <EventDetailsModal
              event={selectedEvent}
              onClose={() => setShowDetailsModal(false)}
              organizationType={type}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Event Details Modal Component
const EventDetailsModal = ({ event, onClose, organizationType }) => {
  const renderEventDetails = () => {
    switch (organizationType) {
      case 'Association':
        return <AssociationEventDetails event={event} />;
      case 'Club':
        return <ClubEventDetails event={event} />;
      case 'Social Service':
        return <SocialServiceEventDetails event={event} />;
      default:
        return <DefaultEventDetails event={event} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {renderEventDetails()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Default Event Details (Fallback)
const DefaultEventDetails = ({ event }) => (
  <div className="p-6 space-y-6">
    {/* Basic Information */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Title</label>
            <p className="text-gray-900">{event.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900">{event.shortDesc}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Category</label>
            <p className="text-gray-900 capitalize">{event.category}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">
              {new Date(event.startAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">
              {new Date(event.startAt).toLocaleTimeString()} - {new Date(event.endAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">Capacity: {event.maxCapacity || 'Unlimited'}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Additional Information */}
    {event.longDesc && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Description</h3>
        <p className="text-gray-700 leading-relaxed">{event.longDesc}</p>
      </div>
    )}

    {/* Contact Information */}
    {(event.contactName || event.contactEmail || event.contactPhone) && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {event.contactName && (
            <div>
              <label className="text-sm font-medium text-gray-500">Contact Person</label>
              <p className="text-gray-900">{event.contactName}</p>
            </div>
          )}
          {event.contactEmail && (
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{event.contactEmail}</p>
            </div>
          )}
          {event.contactPhone && (
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{event.contactPhone}</p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

export default OrganizationEvents;