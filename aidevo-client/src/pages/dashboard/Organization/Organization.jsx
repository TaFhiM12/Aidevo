import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  Home,
  Settings,
  Bell,
  LogOut,
  BarChart3,
  CreditCard,
  UserPlus,
  Building
} from 'lucide-react';

const OrganizationDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items for organization admin
  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/organization' },
    { name: 'Events', icon: Calendar, path: '/organization/events' },
    { name: 'Members', icon: Users, path: '/organization/members' },
    { name: 'Applications', icon: UserPlus, path: '/organization/applications' },
    { name: 'Chat', icon: MessageCircle, path: '/organization/chat' },
    { name: 'Analytics', icon: BarChart3, path: '/organization/analytics' },
    { name: 'Payments', icon: CreditCard, path: '/organization/payments' },
    { name: 'Settings', icon: Settings, path: '/organization/settings' },
  ];

  const getPageName = () => {
    const path = location.pathname.split('/').pop();
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}>
        
        {/* Logo & Organization */}
        <div className="p-4 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">Aidevo</span>
                <p className="text-xs text-gray-500">Robotics Club</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Admin & Sign Out */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 mb-3 ${!sidebarOpen && 'justify-center'}`}>
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Profile"
              className="w-8 h-8 rounded-lg"
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Tanvir Mahtab</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {/* Handle sign out */}}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{getPageName()}</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="font-medium text-gray-900">45</p>
                  <p className="text-gray-500">Members</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">12</p>
                  <p className="text-gray-500">Events</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">5</p>
                  <p className="text-gray-500">Pending</p>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Tanvir Mahtab</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="Profile"
                  className="w-8 h-8 rounded-lg"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OrganizationDashboard;