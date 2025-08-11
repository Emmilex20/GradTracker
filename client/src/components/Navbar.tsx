import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      console.error('Failed to log out');
    }
  };

  const menuItems = (
    <>
      <Link
        to="/"
        className="relative block px-4 py-2 text-secondary font-semibold transition-all duration-300 transform hover:scale-105 md:inline-block md:hover:bg-transparent md:p-0 group"
        onClick={() => setIsMenuOpen(false)}
      >
        Home
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
      </Link>
      <Link
        to="/features"
        className="relative block px-4 py-2 text-secondary font-semibold transition-all duration-300 transform hover:scale-105 md:inline-block md:hover:bg-transparent md:p-0 group"
        onClick={() => setIsMenuOpen(false)}
      >
        Features
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
      </Link>
      <Link
        to="/about"
        className="relative block px-4 py-2 text-secondary font-semibold transition-all duration-300 transform hover:scale-105 md:inline-block md:hover:bg-transparent md:p-0 group"
        onClick={() => setIsMenuOpen(false)}
      >
        About
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
      </Link>
      <Link
        to="/contact"
        className="relative block px-4 py-2 text-secondary font-semibold transition-all duration-300 transform hover:scale-105 md:inline-block md:hover:bg-transparent md:p-0 group"
        onClick={() => setIsMenuOpen(false)}
      >
        Contact
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
      </Link>
    </>
  );

  const authButtons = (
    <>
      {currentUser ? (
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0 items-center">
          <Link
            to="/dashboard"
            className="relative w-full md:w-auto text-center px-6 py-3 text-white font-bold transition-all duration-300 transform hover:scale-105 border border-primary rounded-full bg-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
            className="relative w-full md:w-auto text-center px-6 py-3 bg-red-500 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0 items-center">
          <Link
            to="/login"
            className="relative w-full md:w-auto text-center px-6 py-3 text-secondary font-bold transition-all duration-300 transform hover:scale-105 border border-neutral-300 rounded-full"
            onClick={() => setIsMenuOpen(false)}
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="relative w-full md:w-auto text-center px-6 py-3 bg-primary text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg transition-all duration-500">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center relative">
        <Link to="/" className="text-3xl font-extrabold text-secondary transform hover:scale-105 transition-all duration-300">
          Grad Tracker <span className="text-yellow-500 transform hover:scale-125 transition-all duration-300">🎓</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {menuItems}
          <div className="h-8 w-0.5 bg-neutral-300 mx-2"></div>
          {authButtons}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center z-50">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-secondary focus:outline-none relative w-8 h-8 flex flex-col justify-center items-center"
          >
            <div
              className={`block bg-secondary h-0.5 w-6 rounded-sm transform transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            ></div>
            <div
              className={`block bg-secondary h-0.5 w-6 rounded-sm my-1 transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            ></div>
            <div
              className={`block bg-secondary h-0.5 w-6 rounded-sm transform transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            ></div>
          </button>
        </div>
      </div>
      {/* Gradient Border for Navbar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-primary"></div>
      
      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 w-full h-full bg-black/50 backdrop-blur-lg z-40 transform transition-all duration-500 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } md:hidden`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 right-0 w-64 h-full bg-white shadow-xl p-8 transform transition-all duration-500 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col space-y-8 mt-16">
            {menuItems}
            <div className="border-t border-neutral-200 pt-8"></div>
            {authButtons}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;