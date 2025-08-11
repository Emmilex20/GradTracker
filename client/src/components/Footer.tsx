import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa'; // Import social icons

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-neutral-400">
      {/* Top Border with Gradient */}
      <div className="h-1 bg-gradient-to-r from-blue-400 to-primary"></div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-neutral-700 pb-8">

          {/* Column 1: Brand Info */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <Link to="/" className="text-3xl font-extrabold text-white mb-2 transform hover:scale-105 transition-all duration-300 inline-block">
              Grad Tracker 🎓
            </Link>
            <p className="text-sm mt-4">
              Your all-in-one platform for managing the graduate school application process.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-primary transition-colors duration-300">Home</Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-primary transition-colors duration-300">Features</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors duration-300">Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors duration-300">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors duration-300">Contact</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors duration-300">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Resources */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-300">Blog</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-300">Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-300">FAQs</a>
              </li>
            </ul>
          </div>

          {/* Column 5: Social Media */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" aria-label="Twitter" className="text-xl hover:text-primary transition-colors duration-300">
                <FaTwitter />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-xl hover:text-primary transition-colors duration-300">
                <FaLinkedin />
              </a>
              <a href="#" aria-label="GitHub" className="text-xl hover:text-primary transition-colors duration-300">
                <FaGithub />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div className="text-center mt-8">
          <p className="text-sm">&copy; {currentYear} Grad Tracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;