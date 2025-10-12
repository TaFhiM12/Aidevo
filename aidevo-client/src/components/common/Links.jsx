import { NavLink } from "react-router";
import { Home, LayoutDashboard, FileText, Users, Info } from "lucide-react";

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/events', icon: FileText, label: 'Events' },
  { to: '/organization', icon: Users, label: 'Organization' },
  { to: '/about', icon: Info, label: 'About' },
];

const Links = () => {
  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-1">
      {navItems.map(({ to, icon: Icon, label }) => (
        <li key={to} className="list-none">
          <NavLink
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-[#C6E7FF] text-gray-800 shadow-sm'
                  : 'text-gray-800 hover:text-gray-900 hover:bg-gray-100'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        </li>
      ))}
    </div>
  );
};

export default Links;