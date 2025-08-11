/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import type { ConfirmationResult } from 'firebase/auth';

// Import eye icons from react-icons
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [usePhoneSignup, setUsePhoneSignup] = useState<boolean>(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { signup, loginWithGoogle, loginWithPhoneNumber, recaptchaVerifier, saveUserData } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signup(email, password);
      await saveUserData(userCredential.user.uid, { firstName, lastName, email });

      navigate('/');
    } catch (err: any) {
      setError('Failed to create an account: ' + err.message);
    }
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedPhoneNumber = `+234${phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber}`;

    try {
      if (!confirmationResult) {
        const result = await loginWithPhoneNumber(formattedPhoneNumber, recaptchaVerifier!);
        setConfirmationResult(result);
      } else {
        await confirmationResult.confirm(verificationCode);
        navigate('/');
      }
    } catch (err: any) {
      setError('Failed to sign up with phone number: ' + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError('Failed to sign up with Google: ' + err.message);
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
            Begin your journey to success.
          </h1>
          <p className="text-xl animate-slide-up animation-delay-300">
            Create an account to start tracking your graduate school applications with confidence.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white animate-fade-in">
        <div className="w-full max-w-md p-10 space-y-6">
          <div className="text-center animate-slide-up">
            <h2 className="text-4xl font-extrabold text-secondary">Grad Tracker</h2>
            <p className="mt-2 text-neutral-500">Create a new account</p>
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
          
          <form onSubmit={usePhoneSignup ? handlePhoneSignup : handleEmailSignup} className="space-y-6">
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setUsePhoneSignup(!usePhoneSignup)}
                className="text-sm text-primary font-semibold hover:underline"
              >
                {usePhoneSignup ? 'Sign up with Email instead' : 'Sign up with Phone Number instead'}
              </button>
            </div>

            {usePhoneSignup ? (
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
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="block text-secondary font-semibold mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-secondary font-semibold mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                      required
                    />
                  </div>
                </div>
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
                    type={showPassword ? 'text' : 'password'}
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

            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
            >
              {usePhoneSignup ? (confirmationResult ? 'Verify Code' : 'Send Code') : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-neutral-500">
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