import React from "react";
import { useLocation } from "react-router";
import { Bell, Search } from "lucide-react";

const TopBar = ({ sidebarOpen, setSidebarOpen, userInfo, user }) => {
  const location = useLocation();
  
  const getPageName = () => {
    const path = location.pathname.split("/").pop();
    
    // Map route paths to display names for all user types
    const pageNames = {
      // Organization Routes
      'org-create-event': 'Create Event',
      'org-profile': `${userInfo?.organizationName || 'Organization'} Profile`,
      'org-events': 'Events',
      'org-members': 'Members',
      'org-applications': 'Applications',
      'org-chat': 'Communication',
      'org-analytics': 'Analytics',
      'org-payments': 'Payments',
      'org-settings': 'Settings',
      
      // Student Routes
      'my-organizations': 'My Organizations',
      'my-applications': 'My Applications',
      'my-events': 'My Events',
      'my-chat': 'My Chats',
      'my-recommendations': 'AI Recommendations',
      'student-profile': `${user?.displayName || 'Student'}'s Profile`,
      'student-settings': 'Settings',
      
      // Admin Routes
      'admin-organizations': 'Organizations Management',
      'admin-users': 'User Management',
      'admin-analytics': 'Analytics Dashboard',
      'admin-reports': 'Reports',
      'admin-profile': `${user?.displayName || 'Admin'} Profile`,
      'admin-settings': 'Admin Settings'
    };

    // Return the mapped name or fallback to the original logic
    return pageNames[path] || path
      .replace(/^(org-|my-|student-|admin-)/, '') // Remove all prefixes
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getUserDisplayName = () => {
    if (userInfo?.role === 'organization') {
      return userInfo.organizationName || 'Organization';
    } else if (userInfo?.role === 'admin' || userInfo?.role === 'student') {
      return user?.displayName || userInfo?.name || 'User';
    } else {
      return userInfo?.name || 'User';
    }
  };

  const getUserRole = () => {
    return userInfo?.role || 'user';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-[17.5px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {getPageName()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {getUserRole()}
              </p>
            </div>
            <img
              src={userInfo?.photoURL || user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
              alt="Profile"
              className="w-8 h-8 rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;