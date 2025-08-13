import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative text-neutral-300 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-blue-900 to-primary animate-gradient-move"></div>

      {/* Top Border with Pulsing Gradient */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-primary to-pink-500 animate-pulse-slow"></div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-neutral-700 pb-8 animate-fade-in">

          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <Link to="/" className="text-3xl font-extrabold text-white mb-2 inline-block transform hover:scale-105 transition-all duration-300">
              Grad Tracker 🎓
            </Link>
            <p className="text-sm mt-4 opacity-80">
              Your all-in-one platform for managing the graduate school application process.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Features', 'Dashboard'].map((item, idx) => (
                <li key={idx}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="hover:text-primary transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Contact', 'Privacy Policy'].map((item, idx) => (
                <li key={idx}>
                  <Link to={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Blog', 'Support', 'FAQs'].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="hover:text-primary transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              {[{ Icon: FaTwitter, label: 'Twitter' }, { Icon: FaLinkedin, label: 'LinkedIn' }, { Icon: FaGithub, label: 'GitHub' }].map((social, idx) => (
                <a key={idx} href="#" aria-label={social.label} className="text-xl hover:text-primary transition-all duration-300 hover:scale-110 hover:shadow-glow">
                  <social.Icon />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="text-center mt-8 text-sm opacity-80 animate-fade-in">
          &copy; {currentYear} Grad Tracker. All rights reserved.
        </div>
      </div>

      {/* Tailwind Animations */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradientMove 12s ease infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-fade-in {
          animation: fadeIn 1.2s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover\\:shadow-glow:hover {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
