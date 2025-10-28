import React from "react";
import Links from "../common/Links";
import { NavLink } from "react-router";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "../common/Logo";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user , logOut} = useAuth();

  const handleSignOut = () => {
    logOut().then(() => {
      alert("Signed out successfully");
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  }

  return (
    <nav className="bg-white top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
            {
              !user ? (
                <NavLink
                  to="/signin"
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </NavLink>
              ) : <>
                <span className="hidden md:inline-block text-gray-700">Hello, {user.displayName || user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex cursor-pointer items-center gap-2 bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </>
            }
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