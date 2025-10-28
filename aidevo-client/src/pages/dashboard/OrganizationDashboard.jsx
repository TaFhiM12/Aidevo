import React, { useState } from "react";
import { Outlet, NavLink, useNavigate} from "react-router";
import {
  User,
  Menu,
  X,
  LogOut
  
} from "lucide-react";
import Logo from "../../components/common/Logo";
import { navigation } from "../../components/common/SidebarLinks";
import useAuth from "../../hooks/useAuth";

const OrganizationDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut()
      .then(() => {
        alert("Logged out successfully");
        navigate("/signin");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-md shadow-xl border-r border-slate-100 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2">
                <Logo />
              </div>
            </div>
            <button
              className="p-2 rounded-lg lg:hidden hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Enhanced Navigation with Unique Styling */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  // Destructure isActive from the argument so it's available below
                  children={({ isActive }) => (
                    <div
                      className={`
                        group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden
                        ${
                          isActive
                            ? "text-white shadow-lg"
                            : "text-slate-700 hover:text-slate-900 hover:bg-white hover:shadow-md hover:border hover:border-slate-100"
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {/* Background Gradient for Active State */}
                      {isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.accent} opacity-100`} />
                      )}
                      
                      {/* Hover Gradient Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      {/* Icon with Gradient */}
                      <div className={`relative z-10 p-2 rounded-lg ${
                        isActive 
                          ? "bg-white/20" 
                          : "bg-slate-100 group-hover:bg-white group-hover:shadow-sm"
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          isActive 
                            ? "text-white" 
                            : `text-slate-500 group-hover:bg-gradient-to-r ${item.accent} group-hover:text-transparent group-hover:bg-clip-text`
                        }`} />
                      </div>
                      
                      {/* Text */}
                      <span className={`relative z-10 ml-3 font-semibold ${
                        isActive ? "text-white" : "group-hover:text-slate-900"
                      }`}>
                        {item.name}
                      </span>

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute right-4 w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  )}
                />
              );
            })}
          </nav>

          {/* Enhanced User Info Section */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center flex-1">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4bbeff] to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.displayName || user?.email}
                  </p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 transition-all duration-300 rounded-lg hover:bg-red-50 group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Minimal Header */}
        <header className="bg-white  z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4 h-12">
              <button
                className="p-2 rounded-lg lg:hidden hover:bg-slate-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <h1 className="text-xl font-semibold text-slate-800">
                Dashboard
              </h1>
            </div>

            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 text-slate-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Clean Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50/50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizationDashboard;