import React from "react";
import FooterLinks from "../common/FooterLinks";
import Logo from "../common/Logo";
import Newsletter from "../common/Newsletter";
import SocialLinks from "../common/SocialLinks";
import ContactInfo from "../common/ContactInfo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="  pt-12 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Empowering communities through volunteerism. Connect, serve, and make a difference together.
            </p>
            <ContactInfo />
          </div>

          {/* Quick Links */}
          <FooterLinks
            title="Quick Links"
            links={[
              { label: 'About us', href: '/about' },
              { label: 'Events', href: '/events' },
              { label: 'Organizations', href: '/organizations' },
              { label: 'Volunteer', href: '/volunteer' },
              { label: 'Blog', href: '/blog' }
            ]}
          />

          {/* Support Links */}
          <FooterLinks 
            title="Support"
            links={[
              { label: 'Help Center', href: '/help' },
              { label: 'Contact Us', href: '/contact' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'FAQ', href: '/faq' }
            ]}
          />

          {/* Newsletter */}
          <Newsletter />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {currentYear} Aidevo. All rights reserved. Made with ❤️ for better communities.
          </p>

          {/* Social Links */}
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
};

export default Footer;