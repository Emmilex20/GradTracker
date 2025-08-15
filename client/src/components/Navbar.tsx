import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      console.error("Failed to log out");
    }
  };

  const mainLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/features", label: "Features" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  // Conditionally add links based on user role
  if (userProfile?.role === "admin") {
    mainLinks.splice(1, 0, { to: "/admin", label: "Admin Dashboard" });
    mainLinks.splice(2, 0, { to: "/admin/mentorship-connections", label: "Admin Connections" });
  }
  
  if (userProfile?.role === "mentor") {
    mainLinks.splice(1, 0, { to: "/mentor/connections", label: "My Connections" });
  }

  // Define variants with explicit type annotations for clarity
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.6 },
    exit: { opacity: 0 },
  };

  const menuVariants: Variants = {
    hidden: { x: "100%", opacity: 0, scale: 0.96 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 14,
      },
    },
    exit: { x: "100%", opacity: 0, scale: 0.96, transition: { duration: 0.25 } },
  };

  const linkVariants: Variants = {
    hidden: { x: 20, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.15 + i * 0.07,
        duration: 0.4,
        ease: "easeInOut",
      },
    }),
    exit: { x: 20, opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 w-full z-50 border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-600 tracking-tight hover:text-blue-700 transition-colors"
        >
          Grad Tracker 🎓
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {mainLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="h-6 w-0.5 bg-gray-300"></div>

          {currentUser ? (
            <>
              <Link
                to="/dashboard"
                className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow transition"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Animation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dim Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 w-72 h-full bg-white shadow-2xl z-50 border-l border-gray-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Menu Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <span className="text-lg font-bold text-blue-600">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-red-500 transition"
                >
                  <X size={26} />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto py-6 space-y-8">
                {/* Main Section */}
                <div>
                  <div className="px-6 text-xs uppercase text-gray-400 mb-3">
                    Main
                  </div>
                  <div className="flex flex-col space-y-4">
                    {mainLinks.map((link, i) => (
                      <motion.div
                        key={link.to}
                        custom={i}
                        variants={linkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <Link
                          to={link.to}
                          className="block px-6 py-3 text-gray-700 text-lg font-medium hover:bg-gray-100 rounded-r-full transition"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Account Section */}
                <div>
                  <div className="px-6 text-xs uppercase text-gray-400 mb-3">
                    Account
                  </div>
                  <div className="flex flex-col space-y-4">
                    {currentUser ? (
                      <>
                        <motion.div
                          custom={0}
                          variants={linkVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Link
                            to="/dashboard"
                            className="block px-6 py-3 text-blue-600 font-bold text-lg hover:bg-gray-100 rounded-r-full transition"
                            onClick={() => setIsOpen(false)}
                          >
                            Dashboard
                          </Link>
                        </motion.div>
                        <motion.div
                          custom={1}
                          variants={linkVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                            className="block w-full text-left px-6 py-3 text-red-500 font-bold text-lg hover:bg-gray-100 rounded-r-full transition"
                          >
                            Log Out
                          </button>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div
                          custom={0}
                          variants={linkVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Link
                            to="/login"
                            className="block px-6 py-3 text-lg hover:bg-gray-100 rounded-r-full transition"
                            onClick={() => setIsOpen(false)}
                          >
                            Log In
                          </Link>
                        </motion.div>
                        <motion.div
                          custom={1}
                          variants={linkVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Link
                            to="/signup"
                            className="block px-6 py-3 bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 rounded-r-full transition"
                            onClick={() => setIsOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;