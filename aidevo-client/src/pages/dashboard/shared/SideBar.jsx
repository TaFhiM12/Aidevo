import { Link, NavLink } from "react-router";
import {
  Users,
  Calendar,
  MessageCircle,
  Home,
  User,
  Settings,
  LogOut,
  Bookmark,
  Sparkles,
  Building,
  Shield,
  BarChart3,
  CreditCard,
  UserPlus,
  Plus,
} from "lucide-react";

const SideBar = ({ sidebarOpen, userInfo, user, logOut }) => {
  const getNavItems = () => {
    const commonItems = [{ name: "Dashboard", icon: Home, path: "/dashboard" }];

    const studentItems = [
      {
        name: "Organizations",
        icon: Users,
        path: "/dashboard/my-organizations",
      },
      {
        name: "Applications",
        icon: Bookmark,
        path: "/dashboard/my-applications",
      },
      { name: "Events", icon: Calendar, path: "/dashboard/my-events" },
      { name: "Messages", icon: MessageCircle, path: "/dashboard/my-chat" },
      {
        name: "Discover",
        icon: Sparkles,
        path: "/dashboard/my-recommendations",
      },
      { name: "Profile", icon: User, path: "/dashboard/student-profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/student-settings" },
    ];

    const organizationItems = [
      { name: "Events", icon: Calendar, path: "/dashboard/org-events" },
      { name: "New Event", icon: Plus, path: "/dashboard/org-create-event" },
      { name: "Members", icon: Users, path: "/dashboard/org-members" },
      {
        name: "Applications",
        icon: UserPlus,
        path: "/dashboard/org-applications",
      },
      { name: "Chat", icon: MessageCircle, path: "/dashboard/org-chat" },
      { name: "Analytics", icon: BarChart3, path: "/dashboard/org-analytics" },
      { name: "Payments", icon: CreditCard, path: "/dashboard/org-payments" },
      { name: "Profile", icon: User, path: "/dashboard/org-profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/org-settings" },
    ];

    const superAdminItems = [
      {
        name: "Organizations",
        icon: Building,
        path: "/dashboard/admin-organizations",
      },
      { name: "Users", icon: Users, path: "/dashboard/admin-users" },
      {
        name: "Analytics",
        icon: BarChart3,
        path: "/dashboard/admin-analytics",
      },
      { name: "Reports", icon: Shield, path: "/dashboard/admin-reports" },
      { name: "Profile", icon: User, path: "/dashboard/admin-profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/admin-settings" },
    ];

    switch (userInfo.role) {
      case "student":
        return [...commonItems, ...studentItems];
      case "organization":
        return [...commonItems, ...organizationItems];
      case "super-admin":
        return [...commonItems, ...superAdminItems];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (userInfo.role) {
      case "student":
        return "Student";
      case "organization":
        return "Organization";
      case "super-admin":
        return "Super Admin";
      default:
        return "User";
    }
  };

  const handleSignOut = () => {
    logOut()
      .then(() => {
        alert("Signed out successfully");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 ${
        sidebarOpen ? "w-64" : "w-20"
      } transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <Link to="/">
        <div className="p-4 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">Aidevo</span>
                <p className="text-xs text-gray-500">{getRoleBadge()}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors  ${
                  isActive
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <div
          className={`flex items-center gap-3 mb-3 ${
            !sidebarOpen && "justify-center"
          }`}
        >
          <img
            src={
              user?.photoURL ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
            }
            alt="Profile"
            className="w-8 h-8 rounded-lg"
          />
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || userInfo?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userInfo.role}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${
            !sidebarOpen && "justify-center"
          }`}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default SideBar;
