import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import useUserRole from "../../hooks/useUserRole";
import SideBar from "./shared/SideBar";
import TopBar from './shared/TopBar';


const CombinedDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo, loading: roleLoading, error, refetch } = useUserRole(); // Now using loading

  // Show loading if either auth is loading or role is loading
  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up your experience</p>
        </div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">We couldn't load your user information.</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar 
        sidebarOpen={sidebarOpen} 
        userInfo={userInfo} 
        user={user}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userInfo={userInfo}
          user={user}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CombinedDashboard;