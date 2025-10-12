import React from "react";
import Links from "../common/Links";
import { NavLink } from "react-router";
import { LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "../common/Logo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and mobile menu button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <Links />
          </div>

          {/* Sign In Button */}
          <div className="flex items-center gap-4">
            <NavLink
              to="/signin"
              className="flex items-center gap-2 px-4 py-2 bg-[#4bbeff] hover:bg-[#3aa8e6] text-white rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </NavLink>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
            <Links />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;