/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineLoading3Quarters,
  AiOutlineWarning,
} from 'react-icons/ai';

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const { signup, loginWithGoogle, saveUserData } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signup(email, password);
      await saveUserData(userCredential.user.uid, { firstName, lastName, email });
      navigate('/');
    } catch (err: any) {
      setError('⚠️ Failed to create an account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError('⚠️ Failed to sign up with Google: ' + err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-100 py-20">
      {/* Left side banner for large screens */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-primary p-12 animate-fade-in rounded-l-3xl shadow-lg">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700 ease-in-out opacity-25 rounded-l-3xl"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          }}
        />
        <div className="relative z-10 text-white max-w-lg space-y-6 text-left">
          <h1 className="text-5xl font-extrabold leading-tight animate-slide-up drop-shadow-lg">
            Begin your journey to success.
          </h1>
          <p className="text-xl animate-slide-up animation-delay-300 drop-shadow-md">
            Create an account to start tracking your graduate school applications with confidence.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10 bg-white animate-fade-in rounded-r-3xl shadow-xl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center animate-slide-up">
            <h2 className="text-4xl font-extrabold text-secondary tracking-wide">Grad Tracker</h2>
            <p className="mt-2 text-neutral-600 font-medium">Create a new account</p>
          </div>

          {/* Google signup button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className={`w-full flex items-center justify-center gap-3 bg-white text-secondary font-semibold py-3 px-6 rounded-full text-lg border border-neutral-300 shadow-md hover:bg-neutral-50 transition-all duration-300 animate-slide-up animation-delay-200 ${
              googleLoading ? 'cursor-wait opacity-70' : ''
            }`}
          >
            {googleLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin" size={22} />
            ) : (
              <FaGoogle size={20} />
            )}
            {googleLoading ? 'Signing up...' : 'Continue with Google'}
          </button>

          {/* Separator */}
          <div className="flex items-center my-6 animate-slide-up animation-delay-300">
            <div className="flex-grow border-t border-neutral-300" />
            <span className="mx-4 text-neutral-500 font-medium">or</span>
            <div className="flex-grow border-t border-neutral-300" />
          </div>

          {/* Email/password signup form */}
          <form onSubmit={handleEmailSignup} className="space-y-6">
            {error && (
              <p className="flex items-center gap-2 text-red-600 text-sm text-center mb-4 animate-slide-up animation-delay-300 font-semibold">
                <AiOutlineWarning size={18} /> {error}
              </p>
            )}

            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-secondary font-semibold mb-2" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base"
                  placeholder="John"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-secondary font-semibold mb-2" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base"
                  placeholder="Doe"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-secondary font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base"
                placeholder="you@example.com"
                required
                disabled={loading || googleLoading}
              />
            </div>

            <div className="relative">
              <label className="block text-secondary font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 pr-12 text-base"
                placeholder="Enter your password"
                required
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 top-7 flex items-center px-4 text-secondary hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full bg-primary text-white font-bold py-3 px-4 rounded-full text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ${
                loading ? 'cursor-wait opacity-70' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <AiOutlineLoading3Quarters className="animate-spin" size={20} /> Signing up...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-neutral-600 font-medium select-none">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
