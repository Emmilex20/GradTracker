/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import type { ConfirmationResult } from 'firebase/auth';

// Import eye icons from react-icons
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [usePhoneLogin, setUsePhoneLogin] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false); // <-- New state

  const { login, loginWithGoogle, loginWithPhoneNumber, recaptchaVerifier } = useAuth();
  const navigate = useNavigate();
  
  // New function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError('Failed to log in: ' + err.message);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (!confirmationResult) {
        // Step 1: Send the SMS code
        const result = await loginWithPhoneNumber(phoneNumber, recaptchaVerifier!);
        setConfirmationResult(result);
      } else {
        // Step 2: Verify the SMS code
        await confirmationResult.confirm(verificationCode);
        navigate('/');
      }
    } catch (err: any) {
      setError('Failed to log in with phone number: ' + err.message);
    }
  };
  
  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError('Failed to log in with Google: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-100 py-20">
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-primary p-12 animate-fade-in">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 ease-in-out opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
        ></div>
        <div className="relative z-10 text-white text-left max-w-lg space-y-4">
          <h1 className="text-5xl font-extrabold leading-tight animate-slide-up">
            Your journey to success starts here.
          </h1>
          <p className="text-xl animate-slide-up animation-delay-300">
            Log in to manage your graduate school applications with confidence and clarity.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white animate-fade-in">
        <div className="w-full max-w-md p-10 space-y-6">
          <div className="text-center animate-slide-up">
            <h2 className="text-4xl font-extrabold text-secondary">Grad Tracker</h2>
            <p className="mt-2 text-neutral-500">Log in to your account</p>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-secondary font-bold py-3 px-4 rounded-full text-lg border border-neutral-300 shadow-sm hover:bg-neutral-100 transition-all duration-300 animate-slide-up animation-delay-200"
          >
            <FaGoogle size={20} />
            Continue with Google
          </button>
          
          <div className="flex items-center my-6 animate-slide-up animation-delay-300">
            <div className="flex-grow border-t border-neutral-300"></div>
            <span className="mx-4 text-neutral-500">or</span>
            <div className="flex-grow border-t border-neutral-300"></div>
          </div>
          
          <form onSubmit={usePhoneLogin ? handlePhoneLogin : handleEmailPasswordLogin} className="space-y-6">
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setUsePhoneLogin(!usePhoneLogin)}
                className="text-sm text-primary font-semibold hover:underline"
              >
                {usePhoneLogin ? 'Log in with Email instead' : 'Log in with Phone Number instead'}
              </button>
            </div>

            {/* Conditionally render Email/Password or Phone Number inputs */}
            {usePhoneLogin ? (
              <>
                {!confirmationResult && (
                  <div>
                    <label className="block text-secondary font-semibold mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                      required
                    />
                  </div>
                )}
                {confirmationResult && (
                  <div>
                    <label className="block text-secondary font-semibold mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                      required
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-secondary font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-secondary font-semibold mb-2">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'} // <-- Conditional type
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 top-7 flex items-center px-4 text-secondary hover:text-primary transition-colors"
                  >
                    {showPassword ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
                  </button>
                </div>
              </>
            )}

            <Link to="/forgot-password" className="text-sm text-primary font-semibold hover:underline block text-right">
              Forgot password?
            </Link>
            
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
            >
              {usePhoneLogin ? (confirmationResult ? 'Verify Code' : 'Send Code') : 'Log In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-neutral-500">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;