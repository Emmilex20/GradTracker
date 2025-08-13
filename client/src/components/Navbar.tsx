import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Define the props interface for the NavLink component
interface NavLinkProps {
    to: string;
    label: string;
    setIsMenuOpen: (val: boolean) => void;
}

// Helper for nav links
const NavLink: React.FC<NavLinkProps> = ({ to, label, setIsMenuOpen }) => (
    <Link
        to={to}
        className="relative block px-4 py-2 text-secondary font-semibold transition-all duration-300 hover:text-primary group"
        onClick={() => setIsMenuOpen(false)}
    >
        {label}
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
    </Link>
);

const Navbar: React.FC = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            console.error('Failed to log out');
        }
    };

    const adminLink = userProfile?.role === 'admin' ? (
        <Link
            to="/admin"
            className="relative block px-4 py-2 text-secondary font-semibold transition-all duration-300 hover:text-primary group"
            onClick={() => setIsMenuOpen(false)}
        >
            Admin Dashboard
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
        </Link>
    ) : null;

    const menuItems = (
        <>
            <NavLink to="/" label="Home" setIsMenuOpen={setIsMenuOpen} />
            {adminLink}
            <NavLink to="/features" label="Features" setIsMenuOpen={setIsMenuOpen} />
            <NavLink to="/about" label="About" setIsMenuOpen={setIsMenuOpen} />
            <NavLink to="/contact" label="Contact" setIsMenuOpen={setIsMenuOpen} />
        </>
    );

    const authButtons = (
        <>
            {currentUser ? (
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0 items-center">
                    <Link
                        to="/dashboard"
                        className="relative px-6 py-3 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 border border-primary bg-primary hover:shadow-lg hover:shadow-primary/40"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dashboard
                    </Link>
                    <button
                        onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                        }}
                        className="relative px-6 py-3 bg-red-500 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/40"
                    >
                        Log Out
                    </button>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0 items-center">
                    <Link
                        to="/login"
                        className="relative px-6 py-3 text-secondary font-bold rounded-full border border-neutral-300 transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-neutral-50"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Log In
                    </Link>
                    <Link
                        to="/signup"
                        className="relative px-6 py-3 bg-primary text-white font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/40"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Sign Up
                    </Link>
                </div>
            )}
        </>
    );

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-lg bg-white/70 shadow-lg' : 'bg-white'}`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center relative">
                <Link to="/" className="text-3xl font-extrabold text-secondary hover:text-primary transition-all duration-300">
                    Grad Tracker <span className="text-yellow-500">🎓</span>
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
                        <span className={`block bg-secondary h-0.5 w-6 rounded-sm transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                        <span className={`block bg-secondary h-0.5 w-6 rounded-sm my-1 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                        <span className={`block bg-secondary h-0.5 w-6 rounded-sm transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Animated Gradient Border */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient"></div>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 w-full h-full bg-black/50 backdrop-blur-lg z-40 transform transition-all duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} md:hidden`}
                onClick={() => setIsMenuOpen(false)}
            >
                <div
                    className={`absolute top-0 right-0 w-64 h-full bg-white shadow-xl p-8 transform transition-all duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col space-y-8 mt-16">
                        {menuItems}
                        <div className="border-t border-neutral-200 pt-8"></div>
                        {authButtons}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 5s ease infinite;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;