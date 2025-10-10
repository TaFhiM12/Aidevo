import { NavLink } from "react-router";
import { Home, LayoutDashboard, Info, FileText, Contact, Users } from "lucide-react";

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/blog', icon: FileText, label: 'Blog' },
  //   { to: '/contact', icon: Contact, label: 'Contact' },
  { to: '/organization', icon: Users, label: 'Organization' },
  { to: '/about', icon: Info, label: 'About' },
];

const Links = () => {
  return (
    <div className="md:flex space-x-6">
      {navItems.map(({ to, icon: Icon, label }) => (
        <li key={to} className="list-none">
          <NavLink
            to={to}
            className={({ isActive }) =>
              `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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