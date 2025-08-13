import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative text-neutral-300 overflow-hidden">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-secondary to-primary animate-gradient-flow opacity-90"></div>

      {/* Top Border with Pulsing Gradient */}
      <div className="h-1 absolute top-0 left-0 w-full bg-gradient-to-r from-blue-400 via-primary to-pink-500 animate-pulse"></div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-neutral-700 pb-8 animate-fade-in-up">

          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <Link to="/" className="text-3xl font-extrabold text-white mb-2 inline-block transform hover:scale-105 transition-all duration-300">
              Grad Tracker 🎓
            </Link>
            <p className="text-sm mt-4 opacity-80 max-w-[250px] mx-auto md:mx-0">
              Your all-in-one platform for managing the graduate school application process.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Features', 'Dashboard'].map((item, idx) => (
                <li key={idx}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-neutral-300 hover:text-primary transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Contact', 'Privacy Policy'].map((item, idx) => (
                <li key={idx}>
                  <Link to={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-neutral-300 hover:text-primary transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Blog', 'Support', 'FAQs'].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-neutral-300 hover:text-primary transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex justify-center md:justify-start space-x-6">
              {[{ Icon: FaTwitter, label: 'Twitter' }, { Icon: FaLinkedin, label: 'LinkedIn' }, { Icon: FaGithub, label: 'GitHub' }].map((social, idx) => (
                <a key={idx} href="#" aria-label={social.label} className="text-2xl text-white hover:text-primary transition-all duration-300 hover:scale-110 social-glow">
                  <social.Icon />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="text-center mt-8 text-sm opacity-80 animate-fade-in-up">
          &copy; {currentYear} Grad Tracker. All rights reserved.
        </div>
      </div>

      {/* Tailwind Animations */}
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradientFlow 15s ease infinite;
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1.2s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .social-glow:hover {
          text-shadow: 0 0 8px currentColor;
        }
      `}</style>
    </footer>
  );
};

export default Footer;